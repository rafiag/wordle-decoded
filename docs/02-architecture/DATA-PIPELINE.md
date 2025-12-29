# Data & Database Architecture

This document describes the design and implementation of the data pipeline and database schema.

## 1. Pipeline Overview
The system follows a decoupled ETL (Extract, Transform, Load) pattern to transition raw, messy Kaggle CSVs into a queryable relational database.

**Ingestion Workflow:**
```text
[Kaggle CSVs] ---> [extract.py] ---> [transform.py (NLP/Stats)] ---> [load.py] ---> [Database]
```

### Components
- **Extraction (`extract.py`)**: Fetches local raw CSVs from `data/raw/` and validates required columns.
- **Transformation (`transform.py`)**: 
  - Generates dates from Game IDs starting from #1 (2021-06-19).
  - Cleans sentiment text by stripping emojis and URLs.
  - Scores sentiment using NLTK's VADER engine.
- **Loading (`load.py`)**: Uses bulk insertion mappings for efficiency and ensures idempotency by clearing existing records for the batch being processed.

---

## 2. Database Schema

### Table: `words` (Core Catalog)
Matches Wordle puzzle IDs to answers and performance metrics.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | **Primary Key**. Maps to Wordle Game Number. |
| `word` | String | The 5-letter target answer. |
| `date` | String | ISO-8601 Date (`YYYY-MM-DD`). |
| `avg_guess_count` | Float | Calculated mean of successful guesses. |
| `success_rate` | Float | Proportion of wins vs. failures. |

### Table: `distributions` (Performance Breakdown)
| Column | Type | Description |
| :--- | :--- | :--- |
| `word_id` | Integer | FK to `words.id`. |
| `guess_1` .. `guess_6`| Integer | Counts for each guess bucket. |
| `failed` | Integer | Total failing attempts in sample. |

### Table: `tweet_sentiment` (Sentiment Features)
| Column | Type | Description |
| :--- | :--- | :--- |
| `date` | String | ISO-8601 Date. |
| `avg_sentiment` | Float | VADER compound score (-1 to 1). |
| `frustration_index` | Float | % of tweets with sentiment < -0.1. |

---

## 3. Operations & Maintenance

### Running the Pipeline
Users can run the full pipeline or specific modules:
```bash
# Run all ETL tasks
docker compose exec backend python scripts/run_etl.py --all

# Run only specific stages (e.g., Traps or Outliers)
docker compose exec backend python scripts/run_etl.py --traps
docker compose exec backend python scripts/run_etl.py --outliers
```

### Known Discrepancies
- **Sentiment Gap**: A known gap of ~14 games exists where tweet data is missing relative to the word catalog.
- **NLP Performance**: Sentiment processing for 1.5M+ rows takes ~2-5 minutes in a single-threaded environment.

---

## 4. Source Data Attribution
1. **Kaggle Wordle Games**: `scarcalvetsis/wordle-games`
2. **Kaggle Wordle Tweets**: `benhamner/wordle-tweets`
3. **NLTK Corpus**: Used for word frequency and sentiment analysis.
