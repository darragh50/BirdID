import firebase_admin
from firebase_admin import credentials
import os

# Path to Firebase service account key JSON file
FIREBASE_CREDENTIALS_PATH = "bird-identifier-9f5e5-firebase-adminsdk-fbsvc-147b255c1d.json"

# Check if the credentials file exists 
if not os.path.exists(FIREBASE_CREDENTIALS_PATH):
    raise FileNotFoundError(f"Firebase credentials file not found at {FIREBASE_CREDENTIALS_PATH}")

# Initialize Firebase admin SDK
try: 
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)
    print("Firebase admin initialized successfully")
except Exception as e:
    print("Error initializing Firebase admin:", e)
    raise