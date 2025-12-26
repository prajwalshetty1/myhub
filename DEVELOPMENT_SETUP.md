# Development Setup Guide - Supabase Database

## Quick Setup for Local Development

### 1. Backend Environment Variables

Create or update `backend/.env` file:

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (change in production!)
JWT_SECRET=myhub_jwt_secret_dev_change_in_production

# CORS Configuration
CORS_ORIGIN=http://localhost:8000
```

**Important:** The `@` in password is URL encoded as `%40`

### 2. Frontend Environment Variables

The frontend doesn't need a `.env` file for local development. It automatically detects `localhost` and uses `http://localhost:3000/api`.

### 3. Start Development Servers

#### Terminal 1 - Backend:
```bash
cd backend
npm install  # First time only
npm start
```

You should see:
```
🚀 MyHub Backend Server running on port 3000
📊 API available at http://localhost:3000/api
✅ Connected to PostgreSQL database
```

#### Terminal 2 - Frontend:
```bash
cd master-hub
python3 -m http.server 8000
```

Or use any static file server on port 8000.

### 4. Test the Connection

```bash
cd backend
node -e "require('dotenv').config(); const pool = require('./config/database'); pool.query('SELECT NOW()').then(() => console.log('✅ Database connected!')).catch(e => console.error('❌ Error:', e.message));"
```

### 5. Test Registration

Open browser: `http://localhost:8000/login.html`

Or test via API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123","name":"Test User"}'
```

## Supabase Connection Details

- **Project URL:** https://jarhhglbeawefqpgmuch.supabase.co
- **Project Reference:** jarhhglbeawefqpgmuch
- **Database:** postgres
- **User:** postgres
- **Password:** NextGenDB@123456 (URL encode `@` as `%40`)

## Troubleshooting

### Connection Issues

1. **"getaddrinfo ENOTFOUND"** - Check your internet connection
2. **"password authentication failed"** - Verify password is URL encoded correctly
3. **"Connection timeout"** - Check firewall/VPN settings

### Get Fresh Connection String

1. Go to: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database
2. Scroll to **"Connection string"** section
3. Click **"URI"** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your password (URL encoded)

## Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch
- **Database Settings:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database
- **SQL Editor:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/sql

