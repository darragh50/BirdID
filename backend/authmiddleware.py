from fastapi import HTTPException, Security, status
# Import FastAPI's security utilities for handling HTTP Bearer tokens
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# Import the helper function to verify Firebase tokens
from firebaseconfig import verify_firebase_token

# Create an instance of FastAPI's HTTPBearer security scheme
# This ensures the request includes a valid Authorization header with a Bearer token
# A bearer token is essentially a secret string of characters that the client sends to the server as proof of authentication
security = HTTPBearer()

# Function to get the current user based on the Firebase token
async def get_current_user(
    # Security dependency that extracts and validates the Authorization header
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    """
    Dependency that verifies Firebase token and returns user info
    
    Usage in routes:
        @app.get("/protected-route")
        async def protected_route(user = Depends(get_current_user)):
            # user contains {"uid": "...", "email": "..." etc}
    """
     # Extract the token string from the Authorization header 
    token = credentials.credentials

    try:
        # Attempt to verify the Firebase token using the helper function
        decoded_token = verify_firebase_token(token)
        
        # If verification is successful, return relevant user info
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False)
        }
    except ValueError as e:
        # Raised when token verification fails or token is expired
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},  # Required for clients to retry authentication
        )
    except Exception as e:
        # Catch-all for any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )