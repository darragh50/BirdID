# Interact with the opperating system e.g file paths
import os
# Provides access to system specific parameters and functions
import sys
import pytest
# Adds the parent directory of the current file to the python module search path
# This allows importing modules from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import database session and engine
from databases import SessionLocal, engine
# Import the Recordings model
from models import Recordings
# Import text for raw SQL execution
from sqlalchemy import text

# Function to test database connection and basic operations
@pytest.mark.integration
def test_():
    """
    Quick test to verify database connection and basic operations
    """

    # Test database connection
    try:
        # Create a new database session
        db = SessionLocal()
        # Execute a simple query to test connection
        result = db.execute(text("SELECT 1"))
        print("connect success")
    # Handle exceptions if connection fails
    except Exception as e:
        print("connect fail:", e)
        return
    
    # Test on querying the Recordings table
    try:
        count = db.query(Recordings).count()
        print(f"Recordings table has {count} records")
    except Exception as e:
        print("Query fail:", e)
        return
    
    # Test by inserting a dummy record (m4a is expo's default audio format)
    try:
        dummy_record = Recordings(
            filename="test.m4a",
            original_filename="test1.m4a",
            file_path="/uploads/test.m4a",
            duration=12.34,
            file_size_bytes=123456,
            file_size_mb=0.12
        )
        # Add and commit the new record
        db.add(dummy_record)
        db.commit()
        print("Insert success, new record ID:", dummy_record.id)
    
    # Delete dummy record and commit
        db.delete(dummy_record)
        db.commit()
        print("Dummy record deleted")
    
    # Handle exceptions and cleanup
    except Exception as e:
        db.rollback()
        print("Insert fail:", e)
        return
    finally:
        db.close()

    print("Test complete")

# Run the test when this script is executed directly
if __name__ == "__main__":
    test_()