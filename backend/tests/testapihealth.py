"""
Tests for health check endpoints.

These tests verify that all health related routes in the fastAPI backend
are working correctly. They use the client fixture from conftest.py to
simulate API requests without launching a real server
"""
import pytest

# / endpoint
@pytest.mark.api
def test_root_endpoint(client):
    """Test the root endpoint returns correct info."""
    # Simulate a get request to /
    response = client.get("/")
    
    # Check that we are successful
    assert response.status_code == 200
    data = response.json()
    
    # Then verify with info
    assert "message" in data
    assert "Bird Identifier API" in data["message"]
    assert "version" in data
    assert "endpoints" in data

# /health endpoint
@pytest.mark.api
def test_health_endpoint(client):
    """Test the health check endpoint."""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "healthy"
    assert "upload_directory" in data
    assert data["upload_directory_exists"] == True

# /health/database endpoint
@pytest.mark.api
def test_database_health_endpoint(client):
    """Test database health check."""
    response = client.get("/health/database")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

# /health/s3 endpoint
@pytest.mark.api
def test_s3_health_endpoint(client):
    """Test S3 health check."""
    response = client.get("/health/s3")
    
    assert response.status_code == 200
    data = response.json()
    
    # Should be healthy if AWS credentials are configured
    assert "status" in data
    assert "s3" in data