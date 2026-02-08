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

# This test will attempt to run the BirdNET analysis on a sample file if it exists in the uploads directory
if __name__ == "__main__":
    print("Testing BirdNET Integration")
    
    # Test configuration
    print("\n1.Testing BirdNET configuration")
    test_birdnet()
    
    # Test with sample file from my uploads folder
    print("\n2.Testing with sample audio")
    print("Checking for sample files in uploads")
    
    from pathlib import Path
    uploads_dir = Path("uploads")
    
    if uploads_dir.exists():
        # Find all .m4a audio files in the uploads directory
        audio_files = list(uploads_dir.glob("*.m4a"))
        if audio_files:
            # Use the first available audio file as a sample
            sample_file = audio_files[0]
            print(f"Found: {sample_file}")
            
            # Run BirdNET analysis on the sample audio file
            results = identify_bird_from_file(str(sample_file))
            
            if results:
                print(f"\nAnalysis successful!")
                print(f"Detected {len(results)} bird(s):\n")
                
                # Display details for up to the top 5 detections
                for i, bird in enumerate(results[:5], 1):  
                    print(f"{i}. {format_bird_result(bird)}")
                    print(f"Scientific: {bird['scientific_name']}")
                    print(f"Time: {bird['start_time']:.1f}s - {bird['end_time']:.1f}s\n")
                
                # Determine and display the best overall match
                best = get_best_match(results)
                if best:
                    print(f"Best match: {format_bird_result(best)}")
            else:
                # Analysis ran but no birds were detected
                print("No birds detected (might be background noise)")
        else:
            # uploads directory exists but contains no .m4a files
            print("No audio files found in uploads")
    else:
        # uploads directory does not exist
        print("Uploads directory not found")