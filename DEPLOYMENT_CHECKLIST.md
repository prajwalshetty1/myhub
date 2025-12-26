# Deployment Checklist - Trading Planner Database Migration

Complete step-by-step guide to deploy Trading Planner changes to Vercel and Supabase.

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:
- [x] Code is committed and pushed to GitHub
- [x] Database migration has been applied (already done via MCP)
- [x] All new tables exist in Supabase
- [x] Backend routes are updated
- [x] Frontend API calls are updated

---

## Part 1: Verify Supabase Database

### Step 1: Check Database Tables

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/editor

2. **Verify all tables exist:**
   - ✅ `trades` (should have new columns: `shares`, `exit_reason`, `exit_date`, `mode`)
   - ✅ `trading_positions`
   - ✅ `trading_settings`
   - ✅ `trading_planned_trades`
   - ✅ `trading_key_levels`
   - ✅ `trading_execution_stages`
   - ✅ `trading_psychology`
   - ✅ `trading_watchlist`
   - ✅ `trading_mode` (already existed)

3. **If tables are missing:**
   - The migration was already applied via MCP, but you can verify in:
   - Supabase Dashboard → SQL Editor → Check table list

---

## Part 2: Deploy Backend to Vercel

### Step 2: Verify Backend Code is Pushed

1. **Check GitHub:**
   - Go to: https://github.com/prajwalshetty1/myhub
   - Verify latest commit includes: "Migrate Trading Planner from localStorage to PostgreSQL database"

### Step 3: Vercel Backend Deployment

1. **Go to Vercel Dashboard:**
   - URL: https://vercel.com/dashboard
   - Find your **backend project** (e.g., `myhub-backend`)

2. **Trigger Redeployment:**
   - Click on your backend project
   - Go to **"Deployments"** tab
   - Find the latest deployment
   - Click **"..."** (three dots) → **"Redeploy"**
   - Or: Vercel should auto-deploy if connected to GitHub

3. **Verify Deployment:**
   - Wait for deployment to complete (1-2 minutes)
   - Check build logs for errors
   - Test the API: `https://your-backend.vercel.app/api/health`
   - Should return: `{"status":"ok","message":"MyHub API is running"}`

### Step 4: Verify Backend Environment Variables

1. **In Vercel Backend Project:**
   - Go to **Settings** → **Environment Variables**
   - Verify these exist:
     - ✅ `DATABASE_URL` (Supabase connection string)
     - ✅ `JWT_SECRET`
     - ✅ `CORS_ORIGIN` (your frontend URL)
     - ✅ `NODE_ENV=production`

2. **If missing, add them:**
   - Click **"Add"** for each variable
   - Copy values from your existing setup
   - Check all environments: Production, Preview, Development

---

## Part 3: Deploy Frontend to Vercel

### Step 5: Frontend Deployment

1. **Go to Vercel Dashboard:**
   - Find your **frontend project** (e.g., `myhub-frontend`)

2. **Trigger Redeployment:**
   - Click on your frontend project
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on latest deployment
   - Or: Vercel should auto-deploy from GitHub

3. **Verify Deployment:**
   - Wait for deployment (1-2 minutes)
   - Check build logs
   - Visit your frontend URL

### Step 6: Verify Frontend Environment Variables

1. **In Vercel Frontend Project:**
   - Go to **Settings** → **Environment Variables**
   - Verify:
     - ✅ `VITE_API_URL` = `https://your-backend.vercel.app/api`
   - Update if backend URL changed

---

## Part 4: Test the Deployment

### Step 7: Test Trading Planner

1. **Access Frontend:**
   - Go to: `https://your-frontend.vercel.app`
   - Login with your account

2. **Navigate to Trading Planner:**
   - Click on "Trading Planner" module
   - Should load without errors

3. **Test Features:**
   - ✅ Create a new position
   - ✅ Switch between Futures/Stocks mode
   - ✅ View positions list
   - ✅ Close a position (creates trade record)
   - ✅ Check Journal tab (should show trades)
   - ✅ Add planned trade
   - ✅ Add key level
   - ✅ Save psychology entry
   - ✅ Update settings

4. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for any API errors
   - Should see successful API calls

5. **Verify Data Persistence:**
   - Create some data
   - Refresh the page
   - Data should still be there (stored in database)

