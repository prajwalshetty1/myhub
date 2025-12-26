# Supabase Connection String

## Your Connection Details

**Project Reference:** `jarhhglbeawefqpgmuch`  
**Project URL:** `https://jarhhglbeawefqpgmuch.supabase.co`

## Connection String Options

### Option 1: Direct Connection (for local development)

```
postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
```

**Note:** The `@` in password is URL encoded as `%40`

### Option 2: Pooler Connection (Recommended for Vercel/Serverless)

Get the pooler connection string from Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database
2. Scroll to **"Connection pooling"** section
3. Copy the **"Session mode"** or **"Transaction mode"** connection string
4. Replace `[YOUR-PASSWORD]` with `NextGenDB%40123456`

Format will be:
```
postgresql://postgres.jarhhglbeawefqpgmuch:NextGenDB%40123456@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## For Local Development

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
PORT=3000
NODE_ENV=development
JWT_SECRET=myhub_jwt_secret_change_in_production
CORS_ORIGIN=http://localhost:8000
```

## For Vercel Deployment

Use the **pooler connection** (Option 2) in Vercel environment variables for better performance with serverless functions.

## Password Encoding

Your password `NextGenDB@123456` needs to be URL encoded:
- `@` becomes `%40`
- Final: `NextGenDB%40123456`

## Testing Connection

After setting up `.env`, test with:
```bash
cd backend
npm install
node -e "require('dotenv').config(); const pool = require('./config/database'); pool.query('SELECT NOW()').then(() => console.log('✅ Connected!')).catch(e => console.error('❌', e.message));"
```

