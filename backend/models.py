from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from databases import Base

class Recordings(Base):
    """
    Database model for storing bird recording metadata
    In future, actual audio files will be stored in AWS S3
    """

    # Table name in the database
    __tablename__ = "recordings"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # User information (links to Firebase user)
    user_id = Column(String(128), nullable=True, index=True)

    # File information
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=True)
    # Path to the audio file in S3 bucket 
    file_path = Column(String, nullable=False)

    # Audio metadata
    duration = Column(Float, nullable=True)
    file_size_bytes = Column(Integer, nullable=False)
    file_size_mb = Column(Float, nullable=False) 

    # Bird identification results (I will use BirdNET model later)
    identified_species = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)

    # Timestamps
    upload_time = Column(DateTime(timezone=True), server_default=func.now()) 
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # String representation for debugging
    # Specifically prints id, filename, and identified species
    def __repr__(self):
        return f"<Recordings(id={self.id}, user_id={self.user_id}, filename={self.filename}, bird={self.identified_species})>"