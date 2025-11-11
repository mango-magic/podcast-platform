# Quick Fix: Add DATABASE_URL

## The Issue

Your backend is failing because `DATABASE_URL` is missing. The error:
```
TypeError: The "url" argument must be of type string. Received undefined
```

## Quick Solution

### Option 1: Get from Database Dashboard (Easiest)

1. **Go to database dashboard**: https://dashboard.render.com/d/dpg-d49liv8gjchc73fflmr0-a
2. **Look for "Connections" or "Connection Info"** section
3. **Copy the "Internal Database URL"** - it will have the password included
4. **Go to backend environment**: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/environment
5. **Click "Add Environment Variable"**
6. **Key**: `DATABASE_URL`
7. **Value**: Paste the connection string
8. **Save** - this will trigger a redeploy

### Option 2: If You See "Reset Password" Button

1. Go to database dashboard
2. Click "Reset Password" 
3. Copy the new password shown
4. Construct connection string:
   ```
   postgresql://podcast_platform_db_ka4r_user:[NEW_PASSWORD]@dpg-d49liv8gjchc73fflmr0-a.oregon-postgres.render.com:5432/podcast_platform_db_ka4r?sslmode=require
   ```
5. Add as `DATABASE_URL` environment variable

### Database Connection Details

- **Host**: `dpg-d49liv8gjchc73fflmr0-a.oregon-postgres.render.com`
- **Port**: `5432`
- **Database**: `podcast_platform_db_ka4r`
- **User**: `podcast_platform_db_ka4r_user`
- **SSL**: Required

## After Adding DATABASE_URL

1. Service will auto-redeploy
2. Check logs to verify connection
3. Then run: `cd backend && node scripts/sync-db.js` (via Shell tab)

**The connection string should be visible in your database dashboard!** 🔗

