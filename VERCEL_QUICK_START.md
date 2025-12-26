# Vercel Quick Start - Copy & Paste Guide

Quick reference for Vercel deployment.

## Backend Deployment

### Project Settings
- **Framework:** Other
- **Root Directory:** `backend`
- **Build Command:** (empty)
- **Output Directory:** (empty)

### Environment Variables
```
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
JWT_SECRET=6e8d860000af930d37115f7d162bf41b4837167e7c5786d7ea5f68755fbed51a
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

**Note:** Update `CORS_ORIGIN` after frontend deploys!

---

## Frontend Deployment

### Project Settings
- **Framework:** Other
- **Root Directory:** `master-hub`
- **Build Command:** `node build.js` (or empty)
- **Output Directory:** `.`

### Environment Variable
```
VITE_API_URL=https://your-backend.vercel.app/api
```

**Note:** Replace `your-backend.vercel.app` with your actual backend URL!

---

## After Both Deploy

1. Update backend `CORS_ORIGIN` with frontend URL
2. Redeploy backend
3. Test your application!

---

See `VERCEL_STEP_BY_STEP.md` for detailed instructions.

