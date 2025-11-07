from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Database URL from environment variable
# Rather than having it hardcoded, 
# I fetch it from an environment variable for security and flexibility
DATABASE_URL = os.getenv("DATABASE_URL")

# Ensure DATABASE_URL is set and return an error if not
if not DATABASE_URL:
    raise ValueError("DATABASE_URL variable is not set")

# Create databse engine
engine = create_engine(DATABASE_URL)

# Create a session factory 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()

# Dependency to get a DB session
def get_db():
    """
    Generator function that provides a database session
    Ensures it is closed after use
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()