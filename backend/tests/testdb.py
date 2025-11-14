from databases import SessionLocal, engine
from models import Recordings
from sqlalchemy import text

def test():
    """
    Quick test to verify database connection and basic operations
    """

    # Test database connection
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1"))
        print("connect success")
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
    
    # Test by inserting a dummy record
    try:
        dummy_record = Recordings(
            filename="test.m4a",
            original_filename="test1.m4a",
            file_path="/uploads/test.m4a",
            duration=12.34,
            file_size_bytes=123456,
            file_size_mb=0.12
        )
        db.add(dummy_record)
        db.commit()
        print("Insert success, new record ID:", dummy_record.id)
    
    # Delete dummy record
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
    test()