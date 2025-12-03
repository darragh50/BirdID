# Interact with the opperating system e.g file paths
import os
# Provides access to system specific parameters and functions
import sys
import pytest
# Adds the parent directory of the current file to the python module search path
# This allows importing modules from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from firebaseconfig import test_firebase_connection, get_user_by_uid
import firebase_admin

# Test firebase connection
@pytest.mark.integration
def main():
    """
    Test firebase admin SDK
    """
    print("Testing Firebase connection")
    # Test firebase connection by calling function
    if test_firebase_connection():
        print("Firebase connection successful")
    else:
        # If connection fails, exit
        print("Firebase connection failed")
        return
 
# Ensures this code only runs when you execute this file directly
if __name__ == "__main__":
    main()
