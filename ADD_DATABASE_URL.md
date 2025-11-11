# 🔧 Fix: Add DATABASE_URL Manually

## The Problem

The backend is failing because `DATABASE_URL` is not set. The error shows:
```
TypeError: The "url" argument must be of type string. Received undefined
```

## Solution: Get Connection String from Database Dashboard

Since the "Link Database" button isn't visible, we'll add it manually:

### Step 1: Get Connection String

1. Go to: https://dashboard.render.com/d/dpg-d49liv8gjchc73fflmr0-a
2. Click on **"Connections"** tab (or look for connection info)
3. Copy the **"Internal Database URL"** or **"Connection String"**
4. It should look like: `postgresql://podcast_platform_db_ka4r_user:[password]@dpg-d49liv8gjchc73fflmr0-a.oregon-postgres.render.com:5432/podcast_platform_db_ka4r`

### Step 2: Add to Backend Environment Variables

1. Go to: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/environment
2. Click **"Add Environment Variable"**
3. Key: `DATABASE_URL`
4. Value: Paste the connection string you copied
5. Click **"Save Changes"**

### Alternative: Construct Connection String

If you can't find the connection string, construct it:

**Format:**
```
postgresql://podcast_platform_db_ka4r_user:[PASSWORD]@dpg-d49liv8gjchc73fflmr0-a.oregon-postgres.render.com:5432/podcast_platform_db_ka4r?sslmode=require
```

**To get the password:**
1. Go to database dashboard: https://dashboard.render.com/d/dpg-d49liv8gjchc73fflmr0-a
2. Look for "Reset Password" or password display
3. Or check the "Connections" tab for the full connection string

## Database Details

- **Database Name**: `podcast_platform_db_ka4r`
- **User**: `podcast_platform_db_ka4r_user`
- **Host**: `dpg-d49liv8gjchc73fflmr0-a.oregon-postgres.render.com`
- **Port**: `5432`
- **SSL**: Required (`?sslmode=require`)

## After Adding DATABASE_URL

1. The service will automatically redeploy
2. Check logs to verify it connects successfully
3. Then initialize database: `cd backend && node scripts/sync-db.js`

