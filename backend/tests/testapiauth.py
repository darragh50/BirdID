"""
Tests for authentication endpoints and middleware

These tests verify that protected endpoints correctly enforce authentication
They ensure that users cannot access or modify resources without valid tokens
"""

import pytest

@pytest.mark.api
def test_protected_endpoint_without_auth(client):
    """
    Test that accessing a protected endpoint without any authentication fails

    Endpoint tested:
      - GET /recordings

    Expected outcome:
      - Should return 401 Unauthorized or 403 Forbidden
    """
    # Attempt to access protected endpoint without Authorization header
    response = client.get("/recordings")
    
    # Check status code for authentication failure
    assert response.status_code in [401, 403]


@pytest.mark.api
def test_protected_endpoint_with_invalid_token(client):
    """
    Test that endpoints reject requests with invalid tokens

    Endpoint tested:
      - GET /recordings

    Expected outcome:
      - Should return 401 Unauthorized
    """
    # Use a clearly invalid token
    headers = {
        "Authorization": "Bearer invalid_token_12345"
    }
    
    response = client.get("/recordings", headers=headers)
    
    # Ensure invalid token is rejected
    assert response.status_code == 401


@pytest.mark.api
def test_upload_without_auth(client):
    """
    Test that the upload endpoint requires authentication

    Endpoint tested:
      - POST /upload-audio

    Expected outcome:
      - Should return 401 Unauthorized or 403 Forbidden if no token is provided
    """
    # Prepare dummy audio file and metadata
    files = {"audio": ("test.m4a", b"fake audio data", "audio/m4a")}
    data = {"duration": "5"}
    
    # Attempt upload without authentication
    response = client.post("/upload-audio", files=files, data=data)
    
    # Confirm access is blocked
    assert response.status_code in [401, 403]
