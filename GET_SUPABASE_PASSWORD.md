# Get Your Supabase Database Password

## Quick Steps

1. **Go to Supabase Dashboard:**
   - Direct link: https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database

2. **Find Connection String:**
   - Scroll to **"Connection string"** section
   - Click on **"URI"** tab
   - You'll see a connection string like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
     ```
   - The password is between `postgres:` and `@`

3. **Or Reset Password:**
   - If you don't remember the password
   - Click **"Reset database password"** button
   - Copy the new password shown

4. **Use the Connection String:**
   - Copy the entire connection string
   - Use it as `DATABASE_URL` in your backend `.env` file
   - Or use it in Vercel environment variables

## Connection String Format

Your connection string will be:
```
postgresql://postgres:[PASSWORD]@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
```

Replace `[PASSWORD]` with your actual database password.

## For Vercel Deployment

When deploying to Vercel, use the connection string as the `DATABASE_URL` environment variable.

## Pooler Connection (Recommended for Serverless)

For better performance with Vercel serverless functions, use the pooler connection:

1. In Supabase Dashboard → Settings → Database
2. Look for **"Connection pooling"** section
3. Use the **"Session mode"** or **"Transaction mode"** connection string
4. Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

## Quick Access Links

- **Database Settings:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/settings/database
- **SQL Editor:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch/sql
- **Project Dashboard:** https://supabase.com/dashboard/project/jarhhglbeawefqpgmuch

