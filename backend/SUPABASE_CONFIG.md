# Supabase Configuration

## ✅ Database Connection Details

**Project Reference:** `jarhhglbeawefqpgmuch`  
**Password:** `NextGenDB@123456` (URL encoded: `NextGenDB%40123456`)

## Get Correct Connection String

The connection string format may vary. Get the exact one from Supabase:

1. **Go to:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database

2. **Scroll to "Connection string" section**

3. **Copy the URI connection string** - it will look like one of these:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   or
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xx.pooler.supabase.com:6543/postgres
   ```

4. **Replace `[YOUR-PASSWORD]` with:** `NextGenDB%40123456`

## For Local Development (.env file)

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@[HOSTNAME-FROM-SUPABASE]:[PORT]/postgres
PORT=3000
NODE_ENV=development
JWT_SECRET=myhub_jwt_secret_change_in_production
CORS_ORIGIN=http://localhost:8000
```

## For Vercel Deployment

**Recommended: Use Connection Pooler**

1. In Supabase Dashboard → Settings → Database
2. Find **"Connection pooling"** section
3. Copy **"Session mode"** connection string
4. Replace password with: `NextGenDB%40123456`
5. Use this in Vercel environment variables

**Why pooler?** Better for serverless functions - handles connection pooling automatically.

## Connection String Format

Your password `NextGenDB@123456` must be URL encoded:
- `@` → `%40`
- Final: `NextGenDB%40123456`

## Test Connection

Once you have the correct connection string:

```bash
cd backend
npm install
node -e "require('dotenv').config(); const pool = require('./config/database'); pool.query('SELECT NOW()').then(() => console.log('✅ Connected!')).catch(e => console.error('❌', e.message));"
```

## Note

If local connection fails, it's okay - Vercel deployment will work. The connection string from Supabase dashboard is the authoritative source.

