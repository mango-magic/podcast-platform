# Guest Mode - Bypass LinkedIn Auth

## Overview

Guest mode allows the app to function without LinkedIn authentication. This is useful for:
- Development and testing
- Demonstrating the app without LinkedIn setup
- Working around LinkedIn OAuth issues temporarily

## How It Works

### Frontend Changes

1. **AuthContext** (`frontend/src/contexts/AuthContext.js`):
   - Added `GUEST_MODE` flag (set to `true` by default)
   - Creates a mock user object when guest mode is enabled
   - Automatically logs in with mock user on app load
   - Hides LinkedIn authentication flow

2. **Mock User**:
   ```javascript
   {
     id: 'guest-user',
     email: 'guest@mangomagic.com',
     name: 'Guest User',
     persona: 'CMO',
     vertical: 'SaaS',
     profileCompleted: true
   }
   ```

3. **PrivateRoute** (`frontend/src/App.js`):
   - Allows access when guest mode is enabled
   - No authentication required

4. **API Interceptor** (`frontend/src/services/api.js`):
   - Handles 401 errors gracefully in guest mode
   - Doesn't redirect to login page

## Enabling/Disabling Guest Mode

### To Enable Guest Mode (Current State)
```javascript
// In frontend/src/contexts/AuthContext.js
const GUEST_MODE = true; // ✅ Enabled
```

### To Disable Guest Mode (Re-enable LinkedIn Auth)
```javascript
// In frontend/src/contexts/AuthContext.js
const GUEST_MODE = false; // ❌ Disabled
```

## What Works in Guest Mode

✅ **Full App Access**:
- Dashboard
- Podcast creation
- Episode management
- All routes accessible

✅ **UI Features**:
- Personalized recommendations (using mock persona/vertical)
- All dashboard features
- Navigation

⚠️ **Backend API Calls**:
- May fail if backend requires authentication
- Frontend will handle errors gracefully
- Some features may be limited without backend auth

## Limitations

1. **Backend API**: Some API endpoints may require authentication
2. **Data Persistence**: Guest user data is not saved to database
3. **Real User Data**: No access to actual LinkedIn profile data

## Testing

1. **With Guest Mode Enabled**:
   - App loads automatically logged in
   - No LinkedIn sign-in button shown
   - All routes accessible
   - Mock user data displayed

2. **With Guest Mode Disabled**:
   - App shows LinkedIn sign-in button
   - Requires LinkedIn authentication
   - Normal OAuth flow

## Notes

- Guest mode is a frontend-only solution
- Backend authentication is still required for API calls that need it
- To fully test backend features, you may need to:
  - Mock backend responses
  - Or temporarily disable backend auth checks
  - Or use a test user account

## Future Improvements

- Add environment variable for guest mode
- Create backend guest mode support
- Add guest mode indicator in UI
- Allow switching between guest and real auth

