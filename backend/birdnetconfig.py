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