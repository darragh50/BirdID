"""
Audio utilities for format conversion and processing
"""
# Pydub is a library for audio manipulation and conversion
from pydub import AudioSegment
from pathlib import Path
import os

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