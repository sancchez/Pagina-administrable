# Deployment Fix - Linux HTTPS/CSP Issues

## Issues Fixed

1. **Content Security Policy (CSP) blocking inline scripts**
   - Added SHA-256 hash for the `checkEditorContext` inline script
   - Disabled Cross-Origin-Opener-Policy to avoid HTTP warnings

2. **HTTPS/HTTP protocol mismatch**
   - Configured Vite to use relative base path (`./`) for assets
   - This prevents protocol-specific asset URLs that cause SSL errors

3. **CORS configuration**
   - Updated `.env` with production IP address (2.58.80.90)

## Files Changed

- `backend/src/app.ts` - Updated Helmet security configuration
- `backend/.env` - Updated CORS_ORIGIN and FRONTEND_URL
- `frontend/vite.config.ts` - Added relative base path for assets

## Deployment Steps on Linux Server

### 1. Pull Latest Changes

```bash
cd /path/to/Pagina-administrable
git pull origin main  # or your branch name
```

### 2. Run Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

This will:
- Install dependencies
- Generate Prisma client
- Build backend and frontend
- Restart PM2 processes

### 3. Verify the Application

```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs pagina-admin-backend --lines 50

# Test health endpoint
curl http://localhost:4000/health
```

### 4. Clear Browser Cache (CRITICAL)

The ERR_SSL_PROTOCOL_ERROR occurs because browsers cache HTTPS upgrades. **You MUST clear browser data:**

#### Chrome/Edge:
1. Open DevTools (F12)
2. Right-click the refresh button → "Empty Cache and Hard Reload"
3. OR: Go to `chrome://settings/clearBrowserData`
   - Select "Cached images and files"
   - Select "Cookies and other site data"
   - Time range: "All time"
   - Clear data

#### Firefox:
1. Press Ctrl+Shift+Delete
2. Select "Cache" and "Cookies"
3. Time range: "Everything"
4. Clear Now

#### Alternative: Use Incognito/Private Window
Open `http://2.58.80.90:4000` in an incognito/private window to test without cache issues.

### 5. Access the Application

After clearing cache, access:
- Frontend: `http://2.58.80.90:4000`
- API: `http://2.58.80.90:4000/api`
- Health: `http://2.58.80.90:4000/health`

**IMPORTANT:** Always use `http://` (not `https://`)

## Troubleshooting

### Still Getting SSL Errors?

1. **Check browser HSTS cache:**
   - Chrome: Visit `chrome://net-internals/#hsts`
   - Search for `2.58.80.90`
   - Click "Delete" if found

2. **Verify backend is serving HTTP (not HTTPS):**
   ```bash
   curl -I http://2.58.80.90:4000
   ```

3. **Check PM2 logs:**
   ```bash
   pm2 logs pagina-admin-backend --lines 100
   ```

### CSP Errors Still Showing?

1. **Verify the build included the changes:**
   ```bash
   # Check if backend was rebuilt with new CSP config
   cat backend/dist/app.js | grep -i "crossOriginOpenerPolicy"
   ```

2. **Force rebuild:**
   ```bash
   cd backend
   rm -rf dist/
   npm run build
   pm2 restart ecosystem.config.cjs
   ```

### Assets Not Loading?

1. **Check frontend build:**
   ```bash
   ls -la frontend/dist/
   ls -la frontend/dist/assets/
   ```

2. **Verify base path in built HTML:**
   ```bash
   cat frontend/dist/index.html | grep -E "(href|src)="
   ```

   Should show relative paths like `./assets/...` not absolute paths

## Production Recommendations

### For Long-Term Deployment:

1. **Set up HTTPS with SSL certificate** (recommended):
   ```bash
   # Install certbot
   sudo apt update
   sudo apt install certbot

   # Get free SSL certificate (requires domain name)
   sudo certbot certonly --standalone -d yourdomain.com
   ```

2. **Use Nginx as reverse proxy:**
   - Handles HTTPS termination
   - Better static file serving
   - Load balancing support
   - See `nginx.example.conf` (create this if needed)

3. **Update environment variables:**
   - Change default JWT secrets
   - Use PostgreSQL instead of SQLite for production
   - Enable additional security headers

4. **Set up monitoring:**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

## Verification Checklist

- [ ] `git pull` completed successfully
- [ ] `./deploy.sh` ran without errors
- [ ] PM2 shows app as "online"
- [ ] Health check returns 200: `curl http://2.58.80.90:4000/health`
- [ ] Browser cache cleared
- [ ] Can access `http://2.58.80.90:4000` without SSL errors
- [ ] Can login to admin panel
- [ ] No CSP errors in browser console
- [ ] Assets (CSS, JS, images) load correctly

## Need Help?

Check logs:
```bash
# PM2 logs
pm2 logs

# Backend logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# PM2 specific logs
tail -f backend/logs/pm2-out.log
tail -f backend/logs/pm2-error.log
```
