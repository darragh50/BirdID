#!/bin/bash

# Update Linux packages
apt-get update -y

# Install FFmpeg
apt-get install -y ffmpeg

# Start FastAPI using uvicorn
uvicorn main:app --host 0.0.0.0 --port $PORT