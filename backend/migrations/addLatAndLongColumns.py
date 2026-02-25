import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import text
from databases import engine

# Migration script to add user_id column to recordings table
def add_lat_lon_columns():
    """
    Add latitude and longitude columns to the recordings table
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                ALTER TABLE recordings
                ADD COLUMN IF NOT EXISTS latitude FLOAT;
            """))
            conn.execute(text("""
                ALTER TABLE recordings
                ADD COLUMN IF NOT EXISTS longitude FLOAT;
            """))
            conn.commit()
            print("latitude and longitude columns added successfully")
    except Exception as e:
        print("Error adding latitude/longitude columns:", e)

if __name__ == "__main__":
    add_lat_lon_columns()