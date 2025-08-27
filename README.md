# TVT - Video Management App

A full-stack mobile application for video management with React Native (Expo) frontend and Node.js backend.

## Features

### Frontend (React Native - Expo)
- Animated splash screen with logo animation using Lottie
- Bottom Tab Navigation with Home and Upload tabs
- Video listing with search functionality
- Video preview with Expo AV player
- File download with progress tracking
- Video upload with progress tracking
- Light/Dark theme toggle
- Modern UI with React Native Paper

### Backend (Node.js + Express + MongoDB + AWS S3)
- Video storage in AWS S3
- Metadata storage in MongoDB
- RESTful API endpoints for video management
- File upload with Multer
- Signed URLs for secure video downloads

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install dependencies:
```
npm install
```

3. Configure environment variables:
   - Update the `.env` file with your MongoDB connection string and AWS credentials:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-app
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-video-bucket
```

4. Start the backend server:
```
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```
cd frontend
```

2. Install dependencies:
```
npm install
```

3. Update API configuration (if needed):
   - If your backend is running on a different host/port, update the `API_BASE_URL` in `src/config/api.js`

4. Start the Expo development server:
```
npx expo start
```

5. Use the Expo Go app on your mobile device to scan the QR code, or run on an emulator/simulator.

## Project Structure

### Backend
```
backend/
├── config/
│   └── aws.js         # AWS S3 configuration
├── models/
│   └── Video.js       # MongoDB Video model
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── server.js          # Express server and API routes
```

### Frontend
```
frontend/
├── assets/
│   └── video-animation.json  # Lottie animation file
├── src/
│   ├── components/
│   │   ├── SplashAnimation.js  # Splash screen animation
│   │   └── ThemeToggle.js      # Theme toggle component
│   ├── config/
│   │   ├── api.js              # API configuration
│   │   └── theme.js            # Theme configuration
│   └── screens/
│       ├── HomeScreen.js       # Home screen with video list
│       └── UploadScreen.js     # Upload screen with form
├── App.js                      # Main app component
└── package.json                # Dependencies and scripts
```

## Technologies Used

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- AWS SDK for S3
- Multer for file uploads
- dotenv for environment variables
- cors for CORS support
- morgan for logging

### Frontend
- React Native with Expo
- React Navigation for routing
- React Native Paper for UI components
- Expo AV for video playback
- Expo File System for file operations
- Expo Document Picker for file selection
- Lottie for animations
- Moti for animations
- FlashList for optimized list rendering
- Axios for API requests
