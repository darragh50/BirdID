from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database connection URL for PostgreSQL
# Format : postgresql://<username>:<password>@<host>:<port>/<database_name>
DATABASE_URL = "postgresql://postgres:admin@localhost:5432/bird_identifer_db"

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