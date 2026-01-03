# Deployment Guide: Wordle Data Explorer

This guide covers deploying the Wordle Data Explorer to Railway (backend) and GitHub Pages (frontend).

## 🏗️ Architecture Overview

- **Frontend**: React SPA hosted on GitHub Pages (`https://yourusername.github.io/wordle-exploration`)
- **Backend**: FastAPI + PostgreSQL hosted on Railway (free tier, no cold starts)
- **Deployment**: Automated via GitHub Actions (frontend) + Railway CLI/Dashboard (backend)

---

## 📋 Prerequisites

1. **GitHub Account** with repository for this project
2. **Railway Account** (sign up at [railway.app](https://railway.app))
3. **Kaggle API Credentials** (for initial data population)
   - Go to [Kaggle Account Settings](https://www.kaggle.com/settings/account)
   - Click "Create New API Token" to download `kaggle.json`

---

## 🚀 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select your `wordle-exploration` repository

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create a database and inject `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables

1. Click on your **backend service** (not the database)
2. Go to **"Variables"** tab
3. Click **"Add Variable"** and add the following:

```bash
# Required
ENV=production
CORS_ORIGINS=https://yourusername.github.io
SECRET_KEY=<generate with: openssl rand -hex 32>
KAGGLE_USERNAME=<your kaggle username>
KAGGLE_KEY=<your kaggle api key>

# Optional (Railway provides sensible defaults)
LOG_LEVEL=WARNING
DEBUG=false
ENABLE_QUERY_CACHE=true
```

**Important**: Replace `yourusername` in `CORS_ORIGINS` with your actual GitHub username!

### Step 4: Deploy Backend

1. Railway will automatically deploy when you push to `main` branch
2. Or click **"Deploy"** in the Railway dashboard
3. Wait for build to complete (~5 minutes)

### Step 5: Run ETL Pipeline (One-Time Setup)

After the first deployment, you need to populate the database with Wordle data:

1. In Railway project, go to your **backend service**
2. Click **"Settings"** → **"Deploy Trigger"**
3. Or use Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run ETL pipeline
railway run python scripts/run_etl.py
```

This will download Kaggle datasets and populate the database (~10-15 minutes).

### Step 6: Get Backend URL

1. Go to **"Settings"** tab in your backend service
2. Under **"Domains"**, Railway provides a default domain: `https://wordle-backend-production.up.railway.app`
3. Copy this URL - you'll need it for frontend deployment

**Test your backend**:
```bash
curl https://your-railway-url.up.railway.app/api/v1/health
```

Expected response:
```json
{
  "status": "success",
  "data": {"healthy": true, "service": "Wordle Decoded API"},
  "meta": {"timestamp": "...", "version": "1.0.0"}
}
```

### Step 7: Monitor Railway Credits

1. Go to **Account Settings** → **Usage**
2. Set up billing alerts at **$4 threshold** (you get $5/month free)
3. Expected usage: ~$2-3/month for portfolio traffic

---

## 🌐 Part 2: Deploy Frontend to GitHub Pages

### Step 1: Update Frontend Configuration

1. **Update `frontend/package.json`**:
   - Replace `yourusername` in `homepage` field with your GitHub username

2. **Update `frontend/vite.config.ts`**:
   - Repository name in `base` should match your repo name (currently `wordle-exploration`)

3. **Update `frontend/.env.production`**:
   ```bash
   VITE_API_URL=https://your-railway-url.up.railway.app/api/v1
   ```
   Replace with your actual Railway backend URL from Step 6 above.

### Step 2: Create GitHub Secret

1. Go to your GitHub repository
2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Click **"New repository secret"**
4. Add:
   - **Name**: `RAILWAY_API_URL`
   - **Value**: `https://your-railway-url.up.railway.app/api/v1`

### Step 3: Enable GitHub Pages

1. Go to repository **"Settings"** → **"Pages"**
2. Under **"Source"**, select:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
3. Click **"Save"**

### Step 4: Deploy

The GitHub Actions workflow (`.github/workflows/deploy-frontend.yml`) will automatically deploy when you push to `main`:

```bash
git add .
git commit -m "Configure production deployment"
git push origin main
```

GitHub Actions will:
1. Build the React app with production API URL
2. Create/update `gh-pages` branch
3. Deploy to GitHub Pages

**Monitor deployment**:
- Go to **"Actions"** tab in your repository
- Watch the **"Deploy Frontend to GitHub Pages"** workflow

### Step 5: Access Your Live Site

After deployment completes (~3-5 minutes):
- **Live URL**: `https://yourusername.github.io/wordle-exploration`

---

## ✅ Part 3: Verify Deployment

### Frontend Checks
1. Visit `https://yourusername.github.io/wordle-exploration`
2. Dashboard should load without errors
3. Open browser DevTools → Network tab
4. Verify API requests go to Railway URL (not localhost)

### Backend Checks
1. Visit `https://your-railway-url.up.railway.app/docs`
2. FastAPI interactive docs should load
3. Test `/api/v1/health` endpoint
4. Try `/api/v1/dashboard` - should return data

### Integration Test
1. On your GitHub Pages site, check:
   - Overview stats load correctly
   - Charts render with data
   - Pattern search works
   - No CORS errors in browser console

---

## 🔄 Updating Your Deployment

### Update Frontend
Just push to `main` branch - GitHub Actions will automatically redeploy:
```bash
git add frontend/
git commit -m "Update dashboard UI"
git push origin main
```

### Update Backend
Push to `main` branch - Railway will automatically redeploy:
```bash
git add backend/
git commit -m "Fix API endpoint"
git push origin main
```

### Update Data (Re-run ETL)
```bash
railway run python scripts/run_etl.py
```

---

## 🐛 Troubleshooting

### Frontend Shows "Failed to fetch" Errors
- **Check**: CORS_ORIGINS in Railway includes your GitHub Pages URL
- **Check**: Railway backend is running (check Railway dashboard)
- **Check**: API URL in `frontend/.env.production` is correct

### Backend 500 Errors
- **Check**: Railway logs (click on service → "Logs" tab)
- **Check**: DATABASE_URL environment variable is set
- **Check**: ETL pipeline completed successfully

### GitHub Pages Shows 404
- **Check**: `gh-pages` branch exists
- **Check**: GitHub Pages is enabled in repository settings
- **Check**: Base path in `vite.config.ts` matches repository name

### Railway Runs Out of Credits
- **Option 1**: Pause backend service when not demoing
- **Option 2**: Add payment method (first $5/month still free)
- **Option 3**: Optimize queries to reduce CPU usage

### Backend Wakes Up Slowly
- This shouldn't happen with Railway (no cold starts)
- If you see delays, check Railway status page

---

## 💡 Tips for Portfolio Demos

1. **Warm up backend before demo**: Visit health endpoint first
2. **Share direct link**: `https://yourusername.github.io/wordle-exploration`
3. **Monitor credits**: Check Railway dashboard weekly
4. **Update README**: Add live demo badge to repository README

---

## 📊 Cost Breakdown (Free Tier)

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| Railway | $5 credit/month | ~$2-3/month | $0 |
| GitHub Pages | Unlimited | N/A | $0 |
| **Total** | | | **$0/month** |

**Note**: Railway $5/month credit should easily cover portfolio traffic (300-500 visits/month).

---

## 🔐 Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] Production secrets use Railway environment variables (not committed)
- [ ] CORS only allows GitHub Pages domain (not wildcard `*`)
- [ ] API has rate limiting enabled
- [ ] Kaggle credentials stored securely in Railway

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [Vite Production Build Guide](https://vitejs.dev/guide/build.html)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

---

## 🆘 Need Help?

Check Railway logs:
```bash
railway logs
```

Check GitHub Actions logs:
- Repository → Actions tab → Latest workflow run

Common issues and solutions are documented in [docs/04-troubleshooting/](docs/04-troubleshooting/) (if it exists).
