# Environment Group Setup for Frontend

## Step 1: Create Environment Group

1. Go to Render Dashboard: https://dashboard.render.com
2. Click **"Environment Groups"** in the left sidebar (or go to: https://dashboard.render.com/environment-groups)
3. Click **"New Environment Group"**
4. Name it: `podcast-platform-frontend-env`
5. Add environment variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://podcast-platform-backend.onrender.com`
6. Click **"Create Environment Group"**

## Step 2: Link to Frontend Service

1. Go to: https://dashboard.render.com/static/srv-d49lgfgdl3ps739mpso0/environment
2. Scroll to **"Linked Environment Groups"** section
3. Click **"Link Environment Group"**
4. Select: `podcast-platform-frontend-env`
5. Click **"Link"**

## Benefits

- ✅ Environment variables are managed in one place
- ✅ Can be shared across multiple services
- ✅ Easy to update - change once, applies everywhere
- ✅ Better organization

## After Linking

Render will automatically trigger a new build with the environment variables from the group.

## Alternative: Direct Environment Variables

If you prefer not to use groups, you can still add the variable directly:
- Go to: https://dashboard.render.com/static/srv-d49lgfgdl3ps739mpso0/environment
- Click **"Add"** in Environment Variables section
- Add `REACT_APP_API_URL` = `https://podcast-platform-backend.onrender.com`

Both methods work - environment groups are better if you'll have multiple services sharing the same config!

