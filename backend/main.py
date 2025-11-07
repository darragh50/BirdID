# Import the FastAPI class to create the app and necessary modules for file handling
from fastapi import FastAPI, File, UploadFile, Form, Depends
# Import CORS middleware to allow cross-origin requests (frontend can access backend)
from fastapi.middleware.cors import CORSMiddleware
# Import Path from pathlib to handle file paths
from pathlib import Path
# Import datetime for timestamping files
from datetime import datetime
# Import shutil to save uploaded files
import shutil
# Import os for operating system interactions
import os
# Import database session 
from databases import SessionLocal, engine, get_db
# Import text for raw SQL queries
from sqlalchemy import text
# Import Session
from sqlalchemy.orm import Session
# Import database models
from models import Recordings, Base
# Import s3config functions
from s3config import upload_file_to_s3, delete_file_from_s3, test_s3_connection

# Create a FastAPI instance
app = FastAPI(title="Bird Identifier API")

# Allow frontend to connect (cors)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # My frontend URL in future
    allow_credentials=True, # Allow cookies
    allow_methods=["*"], # GET, POST, PUT, DELETE
    allow_headers=["*"], 
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Test database connection on startup
@app.on_event("startup")
async def startup_event():
    """
    Run on app startup
    Test database connection to ensure it's working
    """
    print("Testing S3 connection")
    if test_s3_connection():
        print("S3 connection successful")
    else:
        print("S3 connection failed")


# Define a route for the root URL "/" with a default message too
@app.get("/")
def read_root():
    return {
        "message": "Bird Identifier API is running!",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "database_health": "/health/database",
            "s3_health": "/health/s3",
            "upload": "/upload-audio"
        }
    }

# Health check endpoint
# Verify that the backend and upload folder are ready
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "upload_directory": str(UPLOAD_DIR.absolute()), # Ensures full absolute path
        "upload_directory_exists": UPLOAD_DIR.exists()  # Check if upload directory exists too
    }

# Database health check endpoint
@app.get("/health/database")
def database_health_check():
    """
    Check if the database connection is working
    """
    # Test database connection
    try:
        # Create a new database session
        db = SessionLocal()
        # Execute a simple query to verify connection
        db.execute(text("SELECT 1"))
        db.close()

        # If successful, return healthy status
        return{
            "status": "healthy",
            "database": "connected",
            "message": "PostgreSQL connection successful"
        }
    # Else, catch exceptions and return unhealthy status
    except Exception as e:
        return{
            "status": "unhealthy",
            "database": "disconnected",
            "message": {str(e)}
        }
    
# S3 health check endpoint
@app.get("/health/s3")
def s3_health_check():
    """
    Check if the S3 connection is working
    """
    if test_s3_connection():
        return {
            "status": "healthy",
            "s3": "connected",
            "message": "S3 connection successful"
        }
    else:
        return {
            "status": "unhealthy",
            "s3": "disconnected",
            "message": "Failed to connect to S3"
        }

