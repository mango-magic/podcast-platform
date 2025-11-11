# 🔍 Environment Variables Checklist

## 📋 Complete Environment Variables Audit

### 1. Backend Service (`podcast-platform-backend`)

#### ✅ Configured in render.yaml:
- `NODE_ENV` = `production` ✅
- `DATABASE_URL` = Auto-set from `podcast-db` database ✅
- `JWT_SECRET` = Auto-generated ✅
- `MINIO_ENDPOINT` = `minio` ✅
- `MINIO_PORT` = `9000` ✅
- `MINIO_ACCESS_KEY` = `minioadmin` ✅
- `MINIO_SECRET_KEY` = `minioadmin` ✅
- `MINIO_BUCKET` = `podcasts` ✅
- `FRONTEND_URL` = `https://podcast-platform-frontend.onrender.com` ✅
- `API_URL` = `https://podcast-platform-backend.onrender.com` ✅
- `LINKEDIN_CLIENT_ID` = `sync: false` (must be set manually) ⚠️
- `LINKEDIN_CLIENT_SECRET` = `sync: false` (must be set manually) ⚠️
- `GEMINI_API_KEY` = `AIzaSyA3caiS86rgxCnOWrP95WQL0C1PyBKoeoA` ✅

#### ⚠️ Missing from render.yaml but used in code:
- `LINKEDIN_CALLBACK_URL` - Used in `backend/config/passport.js` line 8
  - **Should be**: `https://podcast-platform-backend.onrender.com/auth/linkedin/callback`
  - **Status**: ⚠️ **MISSING** - Must be set manually in Render dashboard

#### 📝 Used in code (with defaults):
- `PORT` - Defaults to `3000` if not set (Render sets this automatically) ✅

---

### 2. Frontend Service (`podcast-platform-frontend`)

#### ✅ Configured in render.yaml:
- `REACT_APP_API_URL` = `https://podcast-platform-backend.onrender.com` ✅

#### 📝 Used in code:
- `REACT_APP_API_URL` - Used in:
  - `frontend/src/contexts/AuthContext.js` (line 37)
  - `frontend/src/services/auth.js` (line 4)
  - `frontend/src/services/api.js` (line 4)
  - **Default**: `http://localhost:3000` (fallback)
  - **Status**: ✅ Configured correctly

---

### 3. Database (`podcast-db`)

#### ✅ Configured in render.yaml:
- Database name: `podcast_db` ✅
- User: `podcast_user` ✅
- Plan: `starter` ✅
- Connection string: Auto-provided via `DATABASE_URL` ✅

---

## 🚨 Critical Missing Variable

### `LINKEDIN_CALLBACK_URL`

**Location**: Used in `backend/config/passport.js:8`

**Current Status**: ⚠️ **NOT in render.yaml** - Must be set manually

**Required Value**: 
```
https://podcast-platform-backend.onrender.com/auth/linkedin/callback
```

**How to Fix**:
1. Go to: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/environment
2. Add new environment variable:
   - Key: `LINKEDIN_CALLBACK_URL`
   - Value: `https://podcast-platform-backend.onrender.com/auth/linkedin/callback`
3. Click "Save Changes"
4. Service will auto-redeploy

---

## 📊 Environment Variables Summary

### Backend (14 variables)

| Variable | Source | Status | Notes |
|----------|--------|--------|-------|
| `NODE_ENV` | render.yaml | ✅ | `production` |
| `DATABASE_URL` | Auto from DB | ✅ | From `podcast-db` |
| `JWT_SECRET` | Auto-generated | ✅ | Render generates |
| `PORT` | Auto-set by Render | ✅ | Usually 10000 |
| `MINIO_ENDPOINT` | render.yaml | ✅ | `minio` |
| `MINIO_PORT` | render.yaml | ✅ | `9000` |
| `MINIO_ACCESS_KEY` | render.yaml | ✅ | `minioadmin` |
| `MINIO_SECRET_KEY` | render.yaml | ✅ | `minioadmin` |
| `MINIO_BUCKET` | render.yaml | ✅ | `podcasts` |
| `FRONTEND_URL` | render.yaml | ✅ | `https://podcast-platform-frontend.onrender.com` |
| `API_URL` | render.yaml | ✅ | `https://podcast-platform-backend.onrender.com` |
| `LINKEDIN_CLIENT_ID` | Manual | ⚠️ | Must set in Render dashboard |
| `LINKEDIN_CLIENT_SECRET` | Manual | ⚠️ | Must set in Render dashboard |
| `LINKEDIN_CALLBACK_URL` | **MISSING** | ❌ | **Must add to Render dashboard** |
| `GEMINI_API_KEY` | render.yaml | ✅ | Set |

