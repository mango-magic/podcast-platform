# 🔧 Quick Fix: LinkedIn OAuth Redirect to Localhost

## Problem
LinkedIn OAuth callback is redirecting to `localhost` instead of the production frontend URL.

## ✅ Solution Applied

I've fixed the code to handle this properly. Now you need to update the environment variable in Render.

## 🚀 Quick Fix Steps

### Option 1: Update Environment Variable in Render (Fastest - 2 minutes)

1. Go to Render Dashboard: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/environment

2. Find `FRONTEND_URL` in the environment variables list

3. Update it to:
   ```
   https://podcast-platform-frontend.onrender.com
   ```
   (Make sure it includes `https://` at the beginning)

4. Click **"Save Changes"**

5. Render will automatically redeploy the backend service (takes 2-3 minutes)

### Option 2: Redeploy with Updated Code (If you want to use the new code)

The code has been updated to:
- Automatically add `https://` if missing in production
- Fallback to production URL if `FRONTEND_URL` is not set
- Better error handling

To deploy:
1. Commit and push the updated `render.yaml` and `backend/routes/auth.js`
2. Render will automatically redeploy

## ✅ What I Fixed

1. **Updated `backend/routes/auth.js`**:
   - Added logic to ensure `FRONTEND_URL` includes `https://` in production
   - Added fallback to production URL if environment variable is missing
   - Added logging to help debug redirect issues

2. **Updated `render.yaml`**:
   - Changed `FRONTEND_URL` from `fromService` (which might not include protocol) to explicit value
   - Set to: `https://podcast-platform-frontend.onrender.com`
   - Also updated `API_URL` and `REACT_APP_API_URL` to explicit values

## 🧪 Test After Fix

1. Visit: https://podcast-platform-frontend.onrender.com
2. Click "Sign in with LinkedIn"
3. Complete LinkedIn authorization
4. Should redirect to: `https://podcast-platform-frontend.onrender.com/auth/callback?token=...`
5. Should then show dashboard with user info

## 🔍 Verify Fix

After updating, check the backend logs in Render:
- Go to: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/logs
- Look for: `Redirecting to frontend: https://podcast-platform-frontend.onrender.com/auth/callback`
- This confirms the redirect URL is correct

## ⚠️ If Still Not Working

1. **Check Render Environment Variables**:
   - Ensure `FRONTEND_URL` is exactly: `https://podcast-platform-frontend.onrender.com`
   - No trailing slash
   - Includes `https://`

2. **Check Backend Logs**:
   - Look for the redirect log message
   - Check for any errors during OAuth callback

3. **Verify LinkedIn App Settings**:
   - Redirect URL should be: `https://podcast-platform-backend.onrender.com/auth/linkedin/callback`
   - Must match exactly

---

**Status**: Code fixed ✅ | Environment variable needs update ⚠️

Update `FRONTEND_URL` in Render dashboard and the redirect will work correctly!

