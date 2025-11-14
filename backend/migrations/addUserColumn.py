# Interact with the opperating system e.g file paths
import os
# Provides access to system specific parameters and functions
import sys
# Adds the parent directory of the current file to the python module search path
# This allows importing modules from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import text for raw SQL execution
from sqlalchemy import text
# Import database engine
from databases import engine

# Migration script to add user_id column to recordings table
def add_user_id_column():
    """
    Add user_id column to the recordings table
    This links recordings with sepcific firebase users
    """

    try:
        # Add user_id column to recordings table (nullable, for now, for existing records)
        # Open a connection to the database
        with engine.connect() as conn:
            # Execute a transaction. Use if not exists to avoid errors if the column already exists
            conn.execute(text("""
                ALTER TABLE recordings
                ADD COLUMN IF NOT EXISTS user_id VARCHAR(128);
            """))
            # Commit the transaction
            conn.commit()

            # Print success message
            print("user_id column added to recordings table successfully")

    # Catch any exceptions and print an error message
    except Exception as e:
        print("Error adding user_id column to recordings table")

# Run the following code only when this file is executed directly
# not when it is imported
if __name__ == "__main__":
    add_user_id_column()