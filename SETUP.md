# MyHub Setup Guide

Complete setup guide for MyHub with PostgreSQL backend.

## Prerequisites

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/

2. **PostgreSQL** (v12 or higher)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`
   - Windows: Download from https://www.postgresql.org/download/

3. **npm** (comes with Node.js)

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database:**
   ```bash
   # Start PostgreSQL (if not running)
   # macOS with Homebrew:
   brew services start postgresql
   
   # Create database
   createdb myhub
   
   # Or using psql:
   psql -U postgres
   CREATE DATABASE myhub;
   \q
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=myhub
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_here
   CORS_ORIGIN=http://localhost:8000
   ```

5. **Run database migrations:**
   ```bash
   npm run migrate
   ```

6. **Start the backend server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

   The API will be available at: `http://localhost:3000`

## Frontend Setup

1. **The frontend is already set up in `master-hub/`**

2. **Start the frontend server:**
   ```bash
   cd master-hub
   python3 -m http.server 8000
   ```

   Or use any other static file server.

3. **Access the application:**
   - Frontend: http://localhost:8000
   - Backend API: http://localhost:3000

## First Time Setup

1. **Open the application:**
   - Navigate to http://localhost:8000
   - You'll be redirected to the login page

2. **Create an account:**
   - Click "Register"
   - Fill in your details (name, username, email, password)
   - Click "Register"

3. **Login:**
   - Use your username/email and password to login

4. **Start using MyHub!**
   - All your data will now be saved to PostgreSQL
   - Data persists across sessions and devices

## Troubleshooting

### Database Connection Issues

- **Check PostgreSQL is running:**
  ```bash
  # macOS
  brew services list
  
  # Check if postgresql is running
  psql -U postgres -c "SELECT version();"
  ```

- **Verify database exists:**
  ```bash
  psql -U postgres -l
  ```

- **Check credentials in `.env` file**

### Port Already in Use

- **Change backend port:**
  - Edit `backend/.env`: `PORT=3001`

- **Change frontend port:**
  - Use a different port: `python3 -m http.server 8001`
  - Update `CORS_ORIGIN` in `backend/.env`

### CORS Errors

- Make sure `CORS_ORIGIN` in `backend/.env` matches your frontend URL
- Default: `http://localhost:8000`

### Migration Errors

- If tables already exist, the migration will skip them
- To reset database:
  ```bash
  psql -U postgres -d myhub -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
  npm run migrate
  ```

## Development

- **Backend auto-reload:** Use `npm run dev` (requires nodemon)
- **Frontend:** Just refresh the browser after changes
- **API testing:** Use Postman or curl to test endpoints

## Production Deployment

1. **Set strong JWT_SECRET** in production
2. **Use HTTPS** for both frontend and backend
3. **Configure proper CORS** origins
4. **Set up database backups**
5. **Use environment variables** for all secrets
6. **Enable SSL** for PostgreSQL connection

## Data Migration from localStorage

If you have existing data in localStorage:

1. Export data from old version (if export feature exists)
2. Create account in new version
3. Manually re-enter data, or
4. Use the import feature if available

