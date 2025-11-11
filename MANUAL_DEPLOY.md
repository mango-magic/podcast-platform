# Manual Deployment Instructions

## Quick Fix: Manual Deploy from Render Dashboard

Since auto-deploy isn't triggering, manually deploy:

1. **Go to Render Dashboard:**
   - https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0

2. **Click "Manual Deploy" button** (top right)

3. **Select "Deploy latest commit"**

4. **Wait 2-3 minutes** for deployment to complete

## Why Auto-Deploy Might Not Be Working

Possible reasons:
- GitHub webhook not configured properly
- Render webhook delay
- Branch mismatch (though we're on `main`)

## After Manual Deploy

Once deployed, the fixes will be live:
- ✅ Passport failureRedirect bug fixed
- ✅ Enhanced error handling
- ✅ Better OpenID Connect profile parsing
- ✅ Comprehensive logging

Then test LinkedIn login again - the "Forbidden" error should be resolved!