# Endpoint to handle audio file uploads
# This receives an audio file and optional duration from the frontend
@app.post("/upload-audio")
# Async as to avoid blocking the server while waiting for slow operations (file uploads)
async def upload_audio(
    audio: UploadFile = File(...), # Ellipsis ensures this field is required
    duration: str = Form(None),
    db: Session = Depends(get_db) # Get database session via dependency injection
):
    """
    Endpoint to receive audio recordings from the frontend
    Uploads to S3 and saves S3 URL to database
    
    Parameters:
    - audio: The audio file (Default Expo m4a format)
    - duration: Recording duration in seconds (optional)
    - db: Database session
    
    Returns:
    - Success message with file details, database record ID, and S3 URL
    """
    # Initialize temp_file_path to None
    temp_file_path = None

    try:
        # Generate unique filename with timestamp
        # strftime() formats datetime object in the desired string format
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        # Get original file extension or give it a fallback name
        original_filename = audio.filename or "recording.m4a"
        # Extract file extension. .suffix will include the dot (.m4a)
        file_extension = Path(original_filename).suffix
        # Then assign a unique filename
        unique_filename = f"bird_recording_{timestamp}{file_extension}"
        
        # Full path where file will be saved. UPLOAD_DIR is a Path object
        temp_file_path = UPLOAD_DIR / unique_filename
        
        # Use with to safely open/close the file incase an error happens
        # Open the target file path &
        # Specify write binary mode as buffer because audio is binary not text
        with temp_file_path.open("wb") as buffer:
            # Then copy the contents of the uploaded audio file into this buffer using shutil
            shutil.copyfileobj(audio.file, buffer)
        
        # Get file size in bytes using .stat() and st.size tells me exact file size
        file_size = temp_file_path.stat().st_size
        # Convert bytes to megabytes, and round to 2 decimal places
        file_size_mb = round(file_size / (1024 * 1024), 2)

        # Upload the file to S3
        s3_url = upload_file_to_s3(str(temp_file_path), unique_filename)

        # If S3 upload failed, raise an exception
        if not s3_url:
            raise Exception("Failed to upload file to S3")
        
        print(f"File uploaded to S3 successfully")

        # Convert duration to float if provided, else None
        duration_float = float(duration) if duration else None

        # Create database record 
        db_recording = Recordings(
            filename = unique_filename,
            original_filename = original_filename,
            file_path = s3_url,
            duration = duration_float,
            file_size_bytes = file_size,
            file_size_mb = file_size_mb
        )

        # Add and commit the new record to the database
        db.add(db_recording)
        db.commit()
        db.refresh(db_recording)  # Refresh to get the generated ID & timestamp
        
        # Log the successful database upload
        print(f"Audio file saved successfully:")
        print(f"ID: {db_recording.id}")
        print(f"Filename: {unique_filename}")
        print(f"S3 URL: {s3_url}")
        print(f"Size: {file_size_mb} MB")
        print(f"Duration: {duration} seconds")

        # Clean up temp file
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
        
        # Return success response with file and database details
        return {
            "success": True,
            "message": "Audio file uploaded and successfully saved to S3",
            "database_id": db_recording.id,
            "filename": unique_filename,
            "original_filename": original_filename,
            "s3_url": s3_url, 
            "storage": "S3",
            "size_bytes": file_size,
            "size_mb": file_size_mb,
            "duration_seconds": duration_float,
            "timestamp": timestamp,
            "upload_time": db_recording.upload_time.isoformat() if db_recording.upload_time else None # ISO format and handle case of no timestamp set
        }
    
    # Handle exceptions during file upload
    except Exception as e:
        print(f"Error uploading audio: {str(e)}")

        # Clean up temp file if it exists
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()

        db.rollback()  # Rollback in case of error during DB operations
        return {
            "success": False,
            "message": f"Failed to upload audio: {str(e)}"
        }
    
# Endpoint to retrieve all stored recordings from the database
@app.get("/recordings")
def get_recordings(db: Session = Depends(get_db)):
    """
    Retrieve all recordings from the database
    Returns a list of recordings with their metadata
    """
    try:
        # Query all recordings and order them by newest first using upload_time
        recordings = db.query(Recordings).order_by(Recordings.upload_time.desc()).all()
        
        # Prepare a list to hold formatted recording data
        recordings_list = []
        
        # Loop through each database record and format the data for JSON response
        for recording in recordings:
            recordings_list.append({
                "id": recording.id,
                "filename": recording.filename,
                "original_filename": recording.original_filename,
                "s3_url": recording.file_path,
                "duration": recording.duration,
                "size_mb": recording.file_size_mb,
                "identified_species": recording.identified_species,
                "confidence_score": recording.confidence_score,
                # Convert upload_time (datetime) to ISO string for JSON serialization
                "upload_time": recording.upload_time.isoformat() if recording.upload_time else None
            })
        
        # Return the list of recordings as JSON response
        return {
            "success": True,
            "count": len(recordings_list),
            "recordings": recordings_list
        }
    
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to retrieve recordings: {str(e)}"
        }
    
