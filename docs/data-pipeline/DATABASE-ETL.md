# DATABASE-ETL: Database & Pipeline Technical Specification

## 1. System Architecture
The foundation of the Wordle Exploration project is a structured data lake converted into a relational SQLite database. The system follows a decoupled ETL (Extract, Transform, Load) pattern to allow for independent scaling or replacement of modules.

### Component Diagram
```text
[Kaggle CSVs] ---> [extract.py] ---> [transform.py (NLP/Stats)] ---> [load.py] ---> [SQLite DB]
```

---

## 2. Database Schema Definition

The database is built using **SQLAlchemy ORM** with a `String` date strategy for cross-dialect compatibility.

### Table: `words` (Core Catalog)
Matches Wordle puzzle IDs to their corresponding answers and high-level performance metrics.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | **Primary Key**. Maps to Wordle Game Number. |
| `word` | String | The 5-letter target answer. |
| `date` | String | ISO-8601 Date (`YYYY-MM-DD`). |
| `avg_guess_count` | Float | Calculated mean of successful guesses. |
| `success_rate` | Float | Proportion of wins vs. failures. |

### Table: `distributions` (Performance Breakdown)
Granular distribution of daily user scores.
| Column | Type | Description |
| :--- | :--- | :--- |
| `word_id` | Integer | FK to `words.id`. |
| `guess_1` .. `guess_6`| Integer | Counts for each guess bucket. |
| `failed` | Integer | Total failing attempts in sample. |

### Table: `tweet_sentiment` (Sentiment Features)
Calculated daily metrics using the sentiment analysis engine.
| Column | Type | Description |
| :--- | :--- | :--- |
| `date` | String | ISO-8601 Date. |
| `avg_sentiment` | Float | VADER compound score (-1 to 1). |
| `frustration_index` | Float | % of tweets with sentiment < -0.2. |

---

## 3. Data Ingestion Pipeline

### Extraction (`extract.py`)
- **Sources**: Local raw CSVs located in `data/raw/game_data/` and `data/raw/tweet_data/`.
- **Validation**: Checks for existence of critical columns (`Game`, `Trial`, `tweet_text`) before processing.

### Transformation (`transform.py`)
- **Date Derivation**: Maps integer `Game` IDs to literal dates starting from **Wordle #1 (2021-06-19)**.
- **Sentiment Cleaning**:
  - Drops Wordle grid emojis (⬛⬜🟨🟩) using regex.
  - Strips URLs and Wordle X/6 status lines to leave only user commentary.
  - Uses `NLTK.sentiment.vader` for polarity scoring.
- **Aggregation**: Computes weighted averages for trial counts.

### Loading (`load.py`)
- **Strategy**: Uses `db.bulk_insert_mappings()` for speed and stability.
- **Idempotency**: Performs a targeted `DELETE` of existing IDs in a batch before re-inserting to ensure standard pipeline runs do not create duplicate records.

---

## 4. API & Query Patterns
- **Linguistic Difficulty**: Query `words` and `tweet_sentiment` joined by date.
- **Pattern Match**: For future pattern analysis, the `Distribution` table provides the success probability baseline.

---

## 5. Known Limitations & Optimizations

### Data Completeness
- **Sentiment Data Gap**: There is a known gap of ~14 games where tweet sentiment data is missing compared to the words catalog (320 words vs 306 sentiment records). This is due to date range discrepancies in the source Kaggle datasets. Queries joining `words` and `tweet_sentiment` should use `LEFT JOIN` to handle missing dates gracefully.

### ETL Performance
- **Single-Threaded NLP**: The sentiment analysis runs sequentially (single process). Processing the full 1.5M+ tweet dataset takes ~2-5 minutes. For Phase 2 Scaling, moving to `multiprocessing` is recommended to reduce this time.
- **Memory Usage**: The current pipeline loads the entire `transformed_tweets` dataframe into memory before bulk loading. For datasets >10M rows, a chunked generator approach would be required.
