# Deployment Guide

## 🚀 Deploying to Render

### Step 1: Push to GitHub

1. Create a new repository on GitHub (if not already created)
2. Add the remote and push:

```bash
cd podcast-platform
git remote add origin https://github.com/YOUR_USERNAME/podcast-platform.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

#### Option A: Using Render Dashboard (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Review the services and click "Apply"
6. Set environment variables:
   - `LINKEDIN_CLIENT_ID` - Your LinkedIn app client ID
   - `LINKEDIN_CLIENT_SECRET` - Your LinkedIn app secret
   - `GEMINI_API_KEY` - Already set in render.yaml
   - `JWT_SECRET` - Will be auto-generated

#### Option B: Manual Service Creation

1. **Create Database:**
   - New → PostgreSQL
   - Name: `podcast-db`
   - Plan: Starter
   - Create

2. **Create Backend Service:**
   - New → Web Service
   - Connect GitHub repo
   - Name: `podcast-platform-backend`
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Environment Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=<from database>
     JWT_SECRET=<generate>
     LINKEDIN_CLIENT_ID=<your-id>
     LINKEDIN_CLIENT_SECRET=<your-secret>
     MINIO_ENDPOINT=minio
     MINIO_PORT=9000
     MINIO_ACCESS_KEY=minioadmin
     MINIO_SECRET_KEY=minioadmin
     MINIO_BUCKET=podcasts
     FRONTEND_URL=<frontend-url>
     API_URL=<backend-url>
     GEMINI_API_KEY=AIzaSyA3caiS86rgxCnOWrP95WQL0C1PyBKoeoA
     ```

3. **Create Frontend Service:**
   - New → Static Site
   - Connect GitHub repo
   - Name: `podcast-platform-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
   - Environment Variables:
     ```
     REACT_APP_API_URL=<backend-url>
     ```

### Step 3: Configure LinkedIn OAuth

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Edit your app
3. Add authorized redirect URLs:
   - `https://your-backend-url.onrender.com/auth/linkedin/callback`
4. Update `LINKEDIN_CALLBACK_URL` in Render environment variables

### Step 4: Initialize Database

After deployment, run database sync:

```bash
# SSH into Render backend service or use Render Shell
cd backend
npm run sync-db
```

Or create a one-time script in Render:
- New → Background Worker
- Command: `cd backend && node scripts/sync-db.js`

### Step 5: Access Your Application

- Frontend: `https://podcast-platform-frontend.onrender.com`
- Backend API: `https://podcast-platform-backend.onrender.com`
- Health Check: `https://podcast-platform-backend.onrender.com/health`

## 🔧 Post-Deployment Checklist

- [ ] Database is connected and synced
- [ ] LinkedIn OAuth is configured
- [ ] Frontend can connect to backend
- [ ] File uploads are working
- [ ] Health check endpoint responds
- [ ] RSS feeds are generating

## 🐛 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` is set correctly
- Verify database is running
- Check connection string format

### OAuth Not Working
- Verify redirect URL matches LinkedIn app settings
- Check `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`
- Ensure callback URL uses HTTPS in production

### File Upload Issues
- MinIO needs to be set up separately or use S3
- For production, consider using AWS S3 or similar
- Update `MINIO_ENDPOINT` to your storage service

### Frontend Can't Connect to Backend
- Check `REACT_APP_API_URL` is set correctly
- Verify CORS settings in backend
- Check backend service is running

## 📝 Environment Variables Reference

### Backend Required Variables:
```
DATABASE_URL - PostgreSQL connection string
JWT_SECRET - Secret for JWT tokens
LINKEDIN_CLIENT_ID - LinkedIn OAuth client ID
LINKEDIN_CLIENT_SECRET - LinkedIn OAuth secret
MINIO_ENDPOINT - Storage endpoint
MINIO_ACCESS_KEY - Storage access key
MINIO_SECRET_KEY - Storage secret key
MINIO_BUCKET - Storage bucket name
FRONTEND_URL - Frontend application URL
API_URL - Backend API URL
GEMINI_API_KEY - Gemini API key (optional)
```

### Frontend Required Variables:
```
REACT_APP_API_URL - Backend API URL
```

## 🔐 Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use Render's environment variables** - Don't hardcode secrets
3. **Generate strong JWT_SECRET** - Use Render's generateValue feature
4. **Use HTTPS** - Render provides SSL automatically
5. **Set up CORS properly** - Only allow your frontend domain

## 📊 Monitoring

- Check Render logs for errors
- Monitor database connections
- Watch for memory/CPU usage
- Set up alerts for service downtime

## 🚀 Next Steps

After deployment:
1. Test all features end-to-end
2. Set up custom domains (optional)
3. Configure backups for database
4. Set up monitoring and alerts
5. Plan for scaling (if needed)

