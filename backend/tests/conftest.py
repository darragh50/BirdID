"""
Pytest configuration and shared fixtures

This file defines reusable components that my tests can use
Pytest automatically loads any file named "conftest.py" in the test directory
"""
import os
import sys
import pytest
from fastapi.testclient import TestClient

# Allow tests to import the main FastAPI app and database
# Add the parent directory to Python's import path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from main import app
from databases import Base, engine, SessionLocal

# Test client fixture
@pytest.fixture(scope="function")
def client():
    """
    Creates a fresh FastAPI TestClient for each test function.

    - Allows you to make requests like client.get("/endpoint")
    - Does not require the app to run on a real server
    - Perfect for unit and API endpoint testing
    """
    return TestClient(app)

# Database fixture
@pytest.fixture(scope="function")
def test_db():
    """
    Creates a temporary database session for testing

    What it does:
      - Ensures tables are created before tests run
      - Opens a new database session for each test
      - Yields the session so the test can use it
      - Closes the session afterward
    """
    # Create all tables (safe to call repeatedly)
    Base.metadata.create_all(bind=engine)
    
    # Start database session
    db = SessionLocal()
    
    try:
        yield db  # this is where the test runs
    finally:
        db.close()  # Close the session


# Mock Firebase token fixture
@pytest.fixture(scope="function")
def mock_firebase_token():
    """
    Provides a mock Firebase authentication token

    Used for endpoints that require authentication

    This avoids having to call Firebase during tests
    making your tests faster and more reliable
    """
    return "mock_test_token_12345"
