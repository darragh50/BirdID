"""
Test BirdNET integration with sample audio
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from birdnetconfig import identify_bird_from_file, get_best_match, format_bird_result, test_birdnet
import pytest
