# Environment Setup - Quick Start

## 🚀 Get Started in 3 Steps

### 1. Copy the example file
```bash
cp .env.example .env
```

### 2. Add your Kaggle API token

Open `.env` and update line 34:
```bash
KAGGLE_API_TOKEN=your_actual_token_here
```

**How to get your token:**
1. Go to https://www.kaggle.com/settings/account
2. Scroll to "API" section
3. Click "Create New Token"
4. Copy the token from the downloaded `kaggle.json` file

### 3. Start Docker
```bash
docker compose up
```

That's it! Your environment is configured.

---

## ✅ Verify Setup

```bash
# Check Docker loaded your environment
docker compose config

# Verify backend can connect to database
docker compose exec backend python -c "from backend.db.database import engine; print('Database connected:', engine.url)"

# Test API health
curl http://localhost:8000/health
```

Expected output:
```json
{"status": "healthy"}
```

---

## 🔧 Common Issues

### "Kaggle datasets not downloading"
- ✅ Verify token is correct in `.env`
- ✅ Accept dataset terms on Kaggle website
- ✅ Check logs: `docker compose logs backend`

### "Database connection failed"
- ✅ Ensure Docker is running: `docker compose ps`
- ✅ Wait for database to be healthy (10-15 seconds on first start)
- ✅ Check database logs: `docker compose logs db`

### "Port already in use"
- ✅ Stop other services on port 8000 or 5432
- ✅ Or change ports in `.env`:
  ```bash
  API_PORT=8001
  ```

---

## 📚 Full Documentation

For detailed configuration options, troubleshooting, and production setup:
👉 [Complete Environment Setup Guide](ENVIRONMENT-SETUP.md)

---

## 🎯 Key Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `KAGGLE_API_TOKEN` | Download Wordle datasets | *Required* |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://postgres:postgres@db:5432/wordle` |
| `ENV` | Environment mode | `development` |
| `DEBUG` | Enable debug logging | `true` |

All other variables have sensible defaults for development. You only need to set `KAGGLE_API_TOKEN` to get started.

---

## 🔒 Security Reminder

- ❌ **Never commit `.env` to Git** (it's already in `.gitignore`)
- ✅ Keep `.env.example` generic (no real credentials)
- ✅ Generate new `SECRET_KEY` for production: `openssl rand -hex 32`
