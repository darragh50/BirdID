# Import SQLAlchemy database engine and Base
from databases import engine, Base
from models import Recordings

# Initialize the database and create all tables
def init_database():
    """
    Initializes all database tables defined in models.py
    """
    # Look at all classes that inherit from Base 
    # Create their corresponding tables in the database if they don’t exist yet
    Base.metadata.create_all(bind=engine)
    print("Database initialized with all tables")

# Run the initialization when this script is executed directly
if __name__ == "__main__":
    init_database()