# Frontend Environment Variables Setup

## Required Environment Variable

The frontend static site needs this environment variable:

```
REACT_APP_API_URL=https://podcast-platform-backend.onrender.com
```

## Why This Is Needed

The React app uses `process.env.REACT_APP_API_URL` to determine where to send API requests. Without this variable, it defaults to `http://localhost:3000`, which won't work in production.

## How to Add in Render Dashboard

1. Go to: https://dashboard.render.com/static/srv-d49lgfgdl3ps739mpso0/environment
2. Scroll to **"Environment Variables"** section
3. Click **"Add"** button
4. Enter:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://podcast-platform-backend.onrender.com`
5. Click **"Save Changes"**

## Important Notes

- **React environment variables** must start with `REACT_APP_` to be available in the browser
- These variables are **baked into the build** at build time
- After adding, you'll need to **trigger a new deploy** for changes to take effect
- The variable will be available as `process.env.REACT_APP_API_URL` in your React code

## After Adding

1. The service will automatically trigger a new build
2. Wait for the build to complete (~2-3 minutes)
3. The frontend will now use the correct API URL

## For Custom Domains (Future)

When you set up custom domains:
- Production: `REACT_APP_API_URL=https://api.mangomagic.live`
- Test: `REACT_APP_API_URL=https://api.test.mangomagic.live`

## Current Code Reference

The frontend code in `frontend/src/services/api.js` uses:
```javascript
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000'
```

So if `REACT_APP_API_URL` is not set, it will try to connect to localhost, which won't work in production!

