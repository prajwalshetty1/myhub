# Vercel Environment Variables

Use these environment variables when deploying to Vercel.

## Backend Environment Variables

Add these in Vercel → Your Backend Project → Settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
JWT_SECRET=your_secure_random_string_here
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### Generate JWT Secret

```bash
openssl rand -hex 32
```

Or use any secure random string (keep it secret!).

### Notes

- **DATABASE_URL:** Password is URL encoded (`@` becomes `%40`)
- **CORS_ORIGIN:** Update with your actual frontend Vercel URL after deployment
- **JWT_SECRET:** Use a strong random string for production

## Frontend Environment Variables

Add this in Vercel → Your Frontend Project → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend.vercel.app/api
```

Replace `your-backend.vercel.app` with your actual backend Vercel URL.

## Security Notes

⚠️ **Important:**
- Never commit `.env` files to git (they're in .gitignore)
- Use Vercel's environment variables for production
- Rotate JWT_SECRET regularly
- Keep database password secure

## Quick Setup

1. **Backend:**
   - Copy `DATABASE_URL` from above
   - Generate `JWT_SECRET` with `openssl rand -hex 32`
   - Set `CORS_ORIGIN` after frontend is deployed

2. **Frontend:**
   - Set `VITE_API_URL` after backend is deployed

