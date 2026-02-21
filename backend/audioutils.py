"""
Audio utilities for format conversion and processing
"""
# Pydub is a library for audio manipulation and conversion
from pydub import AudioSegment
from pathlib import Path
import os

# Function converts various audio formats to WAV, which is compatible with BirdNET
def convert_to_wav(input_path, output_path=None):
    """
    Convert audio file to WAV format for BirdNET compatibility
    
    Args:
        input_path (str): Path to input audio file (M4A, MP3, etc)
        output_path (str, optional): Path for output WAV file. If None, creates temp file with .wav extension
    
    Returns:
        str: Path to converted WAV file, or None if conversion failed
    
    Example:
        wav_path = convert_to_wav("recording.m4a")
        # Use wav_path with BirdNET
        # Delete wav_path when done
    """
    try:
        # Ensure input path is a Path object
        input_path = Path(input_path)
        
        # Verify input file exists
        if not input_path.exists():
            print(f"Input file not found: {input_path}")
            return None
        
        # Generate output path if not provided
        if output_path is None:
            output_path = input_path.with_suffix('.wav')
        
        print(f"Converting {input_path.suffix} to WAV")
        
        # Load audio file (pydub handles M4A (expo), MP3 etc)
        audio = AudioSegment.from_file(str(input_path))
        
        # Export as WAV
        audio.export(
            str(output_path),
            format='wav',
            parameters=[
                "-ar", "44100",  # Sample rate is 44.1kHz
                "-ac", "1"        # Channels are mono (BirdNET works better with mono)
            ]
        )
        
        # Print conversion details
        print(f"Converted to WAV: {output_path}")
        # Print file size in MB
        print(f"Size: {Path(output_path).stat().st_size / 1024 / 1024:.2f} MB")
        
        return str(output_path)
        
    except Exception as e:
        print(f"Audio conversion failed: {e}")
        return None

# Function gets the duration of an audio file in seconds, which can be useful for processing and validating recordings
def get_audio_duration(file_path):
    """
    Get duration of audio file in seconds.
    
    Args:
        file_path (str): Path to audio file
    
    Returns:
        float: Duration in seconds, or None if failed
    """
    try:
        # Load audio file (pydub supports many formats)
        audio = AudioSegment.from_file(str(file_path))
        # Convert milliseconds to seconds
        duration = len(audio) / 1000.0  
        return duration
    except Exception as e:
        print(f"Could not get audio duration: {e}")
        return None

# Function checks if a file is a supported audio format based on its extension, which helps ensure that only compatible files are processed
def is_audio_file(file_path):
    """
    Check if file is a supported audio format
    
    Args:
        file_path (str): Path to file
    
    Returns:
        bool: True if supported audio format
    """
    # List of supported audio formats (pydub can handle many, but these are common ones for bird recordings)
    supported_formats = ['.m4a', '.mp3', '.wav', '.flac', '.ogg', '.aac']
    # Check if file extension is in supported formats (case insensitive)
    return Path(file_path).suffix.lower() in supported_formats