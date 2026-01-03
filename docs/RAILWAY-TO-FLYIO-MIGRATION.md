# Railway to Fly.io Migration Plan

**Project:** Wordle Data Explorer
**Migration Type:** Full Platform Migration (Railway → Fly.io)
**Database Strategy:** PostgreSQL → SQLite (Static Data)
**Status:** 📋 Ready to Execute
**Estimated Effort:** 2-3 hours
**Cost Impact:** -$10-30/month (Railway paid → Fly.io free)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Migration Rationale](#migration-rationale)
3. [Architecture Comparison](#architecture-comparison)
4. [Prerequisites](#prerequisites)
5. [Pre-Migration Checklist](#pre-migration-checklist)
6. [Migration Steps](#migration-steps)
7. [Post-Migration Verification](#post-migration-verification)
8. [Rollback Plan](#rollback-plan)
9. [Troubleshooting](#troubleshooting)
10. [Cost Analysis](#cost-analysis)
11. [FAQ](#faq)

---

## Executive Summary

### What This Migration Does

- **Moves** backend hosting from Railway to Fly.io (free tier)
- **Converts** database from Railway PostgreSQL to SQLite file
- **Keeps** FastAPI backend and React frontend unchanged
- **Eliminates** monthly hosting costs ($10-30/month → $0)
- **Improves** UX with always-on service (no cold starts)

### Why This Migration Makes Sense

| Factor | Current (Railway) | After (Fly.io) | Impact |
|--------|------------------|----------------|--------|
| **Monthly Cost** | $10-30 | $0 | **Save $120-360/year** |
| **Database** | PostgreSQL (managed) | SQLite (176 KB file) | Simpler, no maintenance |
| **Cold Starts** | None (always-on) | None (always-on) | No change in UX |
| **Code Changes** | N/A | Minimal (~15 lines) | Low risk |
| **Deployment** | Git push | Git push | Same workflow |

### Key Insight: Why SQLite?

Your data is **static** (historical Wordle puzzles don't change). Running PostgreSQL for 176 KB of read-only data is like renting a warehouse to store a shoebox. SQLite is:
- ✅ **Perfect for static data** (excellent read performance)
- ✅ **Already supported** in your codebase (`backend/db/database.py:13-16`)
- ✅ **Version controlled** (commit `data/wordle.db` to git)
- ✅ **Zero cost** (no database hosting needed)
- ✅ **Portable** (works anywhere)

---

## Migration Rationale

### Problems with Current Setup

1. **Cost:** Railway charges $10-30/month for services you can get free elsewhere
2. **Over-engineering:** PostgreSQL unnecessary for static, read-only data
3. **Complexity:** Separate database hosting when SQLite works perfectly
4. **Budget:** As a portfolio project, minimizing costs maximizes ROI

### Why Fly.io?

| Feature | Fly.io Free | Railway | Render Free |
|---------|-------------|---------|-------------|
| **Cost** | $0/month | $10-30/month | $0/month |
| **Always-On** | ✅ Yes | ✅ Yes | ❌ No (15min spin-down) |
| **Cold Starts** | ✅ None | ✅ None | ❌ ~30s wake-up |
| **Free Tier VMs** | 3 shared-cpu | 0 | 750 hrs/month |
| **Persistent Storage** | 3 GB free | Paid only | Ephemeral |
| **Docker Support** | ✅ Native | ✅ Native | ✅ Yes |
| **Best For** | **Always-on free hosting** | Production apps | Hobby projects |

**Winner:** Fly.io provides Railway-quality performance at Render-level pricing (free), without Render's cold start problem.

---

## Architecture Comparison

### Current Architecture (Railway)

```
┌────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  GitHub Pages  │────→│    Railway      │────→│    Railway       │
│   (Frontend)   │     │  (FastAPI)      │     │  (PostgreSQL)    │
│                │     │  Port: 8000     │     │  ~176 KB data    │
└────────────────┘     └─────────────────┘     └──────────────────┘
                              ↑
                       $5-20/month         $5-10/month
```

**Monthly Cost:** $10-30
**Complexity:** 3 separate services
**Database:** Managed PostgreSQL (overkill for static data)

---

### New Architecture (Fly.io)

```
┌──────────────────────────────────────────────┐
│              Fly.io (Free)                   │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  Docker Container                      │ │
│  │  ┌──────────────┐  ┌─────────────────┐│ │
│  │  │   Frontend   │  │    Backend      ││ │
│  │  │ (Static)     │  │   (FastAPI)     ││ │
│  │  │              │  │                 ││ │
│  │  └──────────────┘  └─────────────────┘│ │
│  │                                        │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  SQLite (176 KB)                │  │ │
│  │  │  /app/data/wordle.db            │  │ │
│  │  └─────────────────────────────────┘  │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  Persistent Volume (1 GB free)              │
└──────────────────────────────────────────────┘

Monthly Cost: $0
```

**Monthly Cost:** $0
**Complexity:** Single service
**Database:** SQLite file (perfect for static data)

---

### ETL Workflow Comparison

#### Current (Railway)

```bash
# Run ETL on Railway server
railway run python scripts/run_etl.py

# Data stored in Railway PostgreSQL
# Database persists independently
```

#### New (Fly.io + SQLite)

```bash
# Run ETL locally (your machine)
python scripts/run_etl.py

# Creates: data/wordle.db (176 KB)

# Commit to git
git add data/wordle.db
git commit -m "chore: update Wordle data"

# Deploy (auto-includes DB file)
git push origin main
```

**Advantages:**
- ✅ Faster (no remote execution)
- ✅ Version controlled (DB in git)
- ✅ Reproducible (anyone can rebuild)
- ✅ No database hosting needed

---

## Prerequisites

### Required Tools

| Tool | Version | Installation | Verify |
|------|---------|--------------|--------|
| **Fly CLI** | Latest | `curl -L https://fly.io/install.sh \| sh` | `fly version` |
| **Git** | 2.x+ | Already installed | `git --version` |
| **Python** | 3.11+ | Already installed | `python --version` |
| **Docker** | Latest | For local testing | `docker --version` |

### Required Accounts

- ✅ **Fly.io account** - Sign up at https://fly.io/app/sign-up (free, no credit card)
- ✅ **GitHub account** - Already have (for repo access)
- ✅ **Kaggle account** - Already have (for ETL data)

### Required Access

- ✅ Write access to GitHub repository
- ✅ Railway dashboard access (to export env vars)
- ✅ Domain/DNS access (if using custom domain - optional)

### Environment Variables Needed

Export these from Railway before starting:

```bash
# From Railway Dashboard → Variables
SECRET_KEY=<your-secret-key>
KAGGLE_USERNAME=<your-username>
KAGGLE_KEY=<your-key>
CORS_ORIGINS=<frontend-url>
```

---

## Pre-Migration Checklist

### ✅ Backup Current System

- [ ] **Export Railway database**
  ```bash
  # Connect to Railway PostgreSQL
  railway connect postgres

  # Export data (backup)
  pg_dump -U <user> <database> > railway_backup.sql
  ```

- [ ] **Document current environment variables**
  ```bash
  # In Railway Dashboard
  # Copy all environment variables to local file
  # Save as: railway-env-backup.txt
  ```

- [ ] **Save current deployment URL**
  ```bash
  # Example: https://wordle-decoded-production.up.railway.app
  # Save in: migration-notes.txt
  ```

### ✅ Verify Local Setup

- [ ] **Test Docker Compose locally**
  ```bash
  docker compose up --build
  # Verify: http://localhost:3000 works
  # Verify: http://localhost:8000/api/v1/health works
  ```

- [ ] **Run ETL pipeline locally**
  ```bash
  # Ensure no DATABASE_URL in .env
  python scripts/run_etl.py

  # Verify: data/wordle.db created (~176 KB)
  ls -lh data/wordle.db
  ```

- [ ] **Test backend with SQLite**
  ```bash
  # Start backend without DATABASE_URL
  cd backend
  uvicorn api.main:app --reload

  # Test: http://localhost:8000/api/v1/words
  curl http://localhost:8000/api/v1/words?limit=5
  ```

### ✅ Communication

- [ ] **Notify team** (if applicable) of planned downtime window
- [ ] **Set maintenance window:** _________________
- [ ] **Prepare rollback window:** 1 hour after migration start

---

## Migration Steps

### Phase 1: Prepare SQLite Database (30 minutes)

#### Step 1.1: Update .gitignore

**File:** `.gitignore`

**Current:**
```gitignore
# Database files
*.db
*.sqlite
*.sqlite3
```

**Change to:**
```gitignore
# Database files (except production SQLite)
*.db
!data/wordle.db
*.sqlite
*.sqlite3
```

**Commit:**
```bash
git add .gitignore
git commit -m "chore: allow data/wordle.db in version control"
```

---

#### Step 1.2: Run ETL Locally

```bash
# Ensure no DATABASE_URL environment variable
unset DATABASE_URL

# Run ETL pipeline
python scripts/run_etl.py
```

**Expected Output:**
```
INFO - Starting Games ETL...
INFO - Games Data ETL Success (320 games loaded).
INFO - Starting Tweets ETL...
INFO - Tweets Data ETL Success (306 tweets loaded).
INFO - Starting Patterns ETL...
INFO - Patterns Data ETL Success.
INFO - Starting Outliers ETL...
INFO - Outliers ETL Success.
INFO - Starting Traps ETL...
INFO - Traps ETL Success.
INFO - Starting Global Stats ETL...
INFO - Global Stats ETL Success.
INFO - All ETL processes completed successfully.
```

---

#### Step 1.3: Verify Database

```bash
# Check file size
ls -lh data/wordle.db
# Expected: ~176 KB (may vary slightly)

# Quick validation
python -c "
import sqlite3
conn = sqlite3.connect('data/wordle.db')
cursor = conn.cursor()
cursor.execute('SELECT COUNT(*) FROM words')
print(f'Total words: {cursor.fetchone()[0]}')
cursor.execute('SELECT word, date FROM words LIMIT 5')
print('Sample words:', cursor.fetchall())
conn.close()
"
```

**Expected Output:**
```
Total words: 320
Sample words: [('cigar', '2021-06-19'), ('rebut', '2021-06-20'), ...]
```

---

#### Step 1.4: Commit Database

```bash
git add data/wordle.db
git commit -m "feat: add SQLite database for static data deployment"
git push origin claude/railway-supabase-migration-estimate-eFrf6
```

---

### Phase 2: Configure Fly.io (45 minutes)

#### Step 2.1: Install Fly CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Verify:**
```bash
fly version
# Expected: flyctl v0.x.x ...
```

---

#### Step 2.2: Authenticate

```bash
fly auth login
# Opens browser for authentication
# Follow prompts to sign in or create account
```

---

#### Step 2.3: Create Fly.io App

```bash
# Initialize Fly app (don't deploy yet)
fly launch --no-deploy

# Interactive prompts:
# App Name: wordle-decoded (or your preference)
# Region: Select closest to your audience (e.g., sjc - San Jose)
# PostgreSQL: No (we're using SQLite)
# Redis: No
```

**This creates:** `fly.toml` configuration file

---

#### Step 2.4: Configure fly.toml

**File:** `fly.toml`

**Replace generated content with:**

```toml
# Fly.io app configuration
# See https://fly.io/docs/reference/configuration/ for information

app = "wordle-decoded"  # Change to your app name
primary_region = "sjc"   # Change to your preferred region

# Build configuration
[build]
  dockerfile = "Dockerfile"

# Environment variables (non-secret)
[env]
  ENV = "production"
  DEBUG = "false"
  LOG_LEVEL = "WARNING"
  ENABLE_QUERY_CACHE = "true"
  # No DATABASE_URL - will use SQLite default

# HTTP service configuration
[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = false  # Keep always-on (free tier allows this)
  auto_start_machines = true
  min_machines_running = 1    # Always keep 1 instance running

  # Concurrency limits
  [http_service.concurrency]
    type = "requests"
    hard_limit = 250
    soft_limit = 200

# VM resources (free tier)
[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256  # Increase to 512 if needed

# Persistent volume for SQLite database
[[mounts]]
  source = "wordle_data"
  destination = "/app/data"
```

**Commit:**
```bash
git add fly.toml
git commit -m "feat: add Fly.io configuration"
```

---

#### Step 2.5: Create Persistent Volume

```bash
# Create 1GB volume (free tier allows 3GB total)
fly volumes create wordle_data --size 1 --region sjc

# Verify
fly volumes list
```

**Expected Output:**
```
ID          NAME         SIZE  REGION  CREATED AT
vol_xxxxx   wordle_data  1GB   sjc     just now
```

---

#### Step 2.6: Set Secrets

```bash
# Set environment secrets (these won't be in fly.toml)
fly secrets set \
  SECRET_KEY=$(openssl rand -hex 32) \
  KAGGLE_USERNAME=your_kaggle_username \
  KAGGLE_KEY=your_kaggle_key

# Verify secrets are set (values hidden)
fly secrets list
```

**Expected Output:**
```
NAME             DIGEST          CREATED AT
SECRET_KEY       <digest>        just now
KAGGLE_USERNAME  <digest>        just now
KAGGLE_KEY       <digest>        just now
```

---

#### Step 2.7: Update Dockerfile (Optional Enhancement)

**File:** `Dockerfile`

**Add before CMD:**
```dockerfile
# Ensure data directory is persisted on volume
VOLUME /app/data

# Health check for Fly.io
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1
```

**Commit:**
```bash
git add Dockerfile
git commit -m "feat: add volume mount and health check for Fly.io"
```

---

### Phase 3: Update Frontend Configuration (20 minutes)

#### Option A: Serve Frontend from Backend (Simpler)

**Step 3.1: Update Dockerfile**

**File:** `Dockerfile`

**Add after COPY . .:**
```dockerfile
# Build frontend during Docker build
WORKDIR /app/frontend
RUN npm install && npm run build

# Move built files to static serving location
RUN mkdir -p /app/static && cp -r dist/* /app/static/

WORKDIR /app
```

---

**Step 3.2: Update FastAPI to Serve Frontend**

**File:** `backend/api/main.py`

**Add imports:**
```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
```

**Add before app.include_router() calls:**
```python
# Serve frontend static files (only if static directory exists)
static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "static")
if os.path.exists(static_dir):
    # Serve API routes first (higher priority)
    # Then serve static files
    app.mount("/assets", StaticFiles(directory=f"{static_dir}/assets"), name="assets")

    # Catch-all route for SPA (must be last)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve index.html for all non-API routes (SPA support)"""
        # Don't interfere with API routes
        if full_path.startswith("api/"):
            return {"error": "Not found"}

        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Frontend not built"}
```

---

**Step 3.3: Update Frontend API URL**

**File:** `frontend/.env.production`

**Change:**
```bash
# Old (Railway)
VITE_API_URL=https://wordle-decoded-production.up.railway.app/api/v1

# New (Fly.io - same domain)
VITE_API_URL=/api/v1
```

---

**Step 3.4: Test Locally**

```bash
# Build Docker image
docker build -t wordle-test .

# Run container
docker run -p 8000:8000 wordle-test

# Test API: http://localhost:8000/api/v1/health
# Test Frontend: http://localhost:8000/
```

---

**Commit:**
```bash
git add Dockerfile backend/api/main.py frontend/.env.production
git commit -m "feat: serve frontend from FastAPI for single-container deployment"
git push origin claude/railway-supabase-migration-estimate-eFrf6
```

---

#### Option B: Keep Frontend Separate (Alternative)

If you prefer to keep frontend on GitHub Pages or deploy separately to Vercel:

**Step 3.1: Update CORS in Backend**

**File:** `backend/api/main.py`

**Update CORS_ORIGINS:**
```python
# For Fly.io backend + GitHub Pages frontend
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "https://rafiag.github.io,https://wordle-decoded.fly.dev"
).split(",")
```

**Step 3.2: Set CORS Secret**

```bash
fly secrets set CORS_ORIGINS="https://rafiag.github.io,https://wordle-decoded.fly.dev"
```

**Step 3.3: Update Frontend API URL**

**File:** `frontend/.env.production`

```bash
VITE_API_URL=https://wordle-decoded.fly.dev/api/v1
```

**Step 3.4: Update GitHub Actions**

**File:** `.github/workflows/deploy-frontend.yml`

**Update secret:**
```yaml
env:
  VITE_API_URL: https://wordle-decoded.fly.dev/api/v1
```

---

### Phase 4: Deploy to Fly.io (15 minutes)

#### Step 4.1: Initial Deployment

```bash
# Deploy application
fly deploy

# Follow build progress
# Expected: 3-5 minutes for initial deployment
```

**Expected Output:**
```
==> Building image
...
==> Pushing image to fly
...
==> Deploying
...
 ✓ Machine created
 ✓ Machine started
 ✓ Health checks passing
==> Visit your newly deployed app at https://wordle-decoded.fly.dev/
```

---

#### Step 4.2: Verify Deployment

```bash
# Check app status
fly status

# Check logs
fly logs

# Open in browser
fly open
```

**Expected Status:**
```
App
  Name     = wordle-decoded
  Owner    = your-org
  Hostname = wordle-decoded.fly.dev
  Platform = machines

Machines
ID          STATE   REGION  HEALTH CHECKS   CREATED
xxx         started sjc     1 total, 1 passing  just now
```

---

#### Step 4.3: Test API Endpoints

```bash
# Health check
curl https://wordle-decoded.fly.dev/api/v1/health

# Words endpoint
curl https://wordle-decoded.fly.dev/api/v1/words?limit=5

# Global stats
curl https://wordle-decoded.fly.dev/api/v1/dashboard/global-stats
```

---

#### Step 4.4: Monitor First Requests

```bash
# Stream logs in real-time
fly logs

# Watch for:
# - "Connecting to sqlite:///app/data/wordle.db"
# - API requests succeeding
# - No errors
```

---

### Phase 5: Update Documentation (20 minutes)

#### Step 5.1: Update DEPLOYMENT.md

**File:** `DEPLOYMENT.md`

**Replace Railway section with:**

```markdown
## Deployment to Fly.io

### Prerequisites
- Fly.io CLI installed
- Fly.io account (free tier)

### Initial Setup

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Authenticate:**
   ```bash
   fly auth login
   ```

3. **Deploy:**
   ```bash
   fly deploy
   ```

### Environment Variables

Set via Fly.io secrets:
```bash
fly secrets set SECRET_KEY=$(openssl rand -hex 32)
fly secrets set KAGGLE_USERNAME=your_username
fly secrets set KAGGLE_KEY=your_api_key
```

### Update Data

Run ETL locally and redeploy:
```bash
python scripts/run_etl.py
git add data/wordle.db
git commit -m "chore: update Wordle data"
git push
fly deploy
```

### Monitoring

```bash
# Check status
fly status

# View logs
fly logs

# SSH into container
fly ssh console
```
```

---

#### Step 5.2: Update README.md

**File:** `README.md`

**Update deployment badge and links:**

```markdown
## 🚀 Live Demo

**Dashboard:** https://wordle-decoded.fly.dev
**API Docs:** https://wordle-decoded.fly.dev/api/v1/docs

## 🏗️ Tech Stack

- **Frontend:** React + Vite + Recharts
- **Backend:** FastAPI + Python 3.11
- **Database:** SQLite (static data)
- **Hosting:** Fly.io (free tier)
- **CI/CD:** GitHub Actions
```

---

#### Step 5.3: Update CLAUDE.md

**File:** `CLAUDE.md`

**Update deployment commands:**

```markdown
### Key Commands (Updated)
- **Run application:** `docker compose up`
- **Deploy to production:** `fly deploy`
- **View logs:** `fly logs`
- **Update data:** `python scripts/run_etl.py` → commit → `fly deploy`
- **Run tests:** `docker compose exec backend pytest`
```

---

**Commit all documentation:**
```bash
git add DEPLOYMENT.md README.md CLAUDE.md
git commit -m "docs: update deployment instructions for Fly.io"
git push origin claude/railway-supabase-migration-estimate-eFrf6
```

---

## Post-Migration Verification

### ✅ Functional Testing (30 minutes)

#### Backend API Tests

```bash
# Base URL
export API_URL=https://wordle-decoded.fly.dev/api/v1

# 1. Health check
curl $API_URL/health
# Expected: {"status":"success","data":{"healthy":true,...}}

# 2. Words endpoint
curl "$API_URL/words?limit=5"
# Expected: Array of 5 words with metadata

# 3. Global stats
curl $API_URL/dashboard/global-stats
# Expected: Stats object with total_words, hardest_word, etc.

# 4. Difficulty timeline
curl "$API_URL/difficulty/timeline?limit=30"
# Expected: Array of 30 days with difficulty data

# 5. Guess distribution
curl "$API_URL/distributions/overview"
# Expected: Distribution stats

# 6. Pattern search
curl "$API_URL/patterns/search?pattern_string=🟩⬛⬛⬛⬛"
# Expected: Pattern analysis

# 7. Outliers
curl "$API_URL/outliers?limit=10"
# Expected: Array of outlier days

# 8. NYT effect
curl $API_URL/nyt/effect
# Expected: NYT comparison data
```

---

#### Frontend Tests (If serving from backend)

```bash
# Open in browser
open https://wordle-decoded.fly.dev

# Manual checklist:
# [ ] Dashboard loads without errors
# [ ] All sections render (Hero, At a Glance, Difficulty, etc.)
# [ ] Charts display data correctly
# [ ] Interactive elements work (filters, inputs)
# [ ] No console errors (F12 → Console)
# [ ] Mobile responsive (resize browser)
```

---

#### Performance Tests

```bash
# Response time test
time curl -s https://wordle-decoded.fly.dev/api/v1/health > /dev/null
# Expected: <500ms

# Load test (simple)
for i in {1..10}; do
  time curl -s https://wordle-decoded.fly.dev/api/v1/words?limit=10 > /dev/null
done
# Expected: All requests <1s
```

---

### ✅ Monitoring Setup

#### Set Up Alerts (Optional)

```bash
# Fly.io doesn't have built-in uptime monitoring on free tier
# Recommended: Use external service

# Option 1: UptimeRobot (free)
# - Create account at uptimerobot.com
# - Add HTTP monitor for https://wordle-decoded.fly.dev/api/v1/health
# - Set check interval: 5 minutes
# - Email alerts on downtime

# Option 2: GitHub Actions Cron (free)
# Create: .github/workflows/uptime-check.yml
# Ping health endpoint every hour
# Send notification on failure
```

---

#### Check Resource Usage

```bash
# View current metrics
fly dashboard

# Or check via CLI
fly status --all
```

---

### ✅ Data Validation

```bash
# SSH into Fly.io container
fly ssh console

# Inside container:
cd /app
python -c "
import sqlite3
conn = sqlite3.connect('data/wordle.db')
cursor = conn.cursor()

# Count records
cursor.execute('SELECT COUNT(*) FROM words')
print(f'Words: {cursor.fetchone()[0]}')

cursor.execute('SELECT COUNT(*) FROM distributions')
print(f'Distributions: {cursor.fetchone()[0]}')

cursor.execute('SELECT COUNT(*) FROM patterns')
print(f'Patterns: {cursor.fetchone()[0]}')

conn.close()
"

# Exit
exit
```

**Expected Counts:**
- Words: ~320
- Distributions: ~320
- Patterns: ~6000+

---

## Rollback Plan

### If Migration Fails: Return to Railway

**Timeline:** Should complete rollback in 15 minutes

#### Step 1: Revert Git Changes

```bash
# If you've pushed commits
git revert HEAD~3..HEAD  # Revert last 3 commits
git push origin claude/railway-supabase-migration-estimate-eFrf6

# Or reset to before migration
git reset --hard <commit-before-migration>
git push --force origin claude/railway-supabase-migration-estimate-eFrf6
```

---

#### Step 2: Verify Railway Still Works

```bash
# Check Railway dashboard
# Verify app still deployed: https://wordle-decoded-production.up.railway.app

# Test API
curl https://wordle-decoded-production.up.railway.app/api/v1/health

# Test frontend
open https://rafiag.github.io/wordle-decoded
```

---

#### Step 3: Clean Up Fly.io

```bash
# Destroy Fly.io app
fly apps destroy wordle-decoded

# Remove volume
fly volumes list
fly volumes delete <volume-id>
```

---

#### Step 4: Document Issues

Create `docs/migration-attempt-log.md`:

```markdown
# Migration Attempt Log

**Date:** YYYY-MM-DD
**Status:** Rolled back
**Reason:** [Describe what went wrong]

## Issues Encountered
1. [Issue 1]
2. [Issue 2]

## Lessons Learned
- [Lesson 1]
- [Lesson 2]

## Next Steps
- [What to try differently]
```

---

### Partial Rollback: Keep Fly.io, Restore PostgreSQL

If SQLite works but you want PostgreSQL back:

```bash
# Option 1: Add Fly.io PostgreSQL
fly postgres create

# Option 2: Use external PostgreSQL (Supabase free)
# Update fly.toml with DATABASE_URL secret
fly secrets set DATABASE_URL="postgresql://..."
```

---

## Troubleshooting

### Issue: "Database file not found"

**Symptom:**
```
ERROR - could not open database: unable to open database file
```

**Cause:** Volume not mounted or DB file not in image

**Solution:**
```bash
# Check if volume is attached
fly volumes list

# Check if DB file exists in image
fly ssh console
ls -lh /app/data/wordle.db

# If missing, ensure data/wordle.db committed to git
git status
git add data/wordle.db
git commit -m "fix: add SQLite database"
fly deploy
```

---

### Issue: "Memory limit exceeded"

**Symptom:**
```
OOMKilled (out of memory)
```

**Cause:** 256 MB too small for pandas/scipy operations

**Solution:**
```toml
# In fly.toml, increase memory
[[vm]]
  memory_mb = 512  # or 1024
```

```bash
fly deploy
```

---

### Issue: "Health checks failing"

**Symptom:**
```
Health check failed
```

**Cause:** Port mismatch or app not starting

**Solution:**
```bash
# Check logs
fly logs

# Verify port
# Ensure Dockerfile exposes 8000
# Ensure fly.toml internal_port = 8000

# Test locally
docker build -t test .
docker run -p 8000:8000 test
curl localhost:8000/api/v1/health
```

---

### Issue: "CORS errors in browser"

**Symptom:**
```
Access to fetch blocked by CORS policy
```

**Cause:** Fly.io URL not in CORS_ORIGINS

**Solution:**
```bash
# Update CORS origins
fly secrets set CORS_ORIGINS="https://rafiag.github.io,https://wordle-decoded.fly.dev"

# Or if serving frontend from backend, ensure main.py CORS config includes all origins
```

---

### Issue: "Frontend shows old API URL"

**Symptom:** Frontend makes requests to Railway URL

**Cause:** .env.production not updated in build

**Solution:**
```bash
# Verify .env.production has correct URL
cat frontend/.env.production

# Rebuild
fly deploy --build-arg VITE_API_URL=https://wordle-decoded.fly.dev/api/v1
```

---

### Issue: "Deployment too slow"

**Symptom:** Build takes >10 minutes

**Cause:** Installing frontend dependencies in Dockerfile

**Solution:**
```dockerfile
# Use layer caching - install deps before copying source
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build
```

---

## Cost Analysis

### Current Monthly Costs (Railway)

| Service | Plan | Cost |
|---------|------|------|
| **Backend Web Service** | Hobby | $5-10 |
| **PostgreSQL Database** | Hobby | $5-10 |
| **Bandwidth** | Included | $0 |
| **Custom Domain** | Included | $0 |
| **TOTAL** | | **$10-20/month** |

**Annual:** $120-240

---

### New Monthly Costs (Fly.io Free Tier)

| Service | Plan | Cost |
|---------|------|------|
| **VM (1 shared-cpu)** | Free Tier | $0 |
| **Persistent Volume (1GB)** | Free Tier | $0 |
| **Bandwidth (160GB)** | Free Tier | $0 |
| **HTTPS/SSL** | Included | $0 |
| **TOTAL** | | **$0/month** |

**Annual:** $0

---

### Cost Savings

| Period | Savings |
|--------|---------|
| **Monthly** | $10-20 |
| **Yearly** | $120-240 |
| **3 Years** | $360-720 |

---

### If You Exceed Free Tier (Unlikely)

| Resource | Free Limit | Overage Cost | Your Usage | Over? |
|----------|-----------|--------------|------------|-------|
| **VMs** | 3 shared-cpu | $1.94/mo each | 1 VM | ❌ No |
| **Storage** | 3 GB | $0.15/GB/mo | 1 GB | ❌ No |
| **Bandwidth** | 160 GB/mo | $0.02/GB | ~5-10 GB/mo | ❌ No |

**Projected overage:** $0/month for portfolio traffic levels

---

### Break-Even Analysis

**Railway costs:** $15/month average

**Fly.io upgrade path:**
- Free tier: $0/month → Use this indefinitely
- If traffic grows: ~$2-5/month (still 70% cheaper)
- Production scale: $29/month (comparable to Railway, better features)

**Recommendation:** Stay on free tier unless traffic exceeds 100k requests/month

---

## FAQ

### Q: Will my data be lost when I migrate?

**A:** No. You'll:
1. Export current PostgreSQL data as backup
2. Run ETL locally to create SQLite file
3. Commit SQLite to git (version controlled)
4. Deploy to Fly.io with SQLite

Your data is actually **safer** now because it's version controlled.

---

### Q: Can I update the data after migration?

**A:** Yes! Run ETL locally:
```bash
python scripts/run_etl.py
git add data/wordle.db
git commit -m "chore: update data"
git push
fly deploy
```

Or set up a cron job to automate this.

---

### Q: What if my app gets popular and outgrows free tier?

**A:** Fly.io scales gracefully:
- **First:** Add more VMs ($1.94/month each)
- **Next:** Upgrade to larger VMs ($5-20/month)
- **Finally:** Move to PostgreSQL if writes become heavy

You'll get warnings before hitting limits.

---

### Q: Can I go back to Railway if I change my mind?

**A:** Yes! The rollback process takes 15 minutes. Your Railway account stays active. Just:
1. Stop Fly.io deployment
2. Revert git changes
3. Re-enable Railway service

---

### Q: Will performance be affected?

**A:** No! In fact:
- ✅ **SQLite is faster** for read-heavy workloads (no network latency)
- ✅ **Fly.io has global Anycast** (faster for international users)
- ✅ **No cold starts** (always-on free tier)

You may see performance **improve**.

---

### Q: What about database backups?

**A:**
1. **Git = automatic backups** (data/wordle.db is versioned)
2. **Fly.io volumes** have built-in snapshots
3. **Manual backups:** `fly ssh console` → copy DB file

Much simpler than managing PostgreSQL backups.

---

### Q: Can I use PostgreSQL on Fly.io if I need it later?

**A:** Yes! Fly.io offers managed PostgreSQL:
```bash
fly postgres create
```

Free tier: 1 single-node instance (3GB storage)
Paid: $1.94/month for more resources

---

### Q: What happens if Fly.io changes their free tier?

**A:** You have options:
1. **Upgrade to paid Fly.io** (~$2-5/month, still cheaper than Railway)
2. **Move to Render/Railway** (migration scripts already exist)
3. **Self-host** (Docker image works anywhere)

Your app is **portable** (not locked into Fly.io).

---

### Q: How do I handle secrets/environment variables?

**A:**
```bash
# Set secrets via CLI
fly secrets set KEY=value

# View secrets (values hidden)
fly secrets list

# Update secrets
fly secrets set KEY=new_value

# Secrets are encrypted and never logged
```

---

### Q: Can I use a custom domain?

**A:** Yes!
```bash
# Add certificate
fly certs add yourdomain.com

# Get DNS instructions
fly certs show yourdomain.com

# Update DNS records
# Wait for propagation (up to 24 hours)

# Verify
fly certs check yourdomain.com
```

Free SSL included!

---

### Q: What if SQLite file gets corrupted?

**A:** Multiple recovery options:
1. **Git history:** `git checkout HEAD~1 data/wordle.db`
2. **Rebuild:** `python scripts/run_etl.py` (takes 15 minutes)
3. **Railway backup:** Import from `railway_backup.sql`

SQLite is **very** stable - corruption is extremely rare.

---

### Q: How do I monitor uptime?

**A:** Free options:
1. **Fly.io dashboard:** https://fly.io/dashboard
2. **UptimeRobot:** Free tier (5-minute checks)
3. **GitHub Actions:** Cron job pinging health endpoint

Set up at least one external monitor.

---

### Q: Can multiple people work on this project?

**A:** Yes!
1. Each developer runs `docker compose up` locally
2. ETL creates local SQLite file
3. Git handles merge conflicts in code
4. **Database:** Commit DB updates from one person at a time (avoid conflicts)

**Best practice:** Designate one person as "data maintainer" who runs ETL and commits DB updates.

---

## Next Steps After Migration

### Week 1: Monitor Closely
- [ ] Check logs daily: `fly logs`
- [ ] Monitor uptime (set up UptimeRobot)
- [ ] Test all features manually
- [ ] Watch for any errors

### Week 2: Optimize
- [ ] Review resource usage
- [ ] Tune memory if needed
- [ ] Add caching if beneficial
- [ ] Optimize slow queries

### Month 1: Celebrate Savings!
- [ ] Verify $0 bill from Fly.io
- [ ] Cancel Railway subscription
- [ ] Calculate annual savings (~$120-240)
- [ ] Reinvest savings in domain, monitoring, or other tools

### Ongoing:
- [ ] Update data monthly (ETL + commit + deploy)
- [ ] Monitor free tier limits
- [ ] Keep Fly.io CLI updated
- [ ] Review logs for errors

---

## Support & Resources

### Official Documentation
- **Fly.io Docs:** https://fly.io/docs
- **SQLite Docs:** https://sqlite.org/docs.html
- **FastAPI Docs:** https://fastapi.tiangolo.com

### Community Support
- **Fly.io Community:** https://community.fly.io
- **Fly.io Status:** https://status.fly.io

### Emergency Contacts
- **Fly.io Support:** support@fly.io (paid accounts)
- **Community Forum:** https://community.fly.io (free tier)

---

## Migration Checklist Summary

### Pre-Migration
- [ ] Backup Railway database
- [ ] Export environment variables
- [ ] Test ETL locally
- [ ] Verify SQLite database created

### Migration
- [ ] Update .gitignore
- [ ] Commit SQLite database
- [ ] Install Fly CLI
- [ ] Create Fly.io app
- [ ] Configure fly.toml
- [ ] Set secrets
- [ ] Deploy to Fly.io
- [ ] Update documentation

### Post-Migration
- [ ] Test all API endpoints
- [ ] Verify frontend works
- [ ] Check logs for errors
- [ ] Set up monitoring
- [ ] Update team/users
- [ ] Cancel Railway (after 1 week verification)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-03
**Migration Status:** Ready to Execute
**Estimated Duration:** 2-3 hours
**Risk Level:** Low
**Reversibility:** High (15-minute rollback)

---

**Good luck with your migration! 🚀**

For questions or issues during migration, refer to the Troubleshooting section or create an issue in the repository.
