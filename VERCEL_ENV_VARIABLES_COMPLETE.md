# Vercel Environment Variables - Complete List

Copy and paste these exact values into Vercel.

---

## 🔵 Backend Environment Variables

Add these in: **Vercel → Backend Project → Settings → Environment Variables**

### 1. DATABASE_URL
```
postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
```

**Or use Pooler (Recommended for Vercel):**
Get from Supabase Dashboard → Settings → Database → Connection pooling → Session mode
Then replace `[YOUR-PASSWORD]` with `NextGenDB%40123456`

### 2. JWT_SECRET
```
6e8d860000af930d37115f7d162bf41b4837167e7c5786d7ea5f68755fbed51a
```

### 3. CORS_ORIGIN
```
https://myhub-frontend.vercel.app
```
**Update this** with your actual frontend URL after frontend deploys!

### 4. NODE_ENV
```
production
```

**For each variable:**
- Check all environments: ☑️ Production ☑️ Preview ☑️ Development

---

## 🟢 Frontend Environment Variable

Add this in: **Vercel → Frontend Project → Settings → Environment Variables**

### VITE_API_URL
```
https://myhub-backend.vercel.app/api
```
**Replace `myhub-backend.vercel.app`** with your actual backend URL!

**Environment:** Check all: ☑️ Production ☑️ Preview ☑️ Development

---

## 📋 Deployment Order

1. **Deploy Backend first** → Get backend URL
2. **Deploy Frontend** → Use backend URL in `VITE_API_URL`
3. **Update Backend CORS_ORIGIN** → Use frontend URL
4. **Redeploy Backend** → Apply CORS changes

---

## 🔍 Verification

After deployment:

**Backend Health Check:**
```
https://your-backend.vercel.app/api/health
```
Should return: `{"status":"ok","message":"MyHub API is running"}`

**Frontend:**
```
https://your-frontend.vercel.app
```
Should show login page.

---

## ⚠️ Important Notes

1. **Password Encoding:** `@` must be `%40` in connection string
2. **URLs:** Always include `https://` protocol
3. **No Trailing Slash:** Don't add `/` at the end of URLs
4. **Case Sensitive:** Variable names are case-sensitive
5. **Update CORS:** Must match frontend URL exactly

---

## 🚀 Quick Copy-Paste

**Backend (all 4 variables):**
```
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
JWT_SECRET=6e8d860000af930d37115f7d162bf41b4837167e7c5786d7ea5f68755fbed51a
CORS_ORIGIN=https://myhub-frontend.vercel.app
NODE_ENV=production
```

**Frontend (1 variable):**
```
VITE_API_URL=https://myhub-backend.vercel.app/api
```

**Remember to update URLs with your actual Vercel URLs!**

