"""
Test BirdNET integration with sample audio
"""
import os
import sys

# Add the project root directory to the python path so imports work
# when running tests from different locations
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import functions under test from the BirdNET configuration module
from birdnetconfig import identify_bird_from_file, get_best_match, format_bird_result, test_birdnet
import pytest

@pytest.mark.integration
def test_birdnet_configuration():
    """Test that BirdNET is configured correctly"""
    assert test_birdnet() == True

@pytest.mark.integration
def test_identify_bird_with_nonexistent_file():
    """Test that function handles missing audio files"""
    results = identify_bird_from_file("nonexistent_file.wav")
    assert results == []

@pytest.mark.integration
def test_get_best_match_with_empty_list():
    """Test best match function with no detections."""
    result = get_best_match([])
    assert result is None

@pytest.mark.integration
def test_format_bird_result():
    """Test formatting of bird detection results."""
    detection = {
        'common_name': 'European Robin',
        'confidence': 0.873
    }
    formatted = format_bird_result(detection)
    assert 'European Robin' in formatted
    assert '87.3%' in formatted

@pytest.mark.integration
def test_format_bird_result_none():
    """Test formatting with no detection."""
    formatted = format_bird_result(None)
    assert formatted == "No bird detected"