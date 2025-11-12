# 🚀 Complete Setup Guide - Everything You Need

## 📋 Overview

This guide covers **everything** needed to get the podcast platform running with all features, including the new 4.5x upgrades.

---

## ✅ Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **FFmpeg** (for video processing) - See installation below
- **PostgreSQL** (for production) or use Render's managed database

### Optional
- **Git** (for version control)
- **Docker** (for containerized deployment)

---

## 🎬 Step 1: Install FFmpeg

FFmpeg is **required** for clip generation. Install it now:

### macOS
```bash
brew install ffmpeg
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg ffprobe curl
```

### Or use our script:
```bash
chmod +x scripts/setup-ffmpeg.sh
./scripts/setup-ffmpeg.sh
```

### Verify Installation
```bash
ffmpeg -version
ffprobe -version
```

---

## 📦 Step 2: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd podcast-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## ⚙️ Step 3: Environment Variables

### Backend (.env file in `backend/`)

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/podcast_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Storage (MinIO/S3)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=podcasts

# URLs
FRONTEND_URL=http://localhost:3001
API_URL=http://localhost:3000

# LinkedIn OAuth (optional - guest mode works without it)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-secret
LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback

# Optional
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=development
PORT=3000
```

### Frontend (.env file in `frontend/`)

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3000
```

---

## 🗄️ Step 4: Database Setup

### Option A: Local PostgreSQL

```bash
# Create database
createdb podcast_db

# Or using psql
psql -U postgres
CREATE DATABASE podcast_db;
```

### Option B: Use Render Database (Production)

1. Create PostgreSQL database in Render dashboard
2. Copy connection string to `DATABASE_URL`

### Initialize Database

```bash
cd backend
npm run sync-db
```

This creates all tables automatically.

---

## 💾 Step 5: Storage Setup (MinIO)

### Option A: Local MinIO (Docker)

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  --name minio \
  minio/minio server /data --console-address ":9001"
```

Access MinIO console: http://localhost:9001

### Option B: Use S3-Compatible Storage

Update `.env` with your S3 credentials:
```env
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_PORT=443
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
```

---

## 🚀 Step 6: Start Services

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:3000

### Terminal 2: Frontend
```bash
cd frontend
npm start
```

Frontend runs on: http://localhost:3001

---

## ✅ Step 7: Verify Everything Works

### 1. Check Health Endpoints

```bash
# Backend health
curl http://localhost:3000/health

# Should return:
# {
#   "status": "ok",
#   "ffmpeg": "available",
#   "features": {
#     "videoProcessing": true,
#     "clipGeneration": true,
#     "thumbnailGeneration": true
#   }
# }
```

### 2. Test Recording
1. Go to http://localhost:3001
2. Create a podcast
3. Click "Record New Episode"
4. Test recording (should work with enhanced quality)

### 3. Test Clip Generation
1. Record or upload an episode
2. Go to Clips page
3. Create a clip
4. Should automatically generate video clip with FFmpeg

---

## 🐳 Docker Deployment (Optional)

### Build Backend
```bash
cd backend
docker build -t podcast-backend .
docker run -p 3000:3000 --env-file .env podcast-backend
```

### Build Frontend
```bash
cd frontend
docker build -t podcast-frontend .
docker run -p 3001:3001 podcast-frontend
```

---

## ☁️ Render Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Render
1. Go to https://dashboard.render.com
2. New → Blueprint
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml`

### 3. Verify FFmpeg Installation

The `render.yaml` includes FFmpeg installation in buildCommand. Verify:

```bash
# Check Render logs
# Should see: "Installing FFmpeg..."

# Or check health endpoint
curl https://your-backend.onrender.com/health
# Should show: "ffmpeg": "available"
```

---

## 🔧 Troubleshooting

### FFmpeg Not Found
```bash
# Check if installed
which ffmpeg

# Install if missing
./scripts/setup-ffmpeg.sh

# Or manually:
# macOS: brew install ffmpeg
# Ubuntu: sudo apt-get install ffmpeg
```

### Database Connection Error
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running
- Check database exists

### Storage Errors
- Verify MinIO is running (if local)
- Check storage credentials in `.env`
- Verify bucket exists

### Clip Generation Fails
- Ensure FFmpeg is installed
- Check video URL is accessible
- Verify sufficient disk space in `/tmp`
- Check Render logs for errors

---

## 📊 Feature Checklist

- ✅ High-quality recording (up to 1080p)
- ✅ Guest invitation before recording
- ✅ Automatic clip generation with FFmpeg
- ✅ Platform-specific formats (TikTok, LinkedIn, etc.)
- ✅ Automatic thumbnail generation
- ✅ Share functionality
- ✅ Distribution management
- ✅ RSS feed generation

---

## 🎯 Next Steps

1. **Test all features** - Recording, clips, sharing
2. **Set up LinkedIn OAuth** (optional - guest mode works)
3. **Configure custom domain** (optional)
4. **Set up monitoring** - Check Render logs regularly
5. **Scale as needed** - Upgrade Render plan if needed

---

## 📚 Additional Resources

- [FFmpeg Setup Guide](./FFMPEG_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES_CHECKLIST.md)
- [Upgrade Summary](./UPGRADE_SUMMARY.md)

---

## ✅ You're All Set!

Everything is configured and ready. Start recording podcasts! 🎙️

