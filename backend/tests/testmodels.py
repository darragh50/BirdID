"""
Tests for database models.

These unit tests focus on the Recording model, ensuring:
  - Instances can be created and saved to the test database
  - Default values for optional fields are correct
  - String representation (__repr__) is informative
"""

import pytest
from models import Recordings
from datetime import datetime

@pytest.mark.unit
def test_recording_model_creation(test_db):
    """
    Test creating a Recording model instance with all relevant fields

    - Verifies that the instance can be added, committed, and refreshed in the DB
    - Checks that auto-generated fields like 'id' and 'upload_time' are set
    """
    recording = Recordings(
        user_id="test_user_123",
        filename="test_recording.m4a",
        original_filename="original.m4a",
        file_path="s3://bucket/test_recording.m4a",
        duration=10.5,
        file_size_bytes=1024000,
        file_size_mb=1.0,
    )
    
    # Save to test database
    test_db.add(recording)
    test_db.commit()
    test_db.refresh(recording)
    
    # Verify fields are correctly set
    assert recording.id is not None
    assert recording.user_id == "test_user_123"
    assert recording.filename == "test_recording.m4a"
    assert recording.duration == 10.5
    assert recording.upload_time is not None
    assert isinstance(recording.upload_time, datetime)


@pytest.mark.unit
def test_recording_model_defaults(test_db):
    """
    Test that optional fields in Recording default to None when not provided

    Fields checked:
      - user_id
      - identified_species
      - confidence_score
    """
    recording = Recordings(
        filename="test.m4a",
        file_path="s3://test",
        file_size_bytes=100,
        file_size_mb=0.1,
    )
    
    test_db.add(recording)
    test_db.commit()
    test_db.refresh(recording)
    
    # Check that optional fields are None
    assert recording.user_id is None
    assert recording.identified_species is None
    assert recording.confidence_score is None
    assert recording.latitude is None
    assert recording.longitude is None

@pytest.mark.unit
def test_recording_model_repr(test_db):
    """
    Test the string representation (__repr__) of a Recording instance

    Ensures it includes important information for debugging:
      - Class name
      - User ID
      - Filename
      - Identified species
    """
    recording = Recordings(
        user_id="user123",
        filename="bird.m4a",
        file_path="s3://test",
        file_size_bytes=100,
        file_size_mb=0.1,
        identified_species="Robin"
    )
    
    repr_str = repr(recording)
    
    # Check that key info is included in __repr__
    assert "Recording" in repr_str
    assert "user123" in repr_str
    assert "bird.m4a" in repr_str
    assert "Robin" in repr_str
