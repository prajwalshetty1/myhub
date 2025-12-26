# Supabase Connection Information

## ✅ Connection Details Retrieved

### Project Information
- **Project URL:** https://jarhhglbeawefqpgmuch.supabase.co
- **Project Reference:** jarhhglbeawefqpgmuch
- **Database:** postgres
- **User:** postgres
- **Password:** NextGenDB@123456

### Connection String Format

**Direct Connection:**
```
postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
```

**Note:** The `@` in password is URL encoded as `%40`

### For Vercel (Connection Pooler - Recommended)

The pooler connection string can be found in your Supabase dashboard:
1. Go to: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database
2. Scroll to **"Connection pooling"** section
3. Copy the **"Session mode"** connection string
4. Replace `[YOUR-PASSWORD]` with `NextGenDB%40123456`

Pooler format (example):
```
postgresql://postgres.jarhhglbeawefqpgmuch:NextGenDB%40123456@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Database Status

✅ All tables verified and ready:
- users
- phoenix_schedule, phoenix_selected_tasks, phoenix_completed_tasks
- phoenix_supplements, phoenix_supplements_taken
- tasks
- diet_meals, diet_goals, diet_water, diet_fasting
- trades, trading_mode
- learning_topics
- projects
- hub_habits, hub_habit_logs, hub_intentions, hub_gamification, hub_activity_log

### Environment Variables for Vercel

**Backend:**
```env
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
JWT_SECRET=[generate with: openssl rand -hex 32]
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

**Frontend:**
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

### Quick Links

- **Dashboard:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch
- **Database Settings:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database
- **SQL Editor:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/sql

### Security Notes

⚠️ **Important:**
- Never commit `.env` files (already in .gitignore)
- Use Vercel environment variables for production
- The password `NextGenDB@123456` is configured
- URL encode special characters in connection strings

