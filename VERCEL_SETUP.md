# Vercel Setup Instructions

Step-by-step guide for deploying MyHub to Vercel.

## Frontend Deployment

### Step 1: Import Project

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select `prajwalshetty1/myhub`
5. Click **"Import"**

### Step 2: Configure Frontend

**Project Settings:**
- **Framework Preset:** Other
- **Root Directory:** `master-hub`
- **Build Command:** (leave empty - static site)
- **Output Directory:** `.` (current directory)
- **Install Command:** (leave empty)

**Environment Variables:**
Click **"Environment Variables"** and add:

```
VITE_API_URL = https://your-backend-url.vercel.app/api
```

Replace `your-backend-url` with your actual backend URL (you'll get this after deploying backend).

### Step 3: Deploy

Click **"Deploy"** and wait for deployment to complete.

**Note:** After backend is deployed, update `VITE_API_URL` with the correct backend URL and redeploy.

---

## Backend Deployment

### Step 1: Import Project (Again)

1. In Vercel dashboard, click **"Add New Project"** again
2. Import the same repository: `prajwalshetty1/myhub`

### Step 2: Configure Backend

**Project Settings:**
- **Framework Preset:** Other
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Output Directory:** (leave empty)
- **Install Command:** `npm install`

**Environment Variables:**
Add these variables:

```
DATABASE_URL = postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET = [generate random string]
CORS_ORIGIN = https://your-frontend.vercel.app
NODE_ENV = production
```

**To get DATABASE_URL:**
1. Go to Supabase dashboard
2. Settings → Database
3. Copy "Connection string" → "URI"
4. Replace `[PASSWORD]` with your Supabase database password

**To generate JWT_SECRET:**
```bash
openssl rand -hex 32
```

Or use any random string (keep it secret!)

**CORS_ORIGIN:**
- Use your frontend Vercel URL (from frontend deployment)
- Format: `https://your-project-name.vercel.app`

### Step 3: Deploy

Click **"Deploy"** and wait for deployment.

### Step 4: Update Frontend

After backend is deployed:

1. Go to frontend project in Vercel
2. Settings → Environment Variables
3. Update `VITE_API_URL` to: `https://your-backend-url.vercel.app/api`
4. Go to Deployments → Click "..." → Redeploy

---

## Quick Reference

### Frontend Environment Variables
```
VITE_API_URL=https://myhub-backend.vercel.app/api
```

### Backend Environment Variables
```
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=https://myhub-frontend.vercel.app
NODE_ENV=production
```

### URLs After Deployment

- **Frontend:** `https://myhub-frontend.vercel.app`
- **Backend:** `https://myhub-backend.vercel.app`
- **API:** `https://myhub-backend.vercel.app/api`

---

## Troubleshooting

### Frontend shows "API not found"
- Check `VITE_API_URL` is set correctly
- Verify backend is deployed and running
- Check browser console for errors

### Backend connection errors
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Verify password in connection string

### CORS errors
- Ensure `CORS_ORIGIN` matches frontend URL exactly
- Include `https://` protocol
- No trailing slash

---

## Custom Domains

### Add Custom Domain to Frontend

1. Frontend project → Settings → Domains
2. Add your domain (e.g., `myhub.com`)
3. Follow DNS configuration instructions
4. Update `CORS_ORIGIN` in backend to include custom domain

### Add Custom Domain to Backend

1. Backend project → Settings → Domains
2. Add subdomain (e.g., `api.myhub.com`)
3. Update `VITE_API_URL` in frontend to use custom domain

---

## Auto-Deploy from GitHub

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically:
1. Detect the push
2. Build and deploy
3. Update your live site

---

## Monitoring

- **Vercel Dashboard:** View deployments, logs, analytics
- **Supabase Dashboard:** Monitor database usage, connections
- **Vercel Logs:** Check function logs for errors

---

## Cost

- **Vercel:** Free tier includes:
  - 100GB bandwidth/month
  - Serverless functions
  - Automatic HTTPS
  - Custom domains

- **Supabase:** Free tier includes:
  - 500MB database
  - 2GB bandwidth/month
  - 50,000 monthly active users

**Total: $0/month** for small to medium usage!

