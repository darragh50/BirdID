# Bird Identifier App

A mobile application that leverages machine learning to identify bird species from audio recordings in real time. Built with React Native and Python, the application provides an intuitive interface for recording bird songs, processing them through the BirdNET deep learning model, and displaying species identification results with confidence scores.

## Screencast Link
- [YouTube](https://www.youtube.com/watch?v=ri_H8plbJYk) 

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)

## Documentation
- [Dissertation](docs/FYPDissertation.pdf)
- [Poster](docs/BirdIDPoster.pdf)

## Features

### Core Functionality
- **Audio Recording**: High-quality bird song recording with real time duration tracking and visual waveform feedback
- **AI-Powered Identification**: Species identification using BirdNET machine learning model (6,000+ species supported)
- **Confidence Scoring**: Detailed confidence percentages for each identification with color-coded visual indicators
- **Cloud Storage**: Secure audio file storage using AWS S3 with automatic file management
- **User Authentication**: Secure email/password authentication via Firebase with persistent sessions
- **Recording History**: Complete history of past identifications with playback and deletion capabilities
- **Audio Playback**: Stream and replay recordings directly from cloud storage

### User Experience
- **Live Waveform Animation**: Real-time visual feedback during recording
- **Bird Images**: Automatic fetching of high-resolution bird images from iNaturalist
- **Alternative Matches**: Display of multiple possible species when confidence is uncertain

### Technical Features
- **Cross-Platform**: Single codebase for iOS and Android using React Native
- **Presigned URLs**: Secure temporary access to stored audio files
- **Automated Testing**: Comprehensive test suite with CI/CD pipeline
- **Production Deployment**: Live deployment on Railway with managed PostgreSQL

## Technology Stack

### Frontend (Mobile Application)
- **React Native** Cross-platform mobile framework
- **Expo** Development platform and tooling
- **React Navigation** Screen navigation and routing
- **Firebase SDK** User authentication

### Backend (API Server)
- **Python** Programming language
- **FastAPI** Modern async web framework
- **SQLAlchemy** ORM for database operations
- **Psycopg2** PostgreSQL database adapter
- **Boto3** AWS SDK for S3 operations
- **Firebase Admin** Authentication token verification
- **BirdNetLib** Bird identification ML model
- **Pydub** Audio format conversion
- **Librosa** Audio processing and analysis
- **FFmpeg** Audio conversion

### Data & Storage
- **PostgreSQL** Relational database for metadata
- **AWS S3** Cloud object storage for audio files
- **Firebase Authentication** User management and JWT tokens

### DevOps & Testing
- **Git/GitHub** Version control
- **GitHub Actions** CI/CD pipeline
- **Pytest** Backend testing framework
- **Build Artifacts** Android APK generated via Expo Application Services (EAS)
- **Railway** Deployment platform

## Running the Application

The application is fully deployed and ready to use. No local setup is required.

### Install Mobile App

The Android application is built and distributed using Expo’s cloud build system. <br> 
Scan the QR code below to install it:

<img src="screenshots/qr-code.png" width="200">

Or open this link on your device:<br>
https://expo.dev/accounts/darraghr/projects/bird-identifier/builds/617b39fb-1132-4714-b4c0-029d57537641

> Note: Following Expo's direct instructions.

**How to install this build on Android**

- On devices running Android 8.0 (API level 26) and higher, you must navigate to the Install unknown apps system settings screen to enable app installations from a particular location (i.e. the web browser you are downloading the app from).

- On devices running Android 7.1.1 (API level 25) and lower, you should enable the Unknown sources system setting, found in Settings > Security on your device."

## Deployment

### Backend API

The backend is deployed on Railway and is already connected to the mobile application.


