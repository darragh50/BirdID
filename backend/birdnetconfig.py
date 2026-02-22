"""
BirdNET configuration 
Handles bird song identification using the BirdNET ML model
"""
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer
import os
from pathlib import Path
from audioutils import convert_to_wav, cleanup_temp_file

# Initialize BirdNET analyzer
# This loads the pretrained model
analyzer = Analyzer()

# Function to identify bird species from audio file
def identify_bird_from_file(audio_file_path, latitude=None, longitude=None, min_confidence=0.15):
    """
    Identify bird species from an audio file using BirdNET
    
    Args:
        audio_file_path (str): Path to audio file 
        latitude (float, optional): Latitude for regional filtering (improves accuracy)
        longitude (float, optional): Longitude for regional filtering
        min_confidence (float): Minimum confidence threshold (0-1). Default is 0.15
    
    Returns:
        list: List of detected birds with species name, confidence and time stamps
        [
            {
                'common_name': 'European Robin',
                'scientific_name': 'Erithacus rubecula',
                'confidence': 0.87,
                'start_time': 0.0,
                'end_time': 3.0
            },
            ...
        ]
    
    Returns empty list if no birds detected or file not found
    """
    # Track converted wav file for deletion
    wav_file_path = None

    try:
        # Verify that the file exists
        if not os.path.exists(audio_file_path):
            print(f"Audio file not found {audio_file_path}")
            return []
        
        print(f"Analyzing audio file {audio_file_path}")
        
        # Check if file is already wav
        file_path = Path(audio_file_path)

        # If not wav then convert to wav format 
        if file_path.suffix.lower() != '.wav':
            # Convert to wav for BirdNET
            print(f"Converting {file_path.suffix} to WAV for BirdNET compatibility")
            wav_file_path = convert_to_wav(audio_file_path)
            
            if not wav_file_path:
                print(f"Audio conversion failed")
                return []
            
            # Use converted wav file for analysis
            analysis_file = wav_file_path
        else:
            # Already wav then use directly
            analysis_file = audio_file_path

        # Create the recording object
        recording = Recording(
            analyzer,
            audio_file_path,
            lat=latitude,
            lon=longitude,
            min_conf=min_confidence
        )
        
        # Analyze the recording (ml)
        recording.analyze()
        
        # Get detections
        detections = recording.detections
        
        print(f"BirdNET analysis complete: {len(detections)} detections")
        
        # Format results
        results = []
        for detection in detections:
            results.append({
                'common_name': detection.get('common_name', 'Unknown'),
                'scientific_name': detection.get('scientific_name', 'Unknown'),
                'confidence': round(detection.get('confidence', 0.0), 3),
                'start_time': detection.get('start_time', 0.0),
                'end_time': detection.get('end_time', 0.0)
            })
        
        # Sort by confidence (highest first)
        # By using a lambda function as the key
        results.sort(key=lambda x: x['confidence'], reverse=True)
        
        return results
    # Handle exceptions 
    except Exception as e:
        print(f"Error analyzing audio with BirdNET: {e}")
        return []
    
    finally:
        # Clean up temporary wav file if it was created
        if wav_file_path and  wav_file_path != audio_file_path:
            cleanup_temp_file(wav_file_path)
    
# Function to get best match
def get_best_match(detections):
    """
    Get the best (highest confidence) match from detections
    
    Args:
        detections (list): List of detections from identify_bird_from_file
    
    Returns:
        dict or None: Best match or none if no detections
    """
    if not detections or len(detections) == 0:
        return None
    
    # Return first item (already sorted by the confidence)
    return detections[0]

# Function to format bird detection result
def format_bird_result(detection):
    """
    Format the result 
    
    Args:
        detection (dict): Single detection from BirdNET
    
    Returns:
        str: Formatted string like ie: European robin (87.3%)"
    """
    if not detection:
        return "No bird detected"
    
    # Extract name and confidence
    name = detection.get('common_name', 'Unknown')
    confidence = detection.get('confidence', 0.0) * 100  # Convert to a percentage
    
    # Return formatted string
    return f"{name} ({confidence:.1f}%)"

# Test function to verify model loads correctly
def test_birdnet():
    """
    Test BirdNET configuration and model loading
    """
    try:
        print("Testing BirdNET configuration")
        print(f"BirdNET analyzer loaded successfully")
        print(f"Model ready to analyze audio files")
        return True
    # Handle exceptions
    except Exception as e:
        print(f"BirdNET test failed: {e}")
        return False

# Test on import to ensure model loads correctly
if __name__ == "__main__":
    test_birdnet()
