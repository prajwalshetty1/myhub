# Vercel Deployment - Step by Step Guide

Complete step-by-step instructions for deploying MyHub to Vercel.

## Prerequisites

✅ Code pushed to GitHub: https://github.com/prajwalshetty1/myhub  
✅ Supabase database configured  
✅ Connection string ready

---

## Part 1: Deploy Backend to Vercel

### Step 1: Sign in to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Sign in with GitHub (recommended) - this connects your GitHub account

### Step 2: Create New Project (Backend)

1. After logging in, you'll see the Vercel dashboard
2. Click **"Add New..."** button (top right)
3. Select **"Project"**

### Step 3: Import GitHub Repository

1. You'll see a list of your GitHub repositories
2. Find **"prajwalshetty1/myhub"** (or search for "myhub")
3. Click **"Import"** next to it

### Step 4: Configure Backend Project

**Project Settings:**
- **Project Name:** `myhub-backend` (or any name you like)
- **Framework Preset:** Click dropdown → Select **"Other"**
- **Root Directory:** Click **"Edit"** → Type: `backend`
- **Build Command:** Leave empty (or delete any default value)
- **Output Directory:** Leave empty
- **Install Command:** `npm install` (or leave as default)

**Important:** Make sure **Root Directory** is set to `backend`!

### Step 5: Add Environment Variables (Backend)

1. Scroll down to **"Environment Variables"** section
2. Click **"Add"** or the **"+"** button
3. Add each variable one by one:

   **Variable 1:**
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres`
   - **Environment:** Select all (Production, Preview, Development)

   **Variable 2:**
   - **Key:** `JWT_SECRET`
   - **Value:** `6e8d860000af930d37115f7d162bf41b4837167e7c5786d7ea5f68755fbed51a`
   - **Environment:** Select all

   **Variable 3:**
   - **Key:** `CORS_ORIGIN`
   - **Value:** `https://your-frontend.vercel.app` (we'll update this after frontend deploys)
   - **Environment:** Select all

   **Variable 4:**
   - **Key:** `NODE_ENV`
   - **Value:** `production`
   - **Environment:** Select all

### Step 6: Deploy Backend

1. Scroll to the bottom
2. Click **"Deploy"** button
3. Wait for deployment (takes 1-2 minutes)
4. You'll see build logs in real-time

### Step 7: Get Backend URL

1. After deployment completes, you'll see **"Congratulations!"** message
2. Your backend URL will be shown (e.g., `myhub-backend.vercel.app`)
3. **Copy this URL** - you'll need it for the frontend!
4. The full API URL will be: `https://myhub-backend.vercel.app/api`

**Note:** Write down this URL somewhere!

---

## Part 2: Deploy Frontend to Vercel

### Step 8: Create Another Project (Frontend)

1. In Vercel dashboard, click **"Add New..."** again
2. Select **"Project"**

### Step 9: Import Same Repository

1. Find **"prajwalshetty1/myhub"** again
2. Click **"Import"**

### Step 10: Configure Frontend Project

**Project Settings:**
- **Project Name:** `myhub-frontend` (or any name you like)
- **Framework Preset:** Click dropdown → Select **"Other"**
- **Root Directory:** Click **"Edit"** → Type: `master-hub`
- **Build Command:** `node build.js` (or leave empty)
- **Output Directory:** `.` (period/dot)
- **Install Command:** Leave empty (or delete default)

**Important:** Make sure **Root Directory** is set to `master-hub`!

### Step 11: Add Environment Variable (Frontend)

1. Scroll to **"Environment Variables"** section
2. Click **"Add"**
3. Add this variable:

   **Variable:**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://myhub-backend.vercel.app/api` (use your actual backend URL from Step 7)
   - **Environment:** Select all (Production, Preview, Development)

### Step 12: Deploy Frontend

1. Scroll to the bottom
2. Click **"Deploy"** button
3. Wait for deployment (takes 1-2 minutes)

### Step 13: Get Frontend URL

1. After deployment completes
2. Your frontend URL will be shown (e.g., `myhub-frontend.vercel.app`)
3. **Copy this URL** - this is your live application!

---

## Part 3: Update CORS (Important!)

### Step 14: Update Backend CORS

1. Go back to your **backend project** in Vercel dashboard
2. Click on **"Settings"** tab (top navigation)
3. Click **"Environment Variables"** in the left sidebar
4. Find the `CORS_ORIGIN` variable
5. Click the **pencil/edit icon** (or click on it)
6. Update the **Value** to your frontend URL: `https://myhub-frontend.vercel.app`
7. Click **"Save"**

### Step 15: Redeploy Backend

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** (three dots) menu
4. Select **"Redeploy"**
5. Confirm redeployment

---

## Part 4: Test Your Application

### Step 16: Access Your Application

1. Go to your frontend URL (from Step 13)
2. You should see the MyHub login page
3. Click **"Register"** to create an account
4. Fill in:
   - Name: Your name
   - Username: Choose a username
   - Email: Your email
   - Password: Choose a password
5. Click **"Register"**

### Step 17: Verify Everything Works

1. After registration, you should be logged in
2. You should see the main MyHub dashboard
3. Try creating a task, habit, or using any module
4. Refresh the page - data should persist

---

## Troubleshooting

### Backend deployment fails

**Check:**
- Root directory is set to `backend`
- Environment variables are correct
- Check deployment logs for errors

**Common fixes:**
- Make sure `DATABASE_URL` has URL-encoded password (`%40` for `@`)
- Verify JWT_SECRET is set

### Frontend shows "API not found"

**Check:**
- `VITE_API_URL` is set correctly
- Backend is deployed and running
- Check browser console for errors

**Fix:**
- Verify backend URL is correct
- Make sure backend deployment succeeded

### CORS errors

**Check:**
- `CORS_ORIGIN` in backend matches frontend URL exactly
- Include `https://` protocol
- No trailing slash

**Fix:**
- Update `CORS_ORIGIN` in backend settings
- Redeploy backend

### Database connection errors

**Check:**
- `DATABASE_URL` is correct
- Password is URL encoded
- Supabase project is active

**Fix:**
- Get connection string from Supabase dashboard
- Use Connection Pooler for better reliability

---

## Quick Reference

### Your URLs

After deployment, you'll have:
- **Frontend:** `https://myhub-frontend.vercel.app`
- **Backend API:** `https://myhub-backend.vercel.app/api`

### Environment Variables Summary

**Backend:**
```
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
JWT_SECRET=6e8d860000af930d37115f7d162bf41b4837167e7c5786d7ea5f68755fbed51a
CORS_ORIGIN=https://myhub-frontend.vercel.app
NODE_ENV=production
```

**Frontend:**
```
VITE_API_URL=https://myhub-backend.vercel.app/api
```

---

## Success Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] CORS_ORIGIN updated
- [ ] Backend redeployed with new CORS
- [ ] Can access frontend URL
- [ ] Can register new account
- [ ] Can login
- [ ] Can create data (tasks, habits, etc.)
- [ ] Data persists after refresh

---

## Next Steps After Deployment

1. **Custom Domain (Optional):**
   - Add custom domain in Vercel project settings
   - Update CORS_ORIGIN and VITE_API_URL accordingly

2. **Monitor:**
   - Check Vercel dashboard for deployment status
   - Monitor Supabase dashboard for database usage
   - Check Vercel logs if issues occur

3. **Update:**
   - Future code changes: Just push to GitHub
   - Vercel auto-deploys on every push!

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch

---

**You're ready to deploy! Follow the steps above and your MyHub will be live! 🚀**

