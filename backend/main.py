# Import the FastAPI class to create the app and necessary modules for file handling
from fastapi import FastAPI, File, UploadFile, Form
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


# Define a route for the root URL "/" with a default message too
@app.get("/")
def read_root():
    return {
        "message": "Bird Identifier API is running!",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
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

# Endpoint to handle audio file uploads
# This receives an audio file and optional duration from the frontend
@app.post("/upload-audio")
# Async as to avoid blocking the server while waiting for slow operations (file uploads)
async def upload_audio(
    audio: UploadFile = File(...), # Ellipsis ensures this field is required
    duration: str = Form(None)
):
    """
    Endpoint to receive audio recordings from the frontend.
    
    Parameters:
    - audio: The audio file (Default Expo m4a format)
    - duration: Recording duration in seconds (optional)
    
    Returns:
    - Success message with file details
    """
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
        file_path = UPLOAD_DIR / unique_filename
        
        # Use with to safely open/close the file incase an error happens
        # Open the target file path &
        # Specify write binary mode as buffer because audio is binary not text
        with file_path.open("wb") as buffer:
            # Then copy the contents of the uploaded audio file into this buffer using shutil
            shutil.copyfileobj(audio.file, buffer)
        
        # Get file size in bytes using .stat() and st.size tells me exact file size
        file_size = file_path.stat().st_size
        # Convert bytes to megabytes, and round to 2 decimal places
        file_size_mb = round(file_size / (1024 * 1024), 2)
        
        # Log the successful upload
        print(f"Audio file saved successfully:")
        print(f"Filename: {unique_filename}")
        print(f"Size: {file_size_mb} MB")
        print(f"Duration: {duration} seconds")
        print(f"Path: {file_path.absolute()}")
        
        # Return a success response as a dictionary as it's standard for fastAPI to parse easily
        return {
            "success": True,
            "message": "Audio file uploaded and saved successfully",
            "filename": unique_filename,
            "original_filename": original_filename,
            "file_path": str(file_path.absolute()),  # Convert path object to string
            "size_bytes": file_size,
            "size_mb": file_size_mb,
            "duration_seconds": duration,
            "timestamp": timestamp
        }
    
    # Handle exceptions during file upload
    except Exception as e:
        print(f"Error uploading audio: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to upload audio: {str(e)}"
        }
