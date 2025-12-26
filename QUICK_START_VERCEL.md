# 🚀 Quick Start: Deploy MyHub to Vercel

## ⚡ TL;DR - 5 Steps

1. **Deploy Backend** → Get backend URL
2. **Deploy Frontend** → Use backend URL
3. **Update CORS** → Use frontend URL
4. **Redeploy Backend** → Apply CORS
5. **Test** → Done! 🎉

---

## 📖 Full Instructions

See **`COMPLETE_VERCEL_SETUP.md`** for detailed step-by-step guide.

---

## 🔑 Environment Variables Quick Copy

### Backend (4 variables)
```
DATABASE_URL=postgresql://postgres:NextGenDB%40123456@db.jarhhglbeawefqpgmuch.supabase.co:5432/postgres
JWT_SECRET=6e8d860000af930d37115f7d162bf41b4837167e7c5786d7ea5f68755fbed51a
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (1 variable)
```
VITE_API_URL=https://your-backend.vercel.app/api
```

---

## ⚙️ Project Settings

### Backend
- **Root Directory:** `backend`
- **Framework:** Other
- **Build Command:** (empty)
- **Output Directory:** (empty)

### Frontend
- **Root Directory:** `master-hub`
- **Framework:** Other
- **Build Command:** `node build.js` (or empty)
- **Output Directory:** `.`

---

## ✅ Verification

**Backend:** `https://your-backend.vercel.app/api/health`
**Frontend:** `https://your-frontend.vercel.app`

---

**Need details?** Read `COMPLETE_VERCEL_SETUP.md`

