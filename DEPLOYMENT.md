# Deployment Guide

Complete guide for deploying MyHub to Vercel (frontend) and Supabase (database).

## Prerequisites

1. **GitHub Account** - Code repository
2. **Supabase Account** - Database (free tier: https://supabase.com)
3. **Vercel Account** - Frontend hosting (free tier: https://vercel.com)

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Fill in:
   - Project name: `myhub`
   - Database password: (save this!)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)

### 1.2 Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `backend/migrations/schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify tables are created in **Table Editor**

### 1.3 Get Connection Details

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (for client-side)
   - **service_role key** (for server-side - keep secret!)

3. Go to **Settings** → **Database**
4. Copy:
   - **Connection string** (under "Connection string" → "URI")
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

## Step 2: Deploy Backend to Vercel

### 2.1 Prepare Backend for Vercel

Vercel supports serverless functions. We'll deploy the Express app as serverless functions.

### 2.2 Create Vercel Configuration

The `vercel.json` file is already created in the backend folder.

### 2.3 Deploy Backend

**Option A: Using Vercel CLI**

```bash
cd backend
npm install -g vercel
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (your account)
- Link to existing project? **No**
- Project name: `myhub-backend`
- Directory: `./`
- Override settings? **No**

**Option B: Using GitHub Integration**

1. Push code to GitHub (see Step 4)
2. Go to [vercel.com](https://vercel.com)
3. Click **Add New Project**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

6. Add Environment Variables:
   ```
   DB_HOST=db.xxxxx.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_supabase_password
   JWT_SECRET=your_random_secret_key_here
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

7. Click **Deploy**

### 2.4 Get Backend URL

After deployment, Vercel will give you a URL like:
`https://myhub-backend.vercel.app`

Save this URL - you'll need it for the frontend.

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend

1. Update API URL in `master-hub/scripts/api-client.js`:
   ```javascript
   const API_BASE_URL = process.env.VITE_API_URL || 'https://your-backend-url.vercel.app/api';
   ```

   Or better, use environment variable (see below).

### 3.2 Deploy Frontend

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `master-hub`
   - **Build Command:** (leave empty - static site)
   - **Output Directory:** `.` (current directory)
   - **Install Command:** (leave empty)

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```

6. Click **Deploy**

### 3.3 Update CORS in Backend

After frontend is deployed, update backend CORS_ORIGIN:
1. Go to Vercel dashboard → Your backend project
2. Go to **Settings** → **Environment Variables**
3. Update `CORS_ORIGIN` to your frontend URL:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
4. Redeploy backend

## Step 4: Push to GitHub

### 4.1 Initialize Git (if not already)

```bash
cd /Users/prajwal/Desktop/Cursor/MyHub
git init
git add .
git commit -m "Initial commit: MyHub with Supabase and Vercel setup"
```

### 4.2 Add Remote and Push

```bash
git remote add origin https://github.com/prajwalshetty1/myhub.git
git branch -M main
git push -u origin main
```

If you get authentication errors, use:
```bash
git remote set-url origin https://github.com/prajwalshetty1/myhub.git
git push -u origin main
```

Or use SSH:
```bash
git remote set-url origin git@github.com:prajwalshetty1/myhub.git
git push -u origin main
```

## Step 5: Environment Variables Summary

### Backend (Vercel)
```
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
JWT_SECRET=generate_random_string_here
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend.vercel.app/api
```

## Step 6: Test Deployment

1. **Test Frontend:**
   - Visit your Vercel frontend URL
   - Should redirect to login page

2. **Test Registration:**
   - Create a new account
   - Should successfully register

3. **Test Login:**
   - Login with your credentials
   - Should redirect to main hub

4. **Test Data:**
   - Create a task, habit, etc.
   - Refresh page
   - Data should persist

## Troubleshooting

### Database Connection Issues

- Verify Supabase connection string is correct
- Check if Supabase project is active
- Verify password is correct (no special characters need encoding)

### CORS Errors

- Ensure `CORS_ORIGIN` in backend matches frontend URL exactly
- Include protocol (`https://`)
- No trailing slash

### API Not Found

- Verify `VITE_API_URL` in frontend matches backend URL
- Check backend is deployed and running
- Verify API routes are correct

### Authentication Issues

- Clear browser localStorage
- Check JWT_SECRET is set in backend
- Verify token is being sent in requests

## Custom Domain (Optional)

### Frontend
1. In Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Backend
1. Same process for backend project
2. Update `CORS_ORIGIN` to include custom domain

## Monitoring

- **Vercel Analytics:** Enable in project settings
- **Supabase Dashboard:** Monitor database usage
- **Vercel Logs:** Check function logs for errors

## Updates

After making changes:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Vercel auto-deploys** from GitHub (if connected)

3. **Manual redeploy:**
   - Go to Vercel dashboard
   - Click "Redeploy" if needed

## Cost

- **Supabase:** Free tier includes 500MB database, 2GB bandwidth
- **Vercel:** Free tier includes 100GB bandwidth, serverless functions
- **Total:** $0/month for small to medium usage

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: https://github.com/prajwalshetty1/myhub/issues

