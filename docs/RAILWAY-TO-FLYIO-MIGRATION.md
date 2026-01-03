# Railway Database Migration Plan: PostgreSQL → SQLite

**Project:** Wordle Data Explorer
**Migration Type:** Database Migration (PostgreSQL → SQLite)
**Platform:** Stay on Railway
**Status:** 📋 Ready to Execute
**Estimated Effort:** 1-2 hours
**Cost Impact:** -$5-10/month (eliminate database hosting)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Migration Rationale](#migration-rationale)
3. [Architecture Comparison](#architecture-comparison)
4. [Prerequisites](#prerequisites)
5. [Migration Steps](#migration-steps)
6. [Post-Migration Verification](#post-migration-verification)
7. [Rollback Plan](#rollback-plan)
8. [Cost Analysis](#cost-analysis)
9. [Platform Comparison](#platform-comparison-reference)
10. [FAQ](#faq)

---

## Executive Summary

### What This Migration Does

- **Keeps** Railway backend hosting (already working)
- **Converts** database from Railway PostgreSQL to SQLite file
- **Eliminates** separate database service
- **Reduces** monthly costs by $5-10/month
- **Maintains** same performance and UX

### Why This Migration Makes Sense

| Factor | Current (Railway) | After (SQLite) | Impact |
|--------|------------------|----------------|--------|
| **Backend Cost** | $5-20/month | $5-20/month | No change |
| **Database Cost** | $5-10/month | $0 | **Save $5-10/month** |
| **Total Monthly Cost** | $10-30 | $5-20 | **Save $60-120/year** |
| **Database** | PostgreSQL (managed) | SQLite (176 KB file) | Simpler, no maintenance |
| **Performance** | Excellent | Same or better | No degradation |
| **Code Changes** | N/A | Minimal (0-5 lines) | Very low risk |
| **Deployment** | Git push | Git push | Same workflow |

### Key Insight: Why SQLite?

Your data is **static** (historical Wordle puzzles don't change). Running a managed PostgreSQL database for 176 KB of read-only data is over-engineering. SQLite is:

- ✅ **Perfect for static data** (excellent read performance)
- ✅ **Already supported** in your codebase (`backend/db/database.py:13-16`)
- ✅ **Version controlled** (commit `data/wordle.db` to git)
- ✅ **Zero cost** (no database hosting needed)
- ✅ **Portable** (works anywhere)
- ✅ **Faster** (no network latency - local file access)

---

## Migration Rationale

### Problems with Current Setup

1. **Database Cost:** Paying $5-10/month for 176 KB of static data
2. **Over-engineering:** PostgreSQL designed for concurrent writes (you only read)
3. **Complexity:** Managing separate database service unnecessarily
4. **Network Latency:** API → Database round-trip adds ~10-50ms per query

### Why Stay on Railway?

Railway backend hosting is working well:
- ✅ Always-on (no cold starts)
- ✅ Good performance
- ✅ Simple deployment
- ✅ Familiar workflow

**There's no reason to change what works.** Just optimize the database layer.

### Why SQLite?

| Factor | PostgreSQL (Current) | SQLite (Proposed) |
|--------|---------------------|-------------------|
| **Cost** | $5-10/month | $0 |
| **Setup** | External service | File in container |
| **Query Speed** | Network latency (~10-50ms) | Local file (~1-5ms) |
| **Maintenance** | Managed, but still a service | Zero maintenance |
| **Backups** | Manual exports | Git version control |
| **Concurrency** | High (1000+ concurrent writes) | Low (read-only is fine) |
| **Use Case Fit** | Overkill for static data | **Perfect fit** |

---

## Architecture Comparison

### Current Architecture (Railway + PostgreSQL)

```
┌────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  GitHub Pages  │────→│    Railway      │────→│    Railway       │
│   (Frontend)   │     │  (FastAPI)      │     │  (PostgreSQL)    │
│                │     │  Port: 8000     │     │  ~176 KB data    │
└────────────────┘     └─────────────────┘     └──────────────────┘
                              ↑                        ↑
                       $5-20/month              $5-10/month
```

**Monthly Cost:** $10-30
**Complexity:** 2 Railway services
**Database:** Separate PostgreSQL instance

---

### New Architecture (Railway + SQLite)

```
┌────────────────┐     ┌──────────────────────────────┐
│  GitHub Pages  │────→│         Railway              │
│   (Frontend)   │     │  ┌────────────────────────┐  │
│                │     │  │  FastAPI Backend       │  │
│                │     │  │  + SQLite (176 KB)     │  │
│                │     │  │  /app/data/wordle.db   │  │
│                │     │  └────────────────────────┘  │
└────────────────┘     └──────────────────────────────┘
                                    ↑
                              $5-20/month
```

**Monthly Cost:** $5-20
**Complexity:** 1 Railway service
**Database:** SQLite file in container
**Savings:** $5-10/month ($60-120/year)

---

### ETL Workflow Comparison

#### Current (Railway PostgreSQL)

```bash
# Run ETL on Railway server or locally
railway run python scripts/run_etl.py

# Data stored in Railway PostgreSQL
# Database persists independently
```

#### New (SQLite in Container)

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

| Tool | Version | Already Have? | Installation |
|------|---------|--------------|--------------|
| **Git** | 2.x+ | ✅ Yes | N/A |
| **Python** | 3.11+ | ✅ Yes | N/A |
| **Railway CLI** | Latest | Maybe | `npm i -g @railway/cli` |

### Required Access

- ✅ Railway dashboard access
- ✅ Write access to GitHub repository
- ✅ Kaggle account (for ETL data)

### Environment Variables to Keep

These stay the same:

```bash
# From Railway Dashboard → Variables
SECRET_KEY=<keep-current-value>
KAGGLE_USERNAME=<keep-current-value>
KAGGLE_KEY=<keep-current-value>
CORS_ORIGINS=<keep-current-value>
ENV=production
DEBUG=false
LOG_LEVEL=WARNING
```

### Environment Variable to REMOVE

```bash
# DELETE THIS from Railway
DATABASE_URL=<postgresql://...>
```

When `DATABASE_URL` is not set, your app automatically falls back to SQLite (already coded in `backend/db/database.py:13-16`).

---

## Migration Steps

### Phase 1: Backup Current Database (15 minutes)

#### Step 1.1: Export PostgreSQL Data

```bash
# Connect to Railway PostgreSQL
railway connect postgres

# Inside psql, export data
\copy words TO '/tmp/words.csv' CSV HEADER;
\copy distributions TO '/tmp/distributions.csv' CSV HEADER;
\copy patterns TO '/tmp/patterns.csv' CSV HEADER;
\copy trap_analysis TO '/tmp/trap_analysis.csv' CSV HEADER;
\copy tweet_sentiment TO '/tmp/tweet_sentiment.csv' CSV HEADER;
\copy outliers TO '/tmp/outliers.csv' CSV HEADER;
\copy pattern_statistics TO '/tmp/pattern_statistics.csv' CSV HEADER;
\copy pattern_transitions TO '/tmp/pattern_transitions.csv' CSV HEADER;
\copy global_stats TO '/tmp/global_stats.csv' CSV HEADER;

# Exit
\q
```

Or use `pg_dump`:

```bash
# Get DATABASE_URL from Railway
railway variables

# Export entire database
pg_dump $DATABASE_URL > railway_postgres_backup_$(date +%Y%m%d).sql
```

**Save this file!** It's your rollback insurance.

---

### Phase 2: Create SQLite Database (20 minutes)

#### Step 2.1: Update .gitignore

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

---

#### Step 2.2: Run ETL Locally

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

#### Step 2.3: Verify Database

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

#### Step 2.4: Commit Database

```bash
git add .gitignore data/wordle.db
git commit -m "feat: migrate from PostgreSQL to SQLite for static data

- Add SQLite database (176 KB) to version control
- Eliminate need for separate database service
- Saves $5-10/month in database hosting costs
- Same data, better performance (local file access)"

git push origin claude/railway-supabase-migration-estimate-eFrf6
```

---

### Phase 3: Update Railway Configuration (15 minutes)

#### Step 3.1: Remove DATABASE_URL

```bash
# Option A: Via Railway Dashboard
# 1. Go to https://railway.app/dashboard
# 2. Select your project
# 3. Click "Variables" tab
# 4. Find DATABASE_URL
# 5. Click "..." → "Remove"
# 6. Confirm

# Option B: Via Railway CLI
railway variables --remove DATABASE_URL
```

⚠️ **Important:** Removing `DATABASE_URL` tells your app to use SQLite instead. This is already coded in `backend/db/database.py`.

---

#### Step 3.2: Verify Dockerfile Includes Data Directory

**File:** `Dockerfile`

Verify this line exists (should already be there):

```dockerfile
# Copy project
COPY . .
```

This copies everything, including `data/wordle.db`. No changes needed!

---

#### Step 3.3: Deploy to Railway

```bash
# Push changes
git push origin main

# Railway auto-deploys on push
# Monitor deployment:
railway logs
```

**Watch for:**
```
DEBUG: Connecting to sqlite:///app/data/wordle.db
```

This confirms SQLite is being used!

---

### Phase 4: Verify Migration (20 minutes)

#### Step 4.1: Test API Endpoints

```bash
# Get your Railway URL
railway domain

# Set as variable (replace with your actual URL)
export API_URL=https://wordle-decoded-production.up.railway.app/api/v1

# 1. Health check
curl $API_URL/health
# Expected: {"status":"success","data":{"healthy":true,...}}

# 2. Words endpoint
curl "$API_URL/words?limit=5"
# Expected: Array of 5 words

# 3. Global stats
curl $API_URL/dashboard/global-stats
# Expected: Stats with total_words, hardest_word, etc.

# 4. Difficulty timeline
curl "$API_URL/difficulty/timeline?limit=30"
# Expected: 30 days of difficulty data
```

If all return valid data, **migration is successful!**

---

#### Step 4.2: Test Frontend

```bash
# Open frontend
open https://rafiag.github.io/wordle-decoded

# Manual checklist:
# [ ] Dashboard loads
# [ ] All charts render
# [ ] Data displays correctly
# [ ] No console errors (F12)
# [ ] Interactive features work
```

---

#### Step 4.3: Check Railway Logs

```bash
railway logs

# Look for:
# - "Connecting to sqlite:///app/data/wordle.db" ✅
# - No PostgreSQL connection errors ✅
# - API requests succeeding ✅
```

---

### Phase 5: Clean Up (10 minutes)

#### Step 5.1: Delete Railway PostgreSQL Service

⚠️ **Wait 1 week before doing this** to ensure everything works!

```bash
# Via Railway Dashboard:
# 1. Go to project
# 2. Find PostgreSQL service
# 3. Click "..." → "Remove Service"
# 4. Confirm deletion

# This stops billing for the database
```

---

#### Step 5.2: Update Documentation

**File:** `DEPLOYMENT.md`

Update to reflect SQLite:

```markdown
## Database

The application uses **SQLite** for data storage (static data).

**Database file:** `data/wordle.db` (176 KB, version controlled)

### Updating Data

Run ETL locally and redeploy:
```bash
python scripts/run_etl.py
git add data/wordle.db
git commit -m "chore: update Wordle data"
git push
```

Railway auto-deploys and includes the updated database.
```

**File:** `README.md`

Update tech stack:

```markdown
## Tech Stack

- **Frontend:** React + Vite + Recharts
- **Backend:** FastAPI + Python 3.11
- **Database:** SQLite (static data, version controlled)
- **Hosting:** Railway
```

---

**Commit docs:**
```bash
git add DEPLOYMENT.md README.md
git commit -m "docs: update for SQLite database"
git push origin claude/railway-supabase-migration-estimate-eFrf6
```

---

## Post-Migration Verification

### ✅ Data Integrity Check

```bash
# SSH into Railway container
railway run bash

# Inside container:
cd /app
python -c "
import sqlite3
conn = sqlite3.connect('data/wordle.db')
cursor = conn.cursor()

# Count records in each table
tables = ['words', 'distributions', 'patterns', 'trap_analysis',
          'tweet_sentiment', 'outliers', 'pattern_statistics',
          'pattern_transitions', 'global_stats']

for table in tables:
    cursor.execute(f'SELECT COUNT(*) FROM {table}')
    count = cursor.fetchone()[0]
    print(f'{table}: {count} records')

conn.close()
"

# Exit
exit
```

**Expected Counts:**
- words: ~320
- distributions: ~320
- patterns: ~6000+
- trap_analysis: ~320
- tweet_sentiment: ~306
- outliers: ~50-100
- pattern_statistics: ~6000+
- pattern_transitions: ~2000+
- global_stats: 1

---

### ✅ Performance Comparison

```bash
# Test query speed (should be faster with SQLite)
time curl -s $API_URL/words?limit=100 > /dev/null

# Run 10 times and compare to old PostgreSQL times
for i in {1..10}; do
  time curl -s $API_URL/dashboard/global-stats > /dev/null
done
```

**Expected:** Equal or better performance (no network latency to database).

---

### ✅ Cost Verification

After 1 billing cycle:

```bash
# Check Railway invoice
# Old: Backend ($5-20) + Database ($5-10) = $10-30
# New: Backend only ($5-20) = $5-20
# Savings: $5-10/month
```

---

## Rollback Plan

### If Migration Fails: Restore PostgreSQL

**Timeline:** 15 minutes to rollback

#### Step 1: Re-add PostgreSQL Service to Railway

```bash
# Via Railway Dashboard:
# 1. Add new service → PostgreSQL
# 2. Wait for provisioning (~2 minutes)
# 3. Copy DATABASE_URL
```

---

#### Step 2: Restore Data

```bash
# Upload backup
cat railway_postgres_backup_YYYYMMDD.sql | railway connect postgres

# Or re-run ETL against PostgreSQL
export DATABASE_URL=<new-postgresql-url>
python scripts/run_etl.py
```

---

#### Step 3: Re-add DATABASE_URL to Railway

```bash
railway variables --set DATABASE_URL=<postgresql-url>
```

---

#### Step 4: Redeploy

```bash
# Trigger redeploy
railway up
```

---

#### Step 5: Verify

```bash
railway logs
# Look for: "Connecting to postgresql://..."
```

---

## Cost Analysis

### Current Monthly Costs (Railway + PostgreSQL)

| Service | Cost |
|---------|------|
| **Backend Web Service** | $5-20 |
| **PostgreSQL Database** | $5-10 |
| **TOTAL** | **$10-30/month** |

**Annual:** $120-360

---

### New Monthly Costs (Railway + SQLite)

| Service | Cost |
|---------|------|
| **Backend Web Service** | $5-20 |
| **SQLite Database** | $0 (included in container) |
| **TOTAL** | **$5-20/month** |

**Annual:** $60-240

---

### Cost Savings

| Period | Savings |
|--------|---------|
| **Monthly** | $5-10 |
| **Yearly** | $60-120 |
| **3 Years** | $180-360 |

---

### When PostgreSQL Makes Sense

Use PostgreSQL if:
- ❌ You have concurrent writes (multiple users updating data)
- ❌ Data exceeds 1GB
- ❌ You need complex transactions
- ❌ You need real-time updates

For static, read-only data under 1GB? **SQLite is better.**

---

## Platform Comparison (Reference)

In case you reconsider platforms in the future, here's the 2026 landscape:

### Free Tier Reality Check

**Bad news:** Most "free tiers" have been eliminated or severely limited in 2024-2026.

| Platform | Free Tier? | Always-On? | Actual Cost |
|----------|-----------|------------|-------------|
| **Fly.io** | ❌ No (trial only) | N/A | ~$17-20/month |
| **Railway** | ❌ No (trial only) | N/A | $5-30/month |
| **Render** | ✅ Yes | ❌ No (15min sleep) | $0 or $7/month |
| **Vercel** | ✅ Yes (serverless) | ⚠️ Cold starts | $0 (limited compute) |
| **Koyeb** | ✅ Yes | ❌ No (mandatory scale-to-zero) | $0 or $1.61/month |

### Always-On Options (Cheapest to Most Expensive)

| Platform | Cost/Month | Notes |
|----------|-----------|-------|
| **Koyeb Eco** | $1.61 | Cheapest always-on option |
| **Railway** | $5-20 | What you're using (reliable) |
| **Fly.io** | $17-20 | Similar to Railway |
| **Render Starter** | $7+ | Paid tier (no sleep) |
| **Self-Host (Coolify)** | $5+ VPS | DIY, full control |

### Recommendation: Stay on Railway

**Why:**
- ✅ Already working
- ✅ Reliable and fast
- ✅ Simple deployment
- ✅ Good developer experience
- ✅ With SQLite, cost is competitive ($5-20/month)

**When to consider alternatives:**
- If Railway raises prices significantly
- If you need multi-region deployment
- If you want to self-host for learning

**Sources:**
- [Fly.io Pricing 2026](https://fly.io/docs/about/pricing/)
- [Render Free Tier](https://render.com/docs/free)
- [Koyeb Pricing](https://www.koyeb.com/pricing)
- [Railway Alternatives Comparison](https://northflank.com/blog/railway-alternatives)

---

## FAQ

### Q: Will performance be affected by switching to SQLite?

**A:** Performance should **improve**!

SQLite advantages:
- ✅ **No network latency** (local file vs. remote PostgreSQL)
- ✅ **Faster reads** (optimized for read-heavy workloads)
- ✅ **Lower memory usage** (no connection pooling overhead)

For static, read-only data, SQLite is often **2-5x faster** than networked PostgreSQL.

---

### Q: What if my data grows beyond 1GB?

**A:** You're safe for a very long time.

Current: 176 KB
- **10 years of daily Wordle:** ~640 KB
- **100 years:** ~6.4 MB
- **1000 years:** ~64 MB

SQLite handles databases up to **281 TB**. You'd need 1.6 million years of Wordle data to hit limits!

---

### Q: Can I still update the data after migration?

**A:** Yes! Even simpler than before:

```bash
# Run ETL locally
python scripts/run_etl.py

# Commit updated database
git add data/wordle.db
git commit -m "chore: update data"
git push

# Railway auto-deploys
```

No database connection needed. All local.

---

### Q: What about database backups?

**A:**
1. **Git = automatic backups** (every commit is a backup)
2. **Download from Railway:**
   ```bash
   railway run cat /app/data/wordle.db > backup.db
   ```
3. **Restore any version:**
   ```bash
   git checkout <commit-hash> data/wordle.db
   ```

**Much simpler than PostgreSQL backups!**

---

### Q: Is SQLite production-ready?

**A:** Absolutely!

Used in production by:
- **Apple** (iOS, macOS core data)
- **Google** (Android, Chrome)
- **Microsoft** (Windows 10)
- **Expensify** (entire app backend)
- **Fossil** (version control system)

SQLite is **the most deployed database in the world** (billions of installations).

For read-heavy workloads with static data, it's **more reliable** than client-server databases.

---

### Q: Can I go back to PostgreSQL if needed?

**A:** Yes! Takes 15 minutes (see Rollback Plan).

Your PostgreSQL backup file lets you restore anytime. Or re-run ETL against a new PostgreSQL instance.

---

### Q: Will this affect my frontend?

**A:** Zero impact!

Frontend only knows about the API endpoints (`/api/v1/words`, etc.). It doesn't know or care what database the backend uses.

No frontend code changes needed.

---

### Q: What if I want to add user accounts later?

**A:** Then switch back to PostgreSQL.

SQLite is great for static data, but PostgreSQL is better for:
- User authentication (concurrent writes)
- Real-time collaboration
- Heavy write workloads

**For now:** Save money with SQLite
**Later:** Easy to migrate back if needs change

---

### Q: How do I monitor the SQLite database?

**A:**
```bash
# SSH into Railway
railway run bash

# Inside container:
sqlite3 /app/data/wordle.db

# SQL queries:
SELECT COUNT(*) FROM words;
SELECT * FROM global_stats;
.schema words

# Exit
.quit
```

Or use a GUI like [DB Browser for SQLite](https://sqlitebrowser.org/) locally.

---

### Q: Does this affect my Railway trial credits?

**A:** No, but it extends them!

By eliminating the PostgreSQL service, you only pay for the backend. Your trial credits last longer.

---

### Q: What if the SQLite file gets corrupted?

**A:** Multiple recovery options:

1. **Git history:** `git checkout HEAD~1 data/wordle.db`
2. **Rebuild:** `python scripts/run_etl.py` (15 minutes)
3. **PostgreSQL backup:** Restore from old backup

SQLite is **extremely** stable. Corruption is rare (< 0.01% of deployments).

---

## Next Steps After Migration

### Week 1: Monitor
- [ ] Check Railway logs daily
- [ ] Verify API endpoints work
- [ ] Watch for errors
- [ ] Compare response times

### Week 2: Optimize
- [ ] Review Railway resource usage
- [ ] Consider downgrading if over-provisioned
- [ ] Test query performance

### Month 1: Celebrate!
- [ ] Verify reduced Railway bill
- [ ] Delete PostgreSQL service (if confident)
- [ ] Calculate annual savings (~$60-120)

### Ongoing:
- [ ] Update data when needed (ETL + commit)
- [ ] Monitor Railway costs
- [ ] Keep SQLite best practices in mind

---

## Migration Checklist

- [ ] Backup PostgreSQL data (`pg_dump`)
- [ ] Update `.gitignore` (allow `data/wordle.db`)
- [ ] Run ETL locally (`python scripts/run_etl.py`)
- [ ] Verify SQLite database created (~176 KB)
- [ ] Commit SQLite to git
- [ ] Push to GitHub
- [ ] Remove `DATABASE_URL` from Railway
- [ ] Railway auto-deploys
- [ ] Test all API endpoints
- [ ] Verify frontend works
- [ ] Check Railway logs (should show SQLite connection)
- [ ] Monitor for 1 week
- [ ] Delete PostgreSQL service
- [ ] Update documentation
- [ ] Celebrate savings! 🎉

---

**Document Version:** 2.0
**Last Updated:** 2026-01-03
**Migration Status:** Ready to Execute
**Estimated Duration:** 1-2 hours
**Risk Level:** Very Low
**Reversibility:** Very High (15-minute rollback)
**Cost Savings:** $60-120/year

---

**Good luck with your migration! 💾**

For questions or issues, refer to the FAQ or create an issue in the repository.
