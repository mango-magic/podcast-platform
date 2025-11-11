# Custom Domain Setup for MangoMagic

## Domains

- **Production**: `mangomagic.live`
- **Test Environment**: `test.mangomagic.live`

## DNS Configuration

### For Frontend (Static Site) - `podcast-platform-frontend`

#### Option 1: CNAME Record (Recommended)

**For Production (`mangomagic.live`):**
```
Type: CNAME
Name: @ (or root domain)
Value: podcast-platform-frontend.onrender.com
TTL: 3600 (or default)
```

**For Test (`test.mangomagic.live`):**
```
Type: CNAME
Name: test
Value: podcast-platform-frontend.onrender.com
TTL: 3600 (or default)
```

#### Option 2: A Record (If CNAME not supported for root)

**For Production (`mangomagic.live`):**
```
Type: A
Name: @
Value: [Render's IP addresses - see below]
TTL: 3600
```

**For Test (`test.mangomagic.live`):**
```
Type: CNAME
Name: test
Value: podcast-platform-frontend.onrender.com
TTL: 3600
```

### For Backend (Web Service) - `podcast-platform-backend`

**For Production API (`api.mangomagic.live`):**
```
Type: CNAME
Name: api
Value: podcast-platform-backend.onrender.com
TTL: 3600
```

**For Test API (`api.test.mangomagic.live`):**
```
Type: CNAME
Name: api.test
Value: podcast-platform-backend.onrender.com
TTL: 3600
```

## Complete DNS Setup

### Recommended Structure

```
mangomagic.live                    → CNAME → podcast-platform-frontend.onrender.com
www.mangomagic.live               → CNAME → podcast-platform-frontend.onrender.com
api.mangomagic.live               → CNAME → podcast-platform-backend.onrender.com
test.mangomagic.live              → CNAME → podcast-platform-frontend.onrender.com (or separate test service)
api.test.mangomagic.live          → CNAME → podcast-platform-backend.onrender.com (or separate test service)
```

## Steps to Configure in Render

### 1. Add Custom Domain to Frontend Service

1. Go to: https://dashboard.render.com/static/srv-d49lgfgdl3ps739mpso0
2. Click **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter: `mangomagic.live`
5. Render will show you the DNS records needed
6. Copy the CNAME or A record value
7. Add the same for `test.mangomagic.live` (if using same service) or create separate test service

### 2. Add Custom Domain to Backend Service

1. Go to: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0
2. Click **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter: `api.mangomagic.live`
5. Add DNS record as shown
6. Repeat for `api.test.mangomagic.live` if needed

### 3. Update Environment Variables

After domains are configured, update:

**Frontend:**
- `REACT_APP_API_URL` = `https://api.mangomagic.live` (production)
- Or `https://api.test.mangomagic.live` (test)

**Backend:**
- `FRONTEND_URL` = `https://mangomagic.live` (production)
- Or `https://test.mangomagic.live` (test)
- `LINKEDIN_CALLBACK_URL` = `https://mangomagic.live/auth/linkedin/callback` (production)
- Or `https://test.mangomagic.live/auth/linkedin/callback` (test)

## DNS Provider Instructions

### Common DNS Providers

#### Cloudflare
1. Go to DNS settings
2. Add CNAME record:
   - Name: `@` (for root) or `test` (for subdomain)
   - Target: `podcast-platform-frontend.onrender.com`
   - Proxy: Toggle ON for CDN (optional)

#### Namecheap
1. Go to Advanced DNS
2. Add CNAME record:
   - Host: `@` (for root) or `test`
   - Value: `podcast-platform-frontend.onrender.com`
   - TTL: Automatic

#### GoDaddy
1. Go to DNS Management
2. Add CNAME record:
   - Type: CNAME
   - Name: `@` (for root) or `test`
   - Value: `podcast-platform-frontend.onrender.com`
   - TTL: 1 hour

#### Google Domains
1. Go to DNS settings
2. Add CNAME record:
   - Name: `@` (for root) or `test`
   - Data: `podcast-platform-frontend.onrender.com`

## Important Notes

### Root Domain (mangomagic.live)

Some DNS providers don't support CNAME for root domain (@). Options:

1. **Use A Records** (if Render provides IPs)
2. **Use ALIAS/ANAME record** (if your DNS provider supports it)
3. **Use www subdomain** and redirect root to www
4. **Use Render's domain forwarding** feature

### SSL/TLS Certificates

- Render automatically provisions SSL certificates via Let's Encrypt
- Certificates are issued automatically after DNS propagates
- Wait 24-48 hours for full SSL activation

### DNS Propagation

- DNS changes can take 24-48 hours to fully propagate
- Use `dig mangomagic.live` or `nslookup mangomagic.live` to check
- Render dashboard will show domain status

## Testing DNS Configuration

### Check DNS Records

```bash
# Check CNAME record
dig mangomagic.live CNAME
dig test.mangomagic.live CNAME

# Check A record (if using)
dig mangomagic.live A

# Check from different locations
nslookup mangomagic.live
```

### Verify in Render Dashboard

1. Go to service settings → Custom Domains
2. Status should show "Verified" when DNS is correct
3. SSL certificate will be issued automatically

## Environment-Specific Setup

### Production Environment
- Frontend: `mangomagic.live` → `podcast-platform-frontend.onrender.com`
- Backend: `api.mangomagic.live` → `podcast-platform-backend.onrender.com`

### Test Environment Options

**Option 1: Same Services, Different Domains**
- `test.mangomagic.live` → Same frontend service
- `api.test.mangomagic.live` → Same backend service
- Use environment variables to differentiate

**Option 2: Separate Test Services** (Recommended for isolation)
- Create separate Render services for test
- `test.mangomagic.live` → `podcast-platform-frontend-test.onrender.com`
- `api.test.mangomagic.live` → `podcast-platform-backend-test.onrender.com`

## Next Steps

1. ✅ Add custom domains in Render dashboard
2. ✅ Configure DNS records with your domain provider
3. ✅ Wait for DNS propagation (24-48 hours)
4. ✅ Verify SSL certificates are issued
5. ✅ Update environment variables
6. ✅ Test domains are working
7. ✅ Update LinkedIn OAuth callback URLs

## Troubleshooting

### Domain Not Resolving
- Check DNS records are correct
- Wait for propagation (can take up to 48 hours)
- Verify CNAME/A records point to correct Render URLs

### SSL Certificate Not Issuing
- Ensure DNS is fully propagated
- Check domain is verified in Render dashboard
- Contact Render support if issues persist

### CORS Errors
- Update `FRONTEND_URL` in backend environment variables
- Ensure frontend domain matches backend's allowed origins

