# Complete Vercel & Supabase Setup Guide

Step-by-step instructions to configure MyHub on Vercel with Supabase.

---

## 📋 Prerequisites Checklist

- [x] Code pushed to GitHub: https://github.com/prajwalshetty1/myhub
- [x] Supabase project created: jarhhglbeawefqpgmuch
- [x] Database tables created (verified ✅)
- [x] Database password: NextGenDB@123456

---

## Part 1: Supabase Configuration

### Step 1: Get Connection String from Supabase

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database

2. **Find Connection String:**
   - Scroll down to **"Connection string"** section
   - Click on **"URI"** tab
   - You'll see a connection string like:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
     ```
   - **Copy this entire string**

3. **Replace Password:**
   - In the copied string, find `[YOUR-PASSWORD]`
   - Replace it with: `NextGenDB%40123456`
   - **Note:** The `@` symbol is URL encoded as `%40`

4. **Alternative: Direct Connection**
   - If you prefer direct connection, use:
     ```
     postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
     ```
   - **Recommended for Vercel:** Use the **pooler connection** (from step 2) for better serverless performance

### Step 2: Verify Database Tables

✅ All tables are already created. You can verify in:
- Supabase Dashboard → Table Editor
- Or SQL Editor: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/sql

---

## Part 2: Vercel Backend Deployment

### Step 3: Sign in to Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. **Sign in with GitHub** (recommended) - connects your GitHub account automatically

### Step 4: Create Backend Project

1. In Vercel dashboard, click **"Add New..."** (top right)
2. Select **"Project"**
3. You'll see your GitHub repositories
4. Find **"prajwalshetty1/myhub"** and click **"Import"**

### Step 5: Configure Backend Project Settings

**In the "Configure Project" page:**

1. **Project Name:**
   - Enter: `myhub-backend` (or any name you prefer)

2. **Framework Preset:**
   - Click the dropdown
   - Select **"Other"**

3. **Root Directory:**
   - Click **"Edit"** button next to it
   - Type: `backend`
   - Click **"Continue"** or press Enter

4. **Build and Output Settings:**
   - **Build Command:** Leave **empty** (delete any default value)
   - **Output Directory:** Leave **empty**
   - **Install Command:** `npm install` (or leave as default)

### Step 6: Add Backend Environment Variables

**Scroll down to "Environment Variables" section:**

Click **"Add"** or the **"+"** button for each variable:

**Variable 1: DATABASE_URL**
- **Key:** `DATABASE_URL`
- **Value:** `postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres`
  - Or use the pooler connection string from Step 1 (recommended)
- **Environments:** Check all three boxes:
  - ☑️ Production
  - ☑️ Preview  
  - ☑️ Development
- Click **"Save"**

**Variable 2: JWT_SECRET**
- **Key:** `JWT_SECRET`
- **Value:** `6e8d860000af930d37115f7d162bf41b4837167e7c5786d7ea5f68755fbed51a`
- **Environments:** Check all three
- Click **"Save"**

**Variable 3: CORS_ORIGIN**
- **Key:** `CORS_ORIGIN`
- **Value:** `https://myhub-frontend.vercel.app` (we'll update this after frontend deploys)
- **Environments:** Check all three
- Click **"Save"**

**Variable 4: NODE_ENV**
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environments:** Check all three
- Click **"Save"**

### Step 7: Deploy Backend

1. Scroll to the bottom of the page
2. Click the big **"Deploy"** button
3. Wait for deployment (1-2 minutes)
4. Watch the build logs in real-time

### Step 8: Get Backend URL

1. After deployment completes, you'll see **"Congratulations!"**
2. Your backend URL will be displayed (e.g., `myhub-backend.vercel.app`)
3. **Copy this URL** - you'll need it!
4. The full API URL is: `https://[YOUR-BACKEND-URL]/api`
5. **Write this down somewhere!**

**Test the backend:**
- Visit: `https://[YOUR-BACKEND-URL]/api/health`
- You should see: `{"status":"ok","message":"MyHub API is running"}`

---

## Part 3: Vercel Frontend Deployment

### Step 9: Create Frontend Project

1. In Vercel dashboard, click **"Add New..."** again
2. Select **"Project"**
3. Find **"prajwalshetty1/myhub"** again and click **"Import"**

### Step 10: Configure Frontend Project Settings

**In the "Configure Project" page:**

1. **Project Name:**
   - Enter: `myhub-frontend` (or any name you prefer)

2. **Framework Preset:**
   - Click dropdown → Select **"Other"**

3. **Root Directory:**
   - Click **"Edit"** button
   - Type: `master-hub`
   - Click **"Continue"**

4. **Build and Output Settings:**
   - **Build Command:** `node build.js` (or leave empty)
   - **Output Directory:** `.` (just a period/dot)
   - **Install Command:** Leave empty (or delete default)

### Step 11: Add Frontend Environment Variable

**Scroll to "Environment Variables" section:**

Click **"Add"**:

**Variable: VITE_API_URL**
- **Key:** `VITE_API_URL`
- **Value:** `https://[YOUR-BACKEND-URL]/api`
  - Replace `[YOUR-BACKEND-URL]` with your actual backend URL from Step 8
  - Example: `https://myhub-backend.vercel.app/api`
- **Environments:** Check all three
- Click **"Save"**

### Step 12: Deploy Frontend

