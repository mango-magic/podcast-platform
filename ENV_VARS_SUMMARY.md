# 📋 Environment Variables Summary - All Services

## 🎯 Quick Summary

**Total Variables**: 16
- **Backend**: 15 variables
- **Frontend**: 1 variable
- **Database**: Auto-configured

---

## 1️⃣ Backend Service (`podcast-platform-backend`)

### ✅ All Environment Variables:

| # | Variable | Value/Source | Status | Used In |
|---|----------|-------------|--------|---------|
| 1 | `NODE_ENV` | `production` | ✅ Set | server.js, auth.js, models |
| 2 | `DATABASE_URL` | Auto from `podcast-db` | ✅ Set | models/index.js |
| 3 | `JWT_SECRET` | Auto-generated | ✅ Set | auth.js, middleware/auth.js |
| 4 | `PORT` | Auto-set by Render | ✅ Set | server.js |
| 5 | `MINIO_ENDPOINT` | `minio` | ✅ Set | services/storage.js |
| 6 | `MINIO_PORT` | `9000` | ✅ Set | services/storage.js |
| 7 | `MINIO_ACCESS_KEY` | `minioadmin` | ✅ Set | services/storage.js |
| 8 | `MINIO_SECRET_KEY` | `minioadmin` | ✅ Set | services/storage.js |
| 9 | `MINIO_BUCKET` | `podcasts` | ✅ Set | services/storage.js |
| 10 | `FRONTEND_URL` | `https://podcast-platform-frontend.onrender.com` | ✅ Set | server.js, routes/auth.js |
| 11 | `API_URL` | `https://podcast-platform-backend.onrender.com` | ✅ Set | routes/rss.js, routes/podcasts.js |
| 12 | `LINKEDIN_CLIENT_ID` | Manual (sync: false) | ⚠️ Manual | config/passport.js |
| 13 | `LINKEDIN_CLIENT_SECRET` | Manual (sync: false) | ⚠️ Manual | config/passport.js |
| 14 | `LINKEDIN_CALLBACK_URL` | `https://podcast-platform-backend.onrender.com/auth/linkedin/callback` | ✅ Set | config/passport.js |
| 15 | `GEMINI_API_KEY` | `AIzaSyA3caiS86rgxCnOWrP95WQL0C1PyBKoeoA` | ✅ Set | (future use) |

### ⚠️ Manual Setup Required:
- `LINKEDIN_CLIENT_ID` - Must be set in Render dashboard
- `LINKEDIN_CLIENT_SECRET` - Must be set in Render dashboard

---

## 2️⃣ Frontend Service (`podcast-platform-frontend`)

### ✅ All Environment Variables:

| # | Variable | Value/Source | Status | Used In |
|---|----------|-------------|--------|---------|
| 1 | `REACT_APP_API_URL` | `https://podcast-platform-backend.onrender.com` | ✅ Set | contexts/AuthContext.js, services/auth.js, services/api.js |

---

## 3️⃣ Database (`podcast-db`)

### ✅ Auto-Configured:
- **Database Name**: `podcast_db`
- **User**: `podcast_user`
- **Plan**: `starter`
- **Connection String**: Auto-provided via `DATABASE_URL` to backend service

---

## 🔍 Detailed Breakdown by File

### Backend Files Using Environment Variables:

#### `backend/server.js`
- `NODE_ENV` - Environment detection
- `FRONTEND_URL` - CORS origin, logging
- `JWT_SECRET` - Session secret
- `PORT` - Server port

#### `backend/routes/auth.js`
- `JWT_SECRET` - Token signing/verification
- `FRONTEND_URL` - OAuth redirect URLs
- `NODE_ENV` - Production checks

#### `backend/config/passport.js`
- `LINKEDIN_CLIENT_ID` - OAuth client ID
- `LINKEDIN_CLIENT_SECRET` - OAuth client secret
- `LINKEDIN_CALLBACK_URL` - OAuth callback URL

#### `backend/models/index.js`
- `DATABASE_URL` - Sequelize connection
- `NODE_ENV` - Logging, SSL config

#### `backend/middleware/auth.js`
- `JWT_SECRET` - Token verification

#### `backend/routes/rss.js`
- `API_URL` - RSS feed URLs

#### `backend/routes/podcasts.js`
- `API_URL` - RSS feed URL generation

#### `backend/services/storage.js`
- `MINIO_ENDPOINT` - MinIO server endpoint
- `MINIO_PORT` - MinIO server port
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET` - MinIO bucket name

### Frontend Files Using Environment Variables:

#### `frontend/src/contexts/AuthContext.js`
- `REACT_APP_API_URL` - API base URL

#### `frontend/src/services/auth.js`
- `REACT_APP_API_URL` - API base URL

#### `frontend/src/services/api.js`
- `REACT_APP_API_URL` - Axios base URL

---

## ✅ Verification Checklist

### Backend Environment Variables:
- [x] `NODE_ENV` = `production`
- [x] `DATABASE_URL` = Auto-set from database
- [x] `JWT_SECRET` = Auto-generated
- [x] `FRONTEND_URL` = `https://podcast-platform-frontend.onrender.com`
- [x] `API_URL` = `https://podcast-platform-backend.onrender.com`
- [x] `LINKEDIN_CALLBACK_URL` = `https://podcast-platform-backend.onrender.com/auth/linkedin/callback`
- [x] `MINIO_ENDPOINT` = `minio`
- [x] `MINIO_PORT` = `9000`
- [x] `MINIO_ACCESS_KEY` = `minioadmin`
- [x] `MINIO_SECRET_KEY` = `minioadmin`
- [x] `MINIO_BUCKET` = `podcasts`
- [x] `GEMINI_API_KEY` = Set
- [ ] `LINKEDIN_CLIENT_ID` = **Must verify in Render dashboard**
- [ ] `LINKEDIN_CLIENT_SECRET` = **Must verify in Render dashboard**

### Frontend Environment Variables:
- [x] `REACT_APP_API_URL` = `https://podcast-platform-backend.onrender.com`

---

## 🚨 Action Required

**Verify these are set in Render Dashboard**:
1. Go to: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/environment
2. Check:
   - `LINKEDIN_CLIENT_ID` is set
   - `LINKEDIN_CLIENT_SECRET` is set
   - `LINKEDIN_CALLBACK_URL` = `https://podcast-platform-backend.onrender.com/auth/linkedin/callback`

---

## 📝 Notes

- Variables with `sync: false` in render.yaml must be set manually
- `DATABASE_URL` is automatically linked when database is connected
- `PORT` is automatically set by Render
- Frontend variables must start with `REACT_APP_` prefix
- All production URLs use `https://`

