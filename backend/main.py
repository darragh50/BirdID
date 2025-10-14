# Import the FastAPI class to create the app
from fastapi import FastAPI
# Import CORS middleware to allow cross-origin requests (frontend can access backend)
from fastapi.middleware.cors import CORSMiddleware

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

# Define a route for the root URL "/" with a default message too
@app.get("/")
def read_root():
    return {"message": "Bird Identifier API is running!"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}