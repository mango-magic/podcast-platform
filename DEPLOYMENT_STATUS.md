# 🚀 Deployment Status

## ✅ Completed

1. **GitHub Repository Created**
   - Repository: https://github.com/mango-magic/podcast-platform
   - Code pushed successfully
   - All files committed

2. **Render Database Created**
   - Database: `podcast-db`
   - Plan: Free
   - Region: Oregon

## 📋 Next Steps - Deploy Services

### Option 1: Deploy via Render Dashboard (Recommended - 5 minutes)

1. Go to: https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect repository: `mango-magic/podcast-platform`
4. Render will auto-detect `render.yaml`
5. Review services and click "Apply"
6. Set environment variables:
   - `LINKEDIN_CLIENT_ID` (get from LinkedIn Developers)
   - `LINKEDIN_CLIENT_SECRET` (get from LinkedIn Developers)
   - `JWT_SECRET` (will be auto-generated)

### Option 2: Manual Service Creation

If you prefer to create services manually:

#### Backend Service:
1. New → Web Service
2. Connect: `mango-magic/podcast-platform`
3. Name: `podcast-platform-backend`
4. Environment: Node
5. Build Command: `cd backend && npm install`
6. Start Command: `cd backend && node server.js`
7. Add environment variables (see below)

#### Frontend Service:
1. New → Static Site
2. Connect: `mango-magic/podcast-platform`
3. Name: `podcast-platform-frontend`
4. Build Command: `cd frontend && npm install && npm run build`
5. Publish Directory: `frontend/build`
6. Add environment variable: `REACT_APP_API_URL` (backend URL)

## 🔐 Required Environment Variables

### Backend:
```
NODE_ENV=production
DATABASE_URL=<from database connection string>
JWT_SECRET=<generate strong secret>
LINKEDIN_CLIENT_ID=<your-linkedin-client-id>
LINKEDIN_CLIENT_SECRET=<your-linkedin-client-secret>
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=podcasts
FRONTEND_URL=<frontend-url>
API_URL=<backend-url>
GEMINI_API_KEY=AIzaSyA3caiS86rgxCnOWrP95WQL0C1PyBKoeoA
```

### Frontend:
```
REACT_APP_API_URL=<backend-url>
```

## 🔗 LinkedIn OAuth Setup

1. Go to: https://www.linkedin.com/developers/
2. Create/Edit your app
3. Add redirect URL:
   - Production: `https://podcast-platform-backend.onrender.com/auth/linkedin/callback`
   - Development: `http://localhost:3000/auth/linkedin/callback`
4. Copy Client ID and Secret to Render environment variables

## 🗄️ Initialize Database

After deployment, run database sync:

1. Go to Render dashboard → Backend service
2. Click "Shell" tab
3. Run: `cd backend && node scripts/sync-db.js`

Or create a one-time Background Worker:
- New → Background Worker
- Command: `cd backend && node scripts/sync-db.js`
- Run once, then delete

## ✅ Verification Checklist

After deployment:
- [ ] Backend service is running
- [ ] Frontend service is running
- [ ] Database is connected
- [ ] Health check works: `https://podcast-platform-backend.onrender.com/health`
- [ ] Frontend loads: `https://podcast-platform-frontend.onrender.com`
- [ ] LinkedIn OAuth redirect URL is configured
- [ ] Database is synced

## 🎯 Your Application URLs

Once deployed:
- **Frontend**: `https://podcast-platform-frontend.onrender.com`
- **Backend API**: `https://podcast-platform-backend.onrender.com`
- **Health Check**: `https://podcast-platform-backend.onrender.com/health`

## 📝 Notes

- Render free tier has limitations (spins down after inactivity)
- For production, consider upgrading to paid plans
- MinIO storage needs separate setup (or use AWS S3)
- Database connection string is automatically provided by Render

## 🆘 Need Help?

- Check Render logs if services fail to start
- Verify all environment variables are set
- Ensure LinkedIn OAuth redirect URL matches exactly
- Check database connection string format

