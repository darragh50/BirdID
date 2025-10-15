# Bird Identifier App

A mobile application for identifying birds by their song using AI.

## Tech Stack

- **Frontend**: React Native (Expo)
- **Backend**: Python (FastAPI)
- **Database**: PostgreSQL
- **File Storage**: AWS S3
- **Authentication**: Firebase Auth
- **ML Model**: BirdNET

## Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Project Status

- [x] Initial project setup
- [x] Basic frontend with React Native
- [x] Basic backend with FastAPI
- [x] Frontend-backend connection test
- [x] CI/CD pipeline with GitHub Actions
- [ ] Database integration (PostgreSQL)
- [ ] File storage (AWS S3)
- [ ] Authentication (Firebase)
- [ ] BirdNET integration
- [ ] Audio recording functionality
- [ ] Bird identification feature