1. Scroll to bottom
2. Click **"Deploy"** button
3. Wait for deployment (1-2 minutes)

### Step 13: Get Frontend URL

1. After deployment, your frontend URL will be shown
2. **Copy this URL** - this is your live application!
3. Example: `https://myhub-frontend.vercel.app`

---

## Part 4: Update CORS Configuration

### Step 14: Update Backend CORS

1. Go back to your **backend project** in Vercel dashboard
2. Click on **"Settings"** tab (top navigation)
3. Click **"Environment Variables"** in left sidebar
4. Find the `CORS_ORIGIN` variable
5. Click the **pencil/edit icon** (or click on the variable)
6. Update the **Value** field:
   - Change from: `https://myhub-frontend.vercel.app`
   - To: Your actual frontend URL from Step 13
   - Example: `https://myhub-frontend.vercel.app`
7. Click **"Save"**

### Step 15: Redeploy Backend

1. Go to **"Deployments"** tab in backend project
2. Find the latest deployment
3. Click the **"..."** (three dots) menu on the right
4. Select **"Redeploy"**
5. Click **"Redeploy"** in the confirmation dialog
6. Wait for redeployment to complete

---

## Part 5: Test Your Application

### Step 16: Access Your Application

1. Open your frontend URL in a browser (from Step 13)
2. You should see the MyHub login page
3. If you see any errors, check the browser console (F12)

### Step 17: Register an Account

1. Click **"Register"** button
2. Fill in the form:
   - **Name:** Your name
   - **Username:** Choose a username (e.g., `prajwal`)
   - **Email:** Your email address
   - **Password:** Choose a secure password
3. Click **"Register"**
4. You should be automatically logged in and redirected to the main hub

### Step 18: Test Functionality

1. **Test Habit Tracker:**
   - Check off a habit
   - Refresh page - it should persist

2. **Test Task Tracker:**
   - Click on "Task Tracker" module
   - Create a new task
   - Refresh - task should still be there

3. **Test Other Modules:**
   - Try creating data in any module
   - Refresh page - data should persist

---

## 🔧 Troubleshooting

### Backend Deployment Fails

**Check:**
- Root directory is set to `backend` (not `master-hub`)
- Environment variables are added correctly
- Check deployment logs for specific errors

**Common Issues:**
- **"Module not found"**: Make sure `npm install` runs (check Install Command)
- **"Database connection failed"**: Verify `DATABASE_URL` is correct and password is URL encoded
- **"Port already in use"**: Vercel handles this automatically, ignore if you see it

### Frontend Shows "API not found"

**Check:**
- `VITE_API_URL` is set correctly with your backend URL
- Backend is deployed and running
- Open browser console (F12) and check for errors

**Fix:**
- Verify backend URL is correct
- Make sure backend deployment succeeded
- Check `VITE_API_URL` includes `/api` at the end

### CORS Errors

**Symptoms:**
- Browser console shows: "CORS policy blocked"
- API requests fail

**Fix:**
1. Go to backend project → Settings → Environment Variables
2. Verify `CORS_ORIGIN` matches your frontend URL exactly
3. Include `https://` protocol
4. No trailing slash
5. Redeploy backend

### Database Connection Errors

**Check:**
- `DATABASE_URL` is correct
- Password is URL encoded (`%40` for `@`)
- Supabase project is active

**Fix:**
- Get connection string from Supabase dashboard
- Use pooler connection for better reliability
- Verify password: `NextGenDB%40123456`

### Registration/Login Fails

**Check:**
- Backend is running (test `/api/health`)
- Database connection is working
- Check Vercel function logs

**Fix:**
- Check backend deployment logs
- Verify database tables exist
- Check Supabase dashboard for connection issues

---

## 📝 Quick Reference

### Your Configuration

**Supabase:**
- Project: jarhhglbeawefqpgmuch
- URL: https://jarhhglbeawefqpgmuch.supabase.co
- Password: NextGenDB@123456 (URL encoded: NextGenDB%40123456)

**Backend Environment Variables:**
```
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
JWT_SECRET=6e8d860000af930d37115f7d162bf41b4837167e7c5786d7ea5f68755fbed51a
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

**Frontend Environment Variable:**
```
VITE_API_URL=https://your-backend.vercel.app/api
```

### Project Settings Summary

**Backend:**
- Root Directory: `backend`
- Framework: Other
- Build Command: (empty)
- Output Directory: (empty)

**Frontend:**
- Root Directory: `master-hub`
- Framework: Other
- Build Command: `node build.js` (or empty)
- Output Directory: `.`

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Backend health check works: `https://[backend]/api/health`
- [ ] Frontend loads without errors
- [ ] Can register new account
- [ ] Can login
- [ ] Can create tasks/habits/data
- [ ] Data persists after refresh
- [ ] No CORS errors in console
- [ ] All modules accessible

---

## 🎉 You're Done!

Your MyHub application is now live on Vercel with Supabase database!

**Next Steps:**
- Share your frontend URL with others
- Monitor usage in Vercel and Supabase dashboards
- Future updates: Just push to GitHub - Vercel auto-deploys!

---

## 📚 Additional Resources

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch
- **GitHub Repository:** https://github.com/prajwalshetty1/myhub

---

**Need help?** Check the troubleshooting section above or review deployment logs in Vercel dashboard.

