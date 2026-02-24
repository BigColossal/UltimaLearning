# UltimaLearning

A full-featured MERN stack web application for creating and following structured learning roadmaps with gamified XP and level tracking.

## Features

- **Hub**: Personalized dashboard displaying all user-created skills
- **Skills**: Create, edit, and delete learning skills
- **Domains**: Organize skills into domains with multiple subskills
- **Subskills**: Track individual learning items with XP and levels
- **XP System**: Add XP manually to track progress (100 XP = 1 level, max level 100)
- **Level Tiers**: Visual tier system (Bronze → Omniversal) based on level progression
- **Copy Functionality**: Copy subskill lists and generate ChatGPT test prompts
- **User Profile**: View all progress, levels, and XP across all subskills

## Tech Stack

### Frontend
- React 18 with Vite
- React Router DOM for navigation
- Context API for state management
- Axios for API calls
- CSS3 with custom properties

### Backend
- Node.js with Express
- MongoDB with Mongoose
- RESTful API architecture

## Project Structure

```
UltimaLearning/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Context API providers
│   │   ├── api/            # API utility functions
│   │   ├── styles/         # CSS stylesheets
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── models/            # MongoDB schemas
│   ├── controllers/       # Route controllers
│   ├── routes/            # Express routes
│   ├── server.js          # Entry point
│   ├── seed.js            # Database seeding script
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ultimalearning
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

5. Seed the database (optional):
```bash
node seed.js
```

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Create a Skill**: Go to the Hub and click "Create New Skill"
2. **Add Domains**: Open a skill and add domains to organize subskills
3. **Add Subskills**: Open a domain and add subskills to track
4. **Track Progress**: Open a subskill and add XP using the quick buttons or custom input
5. **View Progress**: Check your profile to see all progress across all subskills

## API Endpoints

### Skills
- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get skill by ID
- `POST /api/skills` - Create a new skill
- `PUT /api/skills/:id` - Update a skill
- `DELETE /api/skills/:id` - Delete a skill

### Domains
- `GET /api/domains/skill/:skillId` - Get domains for a skill
- `GET /api/domains/:id` - Get domain by ID
- `POST /api/domains/skill/:skillId` - Create a new domain
- `PUT /api/domains/:id` - Update a domain
- `DELETE /api/domains/:id` - Delete a domain

### Subskills
- `GET /api/subskills/domain/:domainId` - Get subskills for a domain
- `GET /api/subskills/:id` - Get subskill by ID
- `POST /api/subskills/domain/:domainId` - Create a new subskill
- `PUT /api/subskills/:id` - Update a subskill
- `PATCH /api/subskills/:id/xp` - Add XP to a subskill
- `DELETE /api/subskills/:id` - Delete a subskill

## Level System

- **XP to Level**: 100 XP = 1 level
- **Max Level**: 100
- **Tiers** (every 10 levels):
  - 0-9: Bronze
  - 10-19: Silver
  - 20-29: Gold
  - 30-39: Platinum
  - 40-49: Diamond
  - 50-59: Master
  - 60-69: Legend
  - 70-79: Mythic
  - 80-89: Omniversal
  - 90-100: Omniversal+

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

## License

ISC
