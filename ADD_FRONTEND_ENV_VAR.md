# ⚠️ Manual Step Required: Add Frontend Environment Variable

## Quick Steps (2 minutes)

1. **Go to Frontend Service Environment Page:**
   - Direct link: https://dashboard.render.com/static/srv-d49lgfgdl3ps739mpso0/environment

2. **Add Environment Variable:**
   - Scroll to **"Environment Variables"** section
   - Click **"Add"** button
   - Enter:
     - **Key**: `REACT_APP_API_URL`
     - **Value**: `https://podcast-platform-backend.onrender.com`
   - Click **"Save Changes"**

3. **Wait for Auto-Deploy:**
   - Render will automatically trigger a new build
   - This takes ~2-3 minutes
   - The frontend will rebuild with the new environment variable

## Why This Is Critical

Without this variable, your frontend will try to connect to `http://localhost:3000` instead of your backend API, causing all API calls to fail.

## Verification

After adding, you can verify it worked by:
1. Checking the build logs - should show the variable is available
2. Testing the frontend - API calls should now work
3. Checking browser console - no CORS/localhost errors

## Note

Render's API doesn't support setting environment variables for static sites programmatically, so this must be done through the dashboard.

