import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from firebaseconfig import test_firebase_connection, get_user_by_uid
import firebase_admin

# Test firebase connection
def main():
    """
    Test firebase admin SDK
    """
    print("Testing Firebase connection")
    if test_firebase_connection():
        print("Firebase connection successful")
    else:
        print("Firebase connection failed")
        return
 
# Ensures this code only runs when you execute this file directly
if __name__ == "__main__":
    main()
