"""
BirdNET configuration 
Handles bird song identification using the BirdNET ML model
"""
from birdnetlib import Recording
from birdnetlib.analyzer import Analyzer
import os
from pathlib import Path

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
    try:
        # Verify that the file exists
        if not os.path.exists(audio_file_path):
            print(f"Audio file not found {audio_file_path}")
            return []
        
        print(f"Analyzing audio file {audio_file_path}")
        
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