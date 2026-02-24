# Quick Start Guide

## Prerequisites

- Node.js (v18+)
- MongoDB installed and running locally, OR MongoDB Atlas account

## Step 1: Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ultimalearning
NODE_ENV=development
```

Start MongoDB (if local):
- Windows: `mongod`
- macOS/Linux: `sudo systemctl start mongod`

Seed the database (optional but recommended):
```bash
node seed.js
```

Start the backend:
```bash
npm run dev
```

Backend should be running on `http://localhost:5000`

## Step 2: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend should be running on `http://localhost:3000`

## Step 3: Use the Application

1. Open `http://localhost:3000` in your browser
2. Navigate to the Hub
3. Create your first skill
4. Add domains to organize subskills
5. Add subskills and start tracking XP!

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod` or check MongoDB Atlas connection string
- Verify the MONGODB_URI in `.env` is correct

### Port Already in Use
- Backend: Change PORT in `.env` file
- Frontend: Vite will automatically use the next available port

### CORS Errors
- Make sure backend is running on port 5000
- Check that the frontend proxy in `vite.config.js` points to the correct backend URL
