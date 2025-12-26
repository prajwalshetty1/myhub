# Supabase Connection Details

## ✅ Supabase Connected!

Your Supabase project is connected and all database tables are created!

### Project Information

- **Project URL:** https://jarhhglbeawefqpgmuch.supabase.co
- **Project Reference:** `jarhhglbeawefqpgmuch`
- **Database:** All tables created successfully ✅

### Database Connection String

To get your full connection string:

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch

2. **Get Connection String:**
   - Go to **Settings** → **Database**
   - Scroll to **Connection string** section
   - Select **URI** tab
   - Copy the connection string

   It will look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

   Or for direct connection:
   ```
   postgresql://postgres:[PASSWORD]@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
   ```

3. **Get Database Password:**
   - In the same Database settings page
   - Click **Reset database password** if you don't remember it
   - Or check your project setup notes

### For Backend Environment Variables

Use this format in your `.env` file or Vercel:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
```

Or use the pooler connection (recommended for serverless):
```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### API Keys (for reference)

- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphcmhoZ2xiZWF3ZWZxcGdtdWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2ODkzNDUsImV4cCI6MjA4MjI2NTM0NX0.ZyhgD7VKmpdConxB6H1t1UD0A2hrSacIBUG_96ZCANQ`
- **Publishable Key:** `sb_publishable_E3Kx9e8EcSa_ZnjnoRZp2A_EpExqyxf`

### Database Status

✅ All tables created:
- users
- phoenix_schedule
- phoenix_selected_tasks
- phoenix_completed_tasks
- phoenix_supplements
- phoenix_supplements_taken
- tasks
- diet_meals
- diet_goals
- diet_water
- diet_fasting
- trades
- trading_mode
- learning_topics
- projects
- hub_habits
- hub_habit_logs
- hub_intentions
- hub_gamification
- hub_activity_log

### Next Steps

1. Get your database password from Supabase dashboard
2. Construct the full connection string
3. Add it to your backend `.env` file or Vercel environment variables
4. Test the connection

### Quick Access

- **Dashboard:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch
- **SQL Editor:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/sql
- **Database Settings:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database

