# Environment Configuration Guide

## Overview

This document describes the environment variables used in the Wordle Data Explorer project and how to configure them for development, testing, and production environments.

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your actual credentials:**
   - Add your Kaggle API token (required for data pipeline)
   - Optionally add GitHub token if needed
   - Review and adjust other settings as needed

3. **Verify Docker Compose loads the environment:**
   ```bash
   docker compose config
   ```

## Required Credentials

### Kaggle API Token (Required)

The Kaggle API token is essential for downloading the Wordle datasets.

**How to get your token:**

1. Sign in to [Kaggle](https://www.kaggle.com)
2. Go to Account Settings: https://www.kaggle.com/settings/account
3. Scroll to the "API" section
4. Click "Create New Token"
5. Download the `kaggle.json` file
6. Copy the token from the JSON file to your `.env`:
   ```
   KAGGLE_API_TOKEN=YOUR_TOKEN_HERE
   ```

**Alternative: Using kaggle.json directly**

You can also place the `kaggle.json` file in `~/.kaggle/kaggle.json` (Linux/Mac) or `C:\Users\<Username>\.kaggle\kaggle.json` (Windows), and the Kaggle library will automatically use it.

### GitHub Token (Optional)

Only needed if you plan to use GitHub integrations or fetch additional data from GitHub.

**How to get a token:**

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate a new token with appropriate scopes
3. Add to `.env`:
   ```
   GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN_HERE
   ```

## Environment Variables Reference

### Database Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | *(empty)* | Connection string. If empty, falls back to SQLite. |
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `wordle` | PostgreSQL database name |

**Note:** Both local and Docker development default to SQLite at `./data/wordle.db` for simplicity. You can switch to PostgreSQL by setting `DATABASE_URL` in your `.env`.

### Application Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `ENV` | `development` | Environment: `development`, `staging`, `production` |
| `DEBUG` | `true` | Enable debug mode (verbose logging, SQL echo) |
| `API_HOST` | `0.0.0.0` | API server host |
| `API_PORT` | `8000` | API server port |
| `API_RELOAD` | `true` | Enable auto-reload on code changes (dev only) |

### Google Trends Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_TRENDS_RATE_LIMIT` | `50` | Maximum requests per hour to Google Trends |
| `GOOGLE_TRENDS_CACHE_DURATION` | `604800` | Cache duration in seconds (7 days) |

**Important:** Google Trends has unofficial rate limits (~50 requests/hour). The ETL pipeline implements aggressive caching and exponential backoff to respect these limits.

### Data Pipeline Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_DIR` | `./data` | Root data directory |
| `RAW_DATA_DIR` | `./data/raw` | Raw downloaded datasets |
| `PROCESSED_DATA_DIR` | `./data/processed` | Processed/transformed data |
| `CACHE_DIR` | `./data/cache` | Cached API responses |
| `ETL_BATCH_SIZE` | `1000` | Bulk insert batch size |
| `ETL_VERBOSE` | `true` | Enable verbose ETL logging |

### NLTK Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NLTK_DATA_PATH` | `./data/nltk_data` | NLTK corpus data directory |

The system automatically downloads required NLTK data (Brown corpus, VADER lexicon) on first run.

### CORS Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Allowed origins (comma-separated) |
| `CORS_ALLOW_CREDENTIALS` | `true` | Allow credentials in CORS requests |

### Performance & Optimization

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_POOL_SIZE` | `10` | Database connection pool size |
| `DB_MAX_OVERFLOW` | `20` | Maximum overflow connections |
| `API_RATE_LIMIT` | `100` | API requests per minute per IP |
| `ENABLE_QUERY_CACHE` | `true` | Enable query result caching |
| `QUERY_CACHE_TTL` | `300` | Query cache TTL in seconds (5 min) |

### Testing Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_DATABASE_URL` | `sqlite:///./data/test_wordle.db` | Test database (separate from dev) |
| `TEST_MODE` | `false` | Enable test mode (mocks external APIs) |

### Security

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `your-secret-key-here-change-in-production` | Secret key for API signing |
| `TOKEN_EXPIRATION` | `3600` | JWT token expiration (seconds) |

**Important:** Generate a secure secret key for production:
```bash
openssl rand -hex 32
```

### Feature Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_EXPERIMENTAL_FEATURES` | `false` | Enable experimental/unstable features |
| `ENABLE_SENTIMENT_ANALYSIS` | `true` | Enable sentiment analysis (Phase 1.9) |
| `ENABLE_TRAP_ANALYSIS` | `true` | Enable trap pattern analysis (Phase 1.8) |

### Data Sources

| Variable | Default | Description |
|----------|---------|-------------|
| `KAGGLE_WORDLE_GAMES_DATASET` | `scarcalvetsis/wordle-games` | Kaggle games dataset ID |
| `KAGGLE_WORDLE_TWEETS_DATASET` | `benhamner/wordle-tweets` | Kaggle tweets dataset ID |
| `NYT_ACQUISITION_DATE` | `2022-02-10` | NYT acquisition date for before/after analysis |

### Frontend Configuration (Phase 1.2+)

| Variable | Default | Description |
|----------|---------|-------------|
| `FRONTEND_URL` | `http://localhost:3000` | Frontend application URL |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | API URL as seen from frontend |
| `ENABLE_ANALYTICS` | `false` | Enable analytics tracking |

## Environment-Specific Configurations

### Development (Local)

```bash
ENV=development
DEBUG=true
API_RELOAD=true
LOG_LEVEL=DEBUG
DATABASE_URL=sqlite:///./data/wordle.db  # Falls back to SQLite if not using Docker
```

### Development (Docker)

```bash
ENV=development
DEBUG=true
API_RELOAD=true
LOG_LEVEL=INFO
DATABASE_URL= # Defaults to SQLite inside Docker
# DATABASE_URL=postgresql://postgres:postgres@db:5432/wordle # Uncomment for Postgres
```

### Testing

```bash
ENV=test
DEBUG=true
TEST_MODE=true
TEST_DATABASE_URL=sqlite:///./data/test_wordle.db
LOG_LEVEL=DEBUG
```

### Production (Future)

```bash
ENV=production
DEBUG=false
API_RELOAD=false
LOG_LEVEL=WARNING
DATABASE_URL=<production-database-url>
SECRET_KEY=<secure-generated-key>
CORS_ORIGINS=https://yourdomain.com
```

## Logging Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `INFO` | Log level: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL` |
| `LOG_FILE` | `./logs/wordle.log` | Log file path |

**Log Levels:**
- **DEBUG:** Verbose logging, SQL queries, detailed ETL progress
- **INFO:** Standard logging, important events, ETL summaries
- **WARNING:** Warnings, deprecated features, rate limit notices
- **ERROR:** Errors, failed operations, exceptions
- **CRITICAL:** Critical failures, system crashes

## Troubleshooting

### Issue: Kaggle datasets not downloading

**Solution:**
1. Verify your `KAGGLE_API_TOKEN` is correct
2. Check Kaggle API status
3. Ensure you've accepted the dataset terms on Kaggle's website
4. Check logs for rate limiting messages

### Issue: Database connection errors

**Solution:**
1. Verify Docker containers are running: `docker compose ps`
2. Check database health: `docker compose logs db`
3. Verify `DATABASE_URL` matches your database service
4. Ensure database service is healthy before backend starts

### Issue: Google Trends rate limiting

**Solution:**
1. Reduce `GOOGLE_TRENDS_RATE_LIMIT` (try 30 or 20)
2. Increase `GOOGLE_TRENDS_CACHE_DURATION` to reduce fresh requests
3. Check `./data/cache/` for cached responses
4. Wait 1 hour before retrying if rate limited

### Issue: CORS errors in frontend

**Solution:**
1. Add frontend URL to `CORS_ORIGINS`
2. Ensure `CORS_ALLOW_CREDENTIALS=true` if using cookies/auth
3. Restart backend after changing CORS settings

## Security Best Practices

### Development
- ✅ Use `.env` for local development
- ✅ Never commit `.env` to version control
- ✅ Use example values in `.env.example`
- ✅ Keep API tokens secure

### Production
- ✅ Use environment variables from hosting platform (not `.env` files)
- ✅ Generate secure `SECRET_KEY` (32+ random bytes)
- ✅ Use strong database passwords
- ✅ Restrict `CORS_ORIGINS` to actual domain(s)
- ✅ Enable HTTPS and secure headers
- ✅ Set `DEBUG=false`
- ✅ Use `LOG_LEVEL=WARNING` or `ERROR`

## Verifying Configuration

### Check Docker Compose configuration:
```bash
docker compose config
```

This shows the resolved configuration with environment variables substituted.

### Check backend environment inside container:
```bash
docker compose exec backend env | grep -E "DATABASE_URL|ENV|DEBUG"
```

### Test database connection:
```bash
docker compose exec backend python -c "from backend.db.database import engine; print(engine.url)"
```

### Validate API configuration:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kaggle API Documentation](https://github.com/Kaggle/kaggle-api)
- [FastAPI Environment Variables](https://fastapi.tiangolo.com/advanced/settings/)
- [Python-dotenv Documentation](https://github.com/theskumar/python-dotenv)

## Need Help?

If you encounter issues not covered here:
1. Check Docker logs: `docker compose logs backend`
2. Check database logs: `docker compose logs db`
3. Review application logs: `./logs/wordle.log`
4. Verify all required credentials are set
5. Ensure Docker services are healthy: `docker compose ps`
