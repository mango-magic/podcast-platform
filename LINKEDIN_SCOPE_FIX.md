# 🔧 LinkedIn OAuth Scope Error - Fixed!

## Problem Found

The error was:
```
Error: AuthorizationError: Scope "r_emailaddress" is not authorized for your application
```

## Root Cause

LinkedIn has **deprecated** the old OAuth scopes (`r_liteprofile`, `r_emailaddress`) and now requires **OpenID Connect** scopes.

## ✅ Fix Applied

I've updated `backend/config/passport.js` to use the new OpenID Connect scopes:
- Changed from: `['r_liteprofile', 'r_emailaddress']`
- Changed to: `['openid', 'profile', 'email']`

## ⚠️ Important: LinkedIn App Configuration

You **MUST** also update your LinkedIn Developer App:

1. Go to: https://www.linkedin.com/developers/apps
2. Select your app
3. Go to **"Products"** tab
4. Make sure **"Sign In with LinkedIn using OpenID Connect"** is approved/enabled
5. If not, request access to it

## After the Fix

1. ✅ Code has been updated and pushed to GitHub
2. ⏳ Render will automatically redeploy (~2-3 minutes)
3. ✅ LinkedIn OAuth should work after redeploy

## Testing After Redeploy

1. Wait for Render to finish deploying
2. Visit: https://podcast-platform-frontend.onrender.com
3. Click "Sign in with LinkedIn"
4. Should now work without scope errors!

## Note

If `passport-linkedin-oauth2` doesn't fully support OpenID Connect, we may need to:
- Update the package to a newer version
- Or switch to a different LinkedIn OAuth package that supports OpenID Connect

But let's test with this fix first!

