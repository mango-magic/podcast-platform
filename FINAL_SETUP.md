# ✅ Configuration Status

## Completed ✅

1. **GitHub Repository**: https://github.com/mango-magic/podcast-platform
2. **Backend Service**: https://podcast-platform-backend.onrender.com
3. **Frontend Service**: https://podcast-platform-frontend.onrender.com
4. **Environment Variables Set**:
   - ✅ JWT_SECRET (generated)
   - ✅ LINKEDIN_CALLBACK_URL
   - ✅ NODE_ENV=production
   - ✅ PORT=10000
   - ✅ All MinIO settings
   - ✅ FRONTEND_URL
   - ✅ API_URL
   - ✅ GEMINI_API_KEY

## ⚠️ Manual Steps Required

### 1. Link Database (Required)
**Why**: Render doesn't expose database passwords via API for security.

**Steps**:
1. Go to: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/environment
2. Click **"Link Database"** button (blue button near top)
3. Select **"mangotrades-db"**
4. This automatically adds `DATABASE_URL` with the connection string

**Alternative**: If you know the database password, you can manually add:
```
DATABASE_URL=postgresql://mangotrades_db_user:[PASSWORD]@dpg-d49480euk2gs73es30o0-a.oregon-postgres.render.com:5432/mangotrades_db?sslmode=require
```

### 2. Set LinkedIn OAuth Credentials (Required)
1. Go to: https://www.linkedin.com/developers/
2. Create/Edit your app
3. Add redirect URL: `https://podcast-platform-backend.onrender.com/auth/linkedin/callback`
4. Copy Client ID and Secret
5. Add to Backend Service → Environment:
   - `LINKEDIN_CLIENT_ID`
   - `LINKEDIN_CLIENT_SECRET`

### 3. Set Frontend Environment Variable (Required)
1. Go to: https://dashboard.render.com/static/srv-d49lgfgdl3ps739mpso0/environment
2. Add: `REACT_APP_API_URL=https://podcast-platform-backend.onrender.com`
3. Save (this will trigger a rebuild)

### 4. Initialize Database (After linking)
1. Go to Backend Service → Shell tab
2. Run: `cd backend && node scripts/sync-db.js`

## 🎯 Quick Links

- **Backend Dashboard**: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0
- **Frontend Dashboard**: https://dashboard.render.com/static/srv-d49lgfgdl3ps739mpso0
- **Database Dashboard**: https://dashboard.render.com/d/dpg-d49480euk2gs73es30o0-a
- **Backend URL**: https://podcast-platform-backend.onrender.com
- **Frontend URL**: https://podcast-platform-frontend.onrender.com

## ✅ Verification

After completing the steps above:
1. Check backend logs: Should show "Server running on port 10000"
2. Check health endpoint: https://podcast-platform-backend.onrender.com/health
3. Frontend should load: https://podcast-platform-frontend.onrender.com
4. Test LinkedIn OAuth login

## 📝 Notes

- Database linking must be done via dashboard (security requirement)
- Services are already deploying with current configuration
- Once database is linked, run the sync script
- LinkedIn OAuth setup takes ~5 minutes

**Almost there! Just need to link the database and add LinkedIn credentials.** 🚀