### Frontend (1 variable)

| Variable | Source | Status | Notes |
|----------|--------|--------|-------|
| `REACT_APP_API_URL` | render.yaml | ✅ | `https://podcast-platform-backend.onrender.com` |

---

## 🔧 Code Usage Reference

### Backend Environment Variables Used:

1. **`NODE_ENV`** - Used in:
   - `backend/server.js:37` (cookie secure flag)
   - `backend/server.js:52` (health check)
   - `backend/server.js:71` (error stack)
   - `backend/models/index.js:13` (logging)
   - `backend/models/index.js:21` (SSL config)
   - `backend/routes/auth.js:27,32,43,46` (production checks)

2. **`DATABASE_URL`** - Used in:
   - `backend/models/index.js:4,11` (Sequelize connection)

3. **`JWT_SECRET`** - Used in:
   - `backend/server.js:33` (session secret)
   - `backend/routes/auth.js:19,65` (token signing/verification)
   - `backend/middleware/auth.js:18` (token verification)

4. **`FRONTEND_URL`** - Used in:
   - `backend/server.js:25` (CORS origin)
   - `backend/server.js:86` (logging)
   - `backend/routes/auth.js:24,32,42,46` (OAuth redirects)

5. **`API_URL`** - Used in:
   - `backend/routes/rss.js:28,29` (RSS feed URLs)
   - `backend/routes/rss.js:40` (episode URLs)
   - `backend/routes/podcasts.js:59` (RSS feed URL)

6. **`LINKEDIN_CLIENT_ID`** - Used in:
   - `backend/config/passport.js:6`

7. **`LINKEDIN_CLIENT_SECRET`** - Used in:
   - `backend/config/passport.js:7`

8. **`LINKEDIN_CALLBACK_URL`** - Used in:
   - `backend/config/passport.js:8` ⚠️ **MISSING**

9. **`MINIO_ENDPOINT`** - Used in:
   - `backend/services/storage.js:8,85`

10. **`MINIO_PORT`** - Used in:
    - `backend/services/storage.js:8,85`

11. **`MINIO_ACCESS_KEY`** - Used in:
    - `backend/services/storage.js:10`

12. **`MINIO_SECRET_KEY`** - Used in:
    - `backend/services/storage.js:11`

13. **`MINIO_BUCKET`** - Used in:
    - `backend/services/storage.js:41,44,45,60,85,91,101`

14. **`PORT`** - Used in:
    - `backend/server.js:80` (server port)

15. **`GEMINI_API_KEY`** - Used in:
    - (Not found in current codebase, but set in render.yaml)

### Frontend Environment Variables Used:

1. **`REACT_APP_API_URL`** - Used in:
   - `frontend/src/contexts/AuthContext.js:37`
   - `frontend/src/services/auth.js:4`
   - `frontend/src/services/api.js:4`

---

## ✅ Action Items

1. **URGENT**: Add `LINKEDIN_CALLBACK_URL` to Render backend environment variables
   - Value: `https://podcast-platform-backend.onrender.com/auth/linkedin/callback`

2. **Verify**: Check that `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` are set in Render dashboard

3. **Optional**: Add `LINKEDIN_CALLBACK_URL` to `render.yaml` for future deployments:
   ```yaml
   - key: LINKEDIN_CALLBACK_URL
     value: https://podcast-platform-backend.onrender.com/auth/linkedin/callback
   ```

---

## 📝 Notes

- Variables marked `sync: false` in render.yaml must be set manually in Render dashboard
- `DATABASE_URL` is automatically provided when database is linked to service
- `PORT` is automatically set by Render (usually 10000 for web services)
- Frontend variables must start with `REACT_APP_` to be accessible in React code
- All URLs should use `https://` in production

