# Environment Setup & Configuration

This guide covers getting your development environment ready, configuring environment variables, and troubleshooting common setup issues.

## 🚀 Quick Start (3 Steps)

### 1. Initialize Environment File
```bash
cp .env.example .env
```

### 2. Configure Kaggle API Token
The Kaggle API token is **required** to download the Wordle datasets.
1. Go to [Kaggle Settings](https://www.kaggle.com/settings/account).
2. Click **"Create New Token"** in the API section.
3. Open the downloaded `kaggle.json` and copy the token to your `.env`:
   ```bash
   KAGGLE_API_TOKEN=your_actual_token_here
   ```

### 3. Launch Services
```bash
docker compose up
```
The dashboard will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔧 Environment Variables Reference

### Database Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | *(empty)* | Connection string. Defaults to SQLite if empty. |
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `wordle` | PostgreSQL database name |

### Application Settings
| Variable | Default | Description |
|----------|---------|-------------|
| `ENV` | `development` | `development`, `staging`, or `production` |
| `DEBUG` | `true` | Enable verbose logging and SQL echos |
| `API_PORT` | `8000` | Port for the FastAPI backend |
| `FRONTEND_URL` | `http://localhost:3000` | URL for the React frontend |

### Data Pipeline Settings
| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_DIR` | `./data` | Root directory for all data files |
| `ETL_BATCH_SIZE` | `1000` | Number of rows per bulk insertion |
| `NLTK_DATA_PATH` | `./data/nltk_data` | Directory for NLTK corpuses |

---

## ✅ Verification & Troubleshooting

### Check Status
```bash
# Verify Docker configuration
docker compose config

# Test API Health
curl http://localhost:8000/api/v1/health
```

### Common Issues
| Issue | Solution |
|-------|----------|
| **Kaggle Download Failed** | Verify token in `.env` and ensure you've accepted dataset terms on Kaggle.com. |
| **Port Already in Use** | Change `API_PORT` in `.env` or stop services on port 8000/5432. |
| **Database Connection** | Wait 15s for DB initialization; check logs: `docker compose logs db`. |
| **HMR not working** | Ensure `usePolling: true` is set in `vite.config.ts` (default in this project). |

---

## 🔒 Security Best Practices
- **Never commit `.env`** to version control (added to `.gitignore`).
- Generate a secure `SECRET_KEY` for production: `openssl rand -hex 32`.
- Keep `.env.example` generic for other developers.
