# MyHub Backend API

Backend API server for MyHub using Node.js, Express, and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb myhub
   
   # Or using psql:
   psql -U postgres
   CREATE DATABASE myhub;
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run migrations:**
   ```bash
   npm run migrate
   ```

5. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Phoenix Planner
- `GET /api/phoenix/schedule` - Get schedule
- `POST /api/phoenix/schedule` - Add schedule item
- `DELETE /api/phoenix/schedule/:id` - Delete schedule item
- `GET /api/phoenix/selected-tasks/:date` - Get selected tasks
- `POST /api/phoenix/selected-tasks/:date` - Save selected tasks
- `GET /api/phoenix/completed-tasks/:date` - Get completed tasks
- `POST /api/phoenix/completed-tasks/:date` - Save completed tasks
- `GET /api/phoenix/supplements` - Get supplements
- `POST /api/phoenix/supplements` - Save supplements
- `GET /api/phoenix/supplements-taken/:date` - Get supplements taken
- `POST /api/phoenix/supplements-taken/:date` - Save supplements taken

### Task Tracker
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Diet Planner
- `GET /api/diet/meals/:date` - Get meals for date
- `POST /api/diet/meals/:date` - Save meals
- `GET /api/diet/goals` - Get goals
- `POST /api/diet/goals` - Save goals
- `GET /api/diet/water/:date` - Get water intake
- `POST /api/diet/water/:date` - Save water intake
- `GET /api/diet/fasting` - Get fasting status
- `POST /api/diet/fasting` - Save fasting status

### Trading Planner
- `GET /api/trading` - Get all trades
- `GET /api/trading/:id` - Get trade by ID
- `POST /api/trading` - Create trade
- `PUT /api/trading/:id` - Update trade
- `DELETE /api/trading/:id` - Delete trade
- `GET /api/trading/mode` - Get trading mode
- `POST /api/trading/mode` - Save trading mode

### Learning 2026
- `GET /api/learning` - Get all topics
- `GET /api/learning/:id` - Get topic by ID
- `POST /api/learning` - Create topic
- `PUT /api/learning/:id` - Update topic
- `DELETE /api/learning/:id` - Delete topic
- `POST /api/learning/:id/hours` - Log hours

### Project Tracker
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Hub
- `GET /api/hub/habits` - Get habits
- `POST /api/hub/habits` - Save habits
- `GET /api/hub/habit-logs/:date` - Get habit logs
- `POST /api/hub/habit-logs/:date` - Save habit logs
- `GET /api/hub/intentions/:date` - Get intentions
- `POST /api/hub/intentions/:date` - Save intentions
- `GET /api/hub/gamification` - Get gamification data
- `POST /api/hub/gamification` - Update gamification
- `GET /api/hub/activity-log` - Get activity log
- `POST /api/hub/activity-log` - Log activity

## Authentication

All API endpoints (except `/api/auth/*`) require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Environment Variables

- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name (default: myhub)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:8000)

