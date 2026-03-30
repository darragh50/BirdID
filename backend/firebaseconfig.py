import firebase_admin
from firebase_admin import credentials, auth
import os
import json
import base64

# Check if we're in production (railway) or local
if os.getenv('FIREBASE_CREDENTIALS_BASE64'):
    # Fpr production decode base64 credentials
    print("Using Firebase credentials from environment variable")
    cred_base64 = os.getenv('FIREBASE_CREDENTIALS_BASE64')
    cred_json = base64.b64decode(cred_base64).decode('utf-8')
    cred_dict = json.loads(cred_json)
    cred = credentials.Certificate(cred_dict)
else:
    # Locally use file
    print("Using Firebase credentials from file (Local)")
    # Path to Firebase service account key JSON file
    FIREBASE_CREDENTIALS_PATH = "bird-identifier-9f5e5-firebase-adminsdk-fbsvc-147b255c1d.json"

    # Check if the credentials file exists 
    if not os.path.exists(FIREBASE_CREDENTIALS_PATH):
         raise FileNotFoundError(f"Firebase credentials file not found at {FIREBASE_CREDENTIALS_PATH}")

    # Load credentials from the JSON file
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)

# Initialize Firebase admin SDK
try: 
    firebase_admin.initialize_app(cred)
    print("Firebase admin initialized successfully")
except Exception as e:
    print("Error initializing Firebase admin:", e)
    raise

# Function to verify Firebase ID tokens
def verify_firebase_token(id_token: str):
    """
    Verify a firebase ID token sent from the client

    Args:
        id_token (str): The Firebase ID token to verify
    
    Returns:
        dict: Decoded token information if verification is successful (uid, email etc)
    
    Raises:
        ValueError: If the token is invalid/expired or verification fails
    """

    try:
        # Verify the token with Firebase Admin SDK
        decoded_token = auth.verify_id_token(id_token)
        # Return the decoded token information or raise an error if verification fails
        return decoded_token
    except auth.InvalidIdTokenError:
        raise ValueError("Invalid Firebase token")
    except auth.ExpiredIdTokenError:
        raise ValueError("Firebase token has expired")
    except Exception as e:
        raise ValueError(f"Token verification failed: {str(e)}")
    
# Function to get user information by UID
def get_user_by_uid(uid: str):
    """
    Get Firebase user information by UID

    Args:
        uid (str): The UID of the Firebase user

    Returns:
        dict: User information (email, display name, etc)
    """
    
    try:
        # Call firebase Admin SDK method auth.get_user(uid)
        user = auth.get_user(uid)
        # If the UID exists return a UserRecord object (dictionary) containing the user’s details
        return{
            "uid": user.uid,
            "email": user.email,
            "email_verified": user.email_verified,
            "disabled": user.disabled,
            "created_at": user.user_metadata.creation_timestamp
        }
    # Else raise an error
    except Exception as e:
        raise ValueError(f"Failed to get user by UID: {str(e)}")
    
# Test firebase connection
def test_firebase_connection():
    """
    Test firebase admin SDK
    """
    try:
        # Attempt to list users to test connection and return True if successful
        users = auth.list_users().users
        print("Successfully connected to Firebase")
        return True
    # Catch any exceptions and return False
    except Exception as e:
        print("Failed to connect to Firebase:", e)
        return False