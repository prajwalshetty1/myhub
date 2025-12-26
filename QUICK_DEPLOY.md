# Quick Deployment Guide

Fast setup for MyHub on Supabase + Vercel.

## 🚀 5-Minute Setup

### 1. Supabase Setup (2 min)

1. Go to https://supabase.com → Create Project
2. Wait for project creation
3. Go to **SQL Editor** → **New Query**
4. Copy entire `backend/migrations/schema.sql` → Paste → **Run**
5. Go to **Settings** → **API** → Copy:
   - Project URL
   - `service_role` key (secret!)
6. Go to **Settings** → **Database** → Copy **Connection string (URI)**

### 2. Push to GitHub (1 min)

```bash
cd /Users/prajwal/Desktop/Cursor/MyHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/prajwalshetty1/myhub.git
git branch -M main
git push -u origin main
```

### 3. Deploy Backend to Vercel (1 min)

1. Go to https://vercel.com → **Add New Project**
2. Import `prajwalshetty1/myhub`
3. Settings:
   - **Root Directory:** `backend`
   - **Framework:** Other
4. Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   JWT_SECRET=your_random_secret_here
   CORS_ORIGIN=https://your-frontend.vercel.app
   NODE_ENV=production
   ```
5. **Deploy** → Copy backend URL

### 4. Deploy Frontend to Vercel (1 min)

1. **Add New Project** → Import same repo
2. Settings:
   - **Root Directory:** `master-hub`
   - **Framework:** Other
3. Environment Variables:
   ```
   VITE_API_URL=https://your-backend.vercel.app/api
   ```
4. **Deploy** → Copy frontend URL

### 5. Update CORS (30 sec)

1. Backend project → **Settings** → **Environment Variables**
2. Update `CORS_ORIGIN` to frontend URL
3. **Redeploy**

## ✅ Done!

Visit your frontend URL → Register → Start using MyHub!

## 🔑 Environment Variables Cheat Sheet

**Backend:**
- `DATABASE_URL` - Supabase connection string
- `JWT_SECRET` - Random string (use: `openssl rand -hex 32`)
- `CORS_ORIGIN` - Frontend URL

**Frontend:**
- `VITE_API_URL` - Backend API URL

## 🐛 Common Issues

**Database connection fails:**
- Check password has no special chars (or URL encode them)
- Verify Supabase project is active

**CORS errors:**
- Ensure `CORS_ORIGIN` matches frontend URL exactly
- Include `https://` protocol

**API not found:**
- Verify `VITE_API_URL` is set correctly
- Check backend is deployed

## 📚 Full Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