---

## Part 5: Troubleshooting

### Issue: "Table does not exist" Error

**Solution:**
1. Go to Supabase Dashboard → SQL Editor
2. Run this query to check tables:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'trading%';
   ```
3. If tables are missing, the migration might not have applied
4. Contact me to re-run the migration

### Issue: "Authentication required" Error

**Solution:**
1. Make sure you're logged in
2. Check browser localStorage for `authToken`
3. If missing, login again
4. Verify JWT_SECRET in Vercel matches backend

### Issue: API Calls Failing

**Solution:**
1. Check `VITE_API_URL` in frontend environment variables
2. Verify backend is deployed and running
3. Check CORS_ORIGIN in backend matches frontend URL
4. Test backend directly: `https://your-backend.vercel.app/api/health`

### Issue: Database Connection Errors

**Solution:**
1. Verify `DATABASE_URL` in Vercel backend settings
2. Check Supabase project is active
3. Verify connection string format:
   ```
   postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
   ```

---

## Part 6: Verify Database Schema

### Step 8: Check Database Structure

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/editor

2. **Verify Table Columns:**

   **trades table should have:**
   - `id`, `user_id`, `symbol`, `entry_price`, `exit_price`
   - `contracts`, `shares` (NEW)
   - `direction`, `setup_type`, `notes`, `pl`
   - `exit_reason` (NEW), `exit_date` (NEW), `mode` (NEW)
   - `trade_date`, `created_at`

   **trading_positions table should have:**
   - `id`, `user_id`, `symbol`, `direction`
   - `entry_price`, `size`, `stop_loss`, `take_profit`
   - `current_price`, `setup_type`, `mode`
   - `entry_date`, `created_at`, `updated_at`

   **trading_settings table should have:**
   - `id`, `user_id`, `futures_balance`, `stocks_balance`
   - `daily_loss_limit`, `max_risk_per_trade`
   - `created_at`, `updated_at`

   **Other tables:** Check they exist with proper columns

---

## Quick Deployment Commands

If you prefer command line:

```bash
# 1. Verify code is pushed
git status
git log --oneline -5

# 2. If not pushed, push now
git push origin main

# 3. Vercel will auto-deploy if connected to GitHub
# Or manually trigger via Vercel dashboard
```

---

## Success Indicators

✅ **Backend deployed successfully:**
- Health check returns OK
- No errors in Vercel build logs
- API endpoints accessible

✅ **Frontend deployed successfully:**
- Page loads without errors
- Trading Planner module accessible
- No console errors

✅ **Database working:**
- Can create positions
- Can close positions (creates trades)
- Data persists after refresh
- All tabs work (Terminal, Journal, Planner, Analytics, Playbook)

---

## Post-Deployment Verification

After deployment, verify:

1. **Create a test position:**
   - Enter a trade in Terminal tab
   - Should save to database

2. **Close the position:**
   - Click "CLOSE" on the position
   - Should create a trade record
   - Should appear in Journal tab

3. **Check all tabs:**
   - Terminal: Positions list works
   - Charts: TradingView loads
   - Journal: Calendar and trades display
   - Planner: Can add planned trades and key levels
   - Analytics: Statistics calculate correctly
   - Playbook: Execution stages and psychology work

4. **Test persistence:**
   - Create data
   - Refresh page
   - Logout and login again
   - Data should still be there

---

## Need Help?

If you encounter issues:

1. **Check Vercel deployment logs:**
   - Go to deployment → View logs
   - Look for errors

2. **Check Supabase logs:**
   - Supabase Dashboard → Logs
   - Check for database errors

3. **Check browser console:**
   - F12 → Console
   - Look for JavaScript errors

4. **Verify environment variables:**
   - All required variables are set
   - Values are correct

---

## Summary

**What was changed:**
- ✅ Database: Added 7 new tables + updated trades table
- ✅ Backend: Added 20+ new API endpoints
- ✅ Frontend: Migrated from localStorage to API calls

**What needs to be deployed:**
- ✅ Backend to Vercel (auto-deploys from GitHub)
- ✅ Frontend to Vercel (auto-deploys from GitHub)
- ✅ Database migration (already applied via MCP)

**Time required:** 5-10 minutes

---

**Ready to deploy?** Follow steps 1-8 above! 🚀

