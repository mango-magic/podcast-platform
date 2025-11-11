# 🔐 LinkedIn OAuth Setup Guide

## ⚠️ Will LinkedIn Connection Work?

**Short Answer**: It will work **ONLY** if you complete the setup steps below. The code is ready, but LinkedIn OAuth requires manual configuration.

## ✅ What's Already Done

1. ✅ OAuth code is implemented and optimized
2. ✅ Error handling improved
3. ✅ Profile data handling enhanced
4. ✅ Token management configured

## 🔧 Required Setup Steps

### Step 1: Create LinkedIn Developer App

1. Go to: **https://www.linkedin.com/developers/**
2. Click **"Create app"** (or use existing app)
3. Fill in:
   - **App name**: MangoMagic Podcast Platform (or your choice)
   - **LinkedIn Page**: Select your company page (or create one)
   - **App use case**: Sign In with LinkedIn using OpenID Connect
   - **App logo**: Upload a logo (optional)

### Step 2: Configure Redirect URLs

**CRITICAL**: This must match exactly!

1. In your LinkedIn app settings, go to **"Auth"** tab
2. Under **"Authorized redirect URLs for your app"**, add:
   - **Production**: `https://podcast-platform-backend.onrender.com/auth/linkedin/callback`
   - **Local Dev**: `http://localhost:3000/auth/linkedin/callback` (if testing locally)

3. **Important**: 
   - URLs must match EXACTLY (including http/https, trailing slashes, etc.)
   - LinkedIn is case-sensitive
   - No extra spaces or characters

### Step 3: Request API Products

1. Go to **"Products"** tab in LinkedIn Developer Portal
2. Request access to:
   - ✅ **Sign In with LinkedIn using OpenID Connect** (Required)
   - ✅ **Email Address** (if available)
   - ✅ **Profile Information** (if available)

3. **Note**: LinkedIn has deprecated some old APIs. If `r_liteprofile` and `r_emailaddress` don't work, you may need to:
   - Use OpenID Connect scopes (`openid`, `profile`, `email`)
   - Update the passport configuration (see troubleshooting below)

### Step 4: Get Credentials

1. Go to **"Auth"** tab
2. Copy:
   - **Client ID** (looks like: `86abc123xyz`)
   - **Client Secret** (click "Show" to reveal)

### Step 5: Set Environment Variables in Render

1. Go to: **https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/environment**
2. Verify these variables are set:

```bash
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_CALLBACK_URL=https://podcast-platform-backend.onrender.com/auth/linkedin/callback
```

**Note**: `LINKEDIN_CALLBACK_URL` should already be configured. If not, add it and click **"Save Changes"** (this will trigger a redeploy)

### Step 6: Verify Frontend Configuration

1. Go to: **https://dashboard.render.com/static/srv-d49lgfgdl3ps739mpso0/environment**
2. Ensure this is set:
```bash
REACT_APP_API_URL=https://podcast-platform-backend.onrender.com
```

## 🧪 Testing the Connection

### Test Locally (Optional)

1. Set up local environment variables in `backend/.env`:
```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback
FRONTEND_URL=http://localhost:3001
```

2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm start`
4. Visit: `http://localhost:3001`
5. Click "Sign in with LinkedIn"

### Test Production

1. Visit: **https://podcast-platform-frontend.onrender.com**
2. Click **"Sign in with LinkedIn"**
3. You should be redirected to LinkedIn login
4. After authorizing, you should be redirected back to the dashboard

## 🐛 Troubleshooting

### Error: "Invalid redirect_uri"

**Problem**: Redirect URL doesn't match LinkedIn app settings

**Solution**:
1. Check LinkedIn app → Auth tab → Redirect URLs
2. Ensure URL matches EXACTLY (including protocol, port, path)
3. For production: Must be HTTPS
4. Update `LINKEDIN_CALLBACK_URL` in Render if needed

### Error: "Invalid client credentials"

**Problem**: Client ID or Secret is wrong

**Solution**:
1. Double-check credentials in LinkedIn Developer Portal
2. Verify environment variables in Render dashboard
3. Ensure no extra spaces or quotes in environment variables
4. Redeploy backend service after updating

### Error: "Insufficient permissions" or "Scope not granted"

**Problem**: LinkedIn app doesn't have required permissions

**Solution**:
1. Go to LinkedIn app → Products tab
2. Request access to required products
3. Wait for approval (can take 24-48 hours for some products)
4. Ensure scopes match what's requested in passport.js

### Error: "r_liteprofile" or "r_emailaddress" deprecated

**Problem**: LinkedIn has deprecated old API scopes

**Solution**:
1. LinkedIn is migrating to OpenID Connect
2. If old scopes don't work, you may need to:
   - Update `passport-linkedin-oauth2` package to latest version
   - Or switch to a different LinkedIn OAuth package that supports OpenID Connect
   - Update scopes in `backend/config/passport.js` to use OpenID Connect

### Error: "Database connection failed" during OAuth

**Problem**: Database not linked or not synced

**Solution**:
1. Link database in Render dashboard
2. Run database sync: `cd backend && node scripts/sync-db.js`
3. Check database connection string format

### Error: "Token generation error"

**Problem**: JWT_SECRET not set or invalid

**Solution**:
1. Ensure `JWT_SECRET` is set in Render environment variables
2. Generate a strong secret: `openssl rand -base64 32`
3. Update environment variable and redeploy

## 📋 Checklist

Before testing, ensure:

- [ ] LinkedIn Developer app created
- [ ] Redirect URL added in LinkedIn app settings
- [ ] API products requested and approved
- [ ] Client ID and Secret copied
- [ ] Environment variables set in Render:
  - [ ] `LINKEDIN_CLIENT_ID`
  - [ ] `LINKEDIN_CLIENT_SECRET`
  - [ ] `LINKEDIN_CALLBACK_URL`
  - [ ] `JWT_SECRET`
  - [ ] `DATABASE_URL` (linked)
- [ ] Frontend environment variable set:
  - [ ] `REACT_APP_API_URL`
- [ ] Database synced
- [ ] Backend service redeployed after env var changes
- [ ] Frontend service redeployed after env var changes

## 🔍 Debugging Tips

1. **Check Render Logs**:
   - Backend: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/logs
   - Look for OAuth errors or profile data issues

2. **Test Health Endpoint**:
   - Visit: `https://podcast-platform-backend.onrender.com/health`
   - Should return: `{"status":"ok",...}`

3. **Test OAuth Initiation**:
   - Visit: `https://podcast-platform-backend.onrender.com/auth/linkedin`
   - Should redirect to LinkedIn login

4. **Check Browser Console**:
   - Open browser DevTools → Console
   - Look for JavaScript errors during OAuth flow

5. **Check Network Tab**:
   - Monitor requests to `/auth/linkedin` and `/auth/linkedin/callback`
   - Check for 401, 403, or 500 errors

## 📚 Additional Resources

- LinkedIn Developer Portal: https://www.linkedin.com/developers/
- LinkedIn OAuth Documentation: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
- Render Environment Variables: https://render.com/docs/environment-variables

## ⚡ Quick Test Command

Once configured, test the OAuth flow:

```bash
# Test backend health
curl https://podcast-platform-backend.onrender.com/health

# Test OAuth initiation (should redirect to LinkedIn)
curl -I https://podcast-platform-backend.onrender.com/auth/linkedin
```

---

**Status**: Code is ready ✅ | Configuration required ⚠️

Complete the steps above to enable LinkedIn OAuth authentication.