# Endpoint to get a specific recording by its ID
@app.get("/recordings/{recording_id}")
def get_recording_by_id(recording_id: int, db: Session = Depends(get_db)):
    """
    Get a specific recording by its ID
    """
    try:
        # Query the database for a recording that matches the given ID
        recording = db.query(Recordings).filter(Recordings.id == recording_id).first()

        # If no matching record is found, return an error response
        if not recording:
            return {
                "success": False,
                "message": f"Recording with ID {recording_id} not found."
            }
        
        # If the recording exists, return all its details as JSON
        return {
            "success": True,
            "recording": {
                "id": recording.id,
                "filename": recording.filename,
                "original_filename": recording.original_filename,
                "s3_url": recording.file_path,
                "duration": recording.duration,
                "size_bytes": recording.file_size_bytes,
                "size_mb": recording.file_size_mb,
                "identified_species": recording.identified_species,
                "confidence_score": recording.confidence_score,
                "upload_time": recording.upload_time.isoformat() if recording.upload_time else None,
                "updated_at": recording.updated_at.isoformat() if recording.updated_at else None
            }
        }
    
    # Handle exceptions during retrieval
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to retrieve recording: {str(e)}"
        }
    
# Endpoint to list all recordings in the upload directory
# This is useful for debugging and verifying uploads
@app.get("/list-recordings")
def list_recordings():
    """
    List all recordings currently stored on the backend
    Useful for debugging and seeing what's been uploaded
    """
    try:
        # Create an empty list to hold all the file details
        recordings = []
        
        # Loop through every file in the uploads directory
        # Path.glob("*") lists all items in the given path
        for file_path in UPLOAD_DIR.glob("*"):
            # Only process actual files (not directories/folders)
            if file_path.is_file():
                # Get file size in bytes using .stat and st.size
                file_size = file_path.stat().st_size
                # Convert bytes to megabytes, rounded to 2 decimal places, like before
                file_size_mb = round(file_size / (1024 * 1024), 2)
                
                # Add each file's details to the list
                recordings.append({
                    "filename": file_path.name,
                    "size_mb": file_size_mb,
                    "upload_time": datetime.fromtimestamp(
                        file_path.stat().st_ctime # Timestamp of creation time using stat and st_ctime
                    ).strftime("%Y-%m-%d %H:%M:%S")
                })
        
        # Then return a json response to the client with all recordings
        return {
            "success": True,
            "count": len(recordings), # Number of recordings found
            "recordings": recordings, # List of recording details
            "upload_directory": str(UPLOAD_DIR.absolute()) # Absolute path for reference
        }
    
    # Handle exceptions during listing recordings
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to list recordings: {str(e)}"
        }

# Endpoint to delete a specific recording by id
@app.delete("/recordings/{recording_id}")
def delete_recording(recording_id: int, db: Session = Depends(get_db)):
    """
    Delete a specific recording from the database and file system
    """
    try:
        recording = db.query(Recordings).filter(Recordings.id == recording_id).first()
        
        # Check if the file actually exists
        # If not, return a message
        if not recording:
            return {
                "success": False,
                "message": f"Recording with ID {recording_id} not found in database."
            }
        
        # If it exists, delete the file using unlink()
        file_path = Path(recording.file_path)
        if file_path.exists():
            file_path.unlink()
            print(f"Deleted file: {file_path}")

        # Then delete the database record
        db.delete(recording)
        db.commit()
        
        # Return a success message to confirm deletion
        return {
            "success": True,
            "message": f"Recording {recording_id} deleted:"
        }
    
    # Handle exceptions during deleting recordings
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to delete recording: {str(e)}"
        }
    
# Endpoint to delete a specific audio file by its filename (not by database ID)
@app.delete("/delete-recording/{filename}")
def delete_recordings_by_filename(filename: str):
    """
    Delete a specific recording from the backedn by filename
    """

    try:
        # Construct the full file path by combining the uploads directory and the filename
        file_path = UPLOAD_DIR / filename
        
        # Check if the file actually exists before attempting deletion
        if not file_path.exists():
            # If the file isn't found, return an error response
            return {
                "success": False,
                "message": f"File {filename} not found."
            }
        
        # If the file exists, delete it using Path.unlink()
        file_path.unlink()
        
        # Return a success response confirming deletion
        return {
            "success": True,
            "message": f"File {filename} deleted successfully."
        }
    
    # Handle exceptions during file deletion
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to delete file: {str(e)}"
        }
    
