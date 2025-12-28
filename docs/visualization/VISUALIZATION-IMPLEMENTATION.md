# Visualization Implementation Details

This document details the technical implementation of the visualization features (1.3, 1.4, 1.9).

## Architecture Overview

The visualization stack follows a standard Single Page Application (SPA) pattern:
- **Frontend**: React 19 + TypeScript + Recharts. Data is fetched via React Query (TanStack Query) from the FastAPI backend.
- **Backend**: FastAPI endpoints serving JSON data derived from PostgreSQL views/queries.
- **Data Layer**: Pre-calculated metrics stored in `words`, `distributions`, and `tweet_sentiments` tables.

---

## 1. Word Difficulty Analysis (Feature 1.3)

**Goal**: Visualize the relationship between word rarity/complexity and player performance.

### Frontend (`DifficultyPage.tsx`)
- **Scatter Plot**: "Word Frequency vs Performance".
    - X-Axis: `frequency_score` (0.0 - 1.0, calculated heuristic).
    - Y-Axis: `avg_guesses` (Global average guess count).
    - Insight: Shows if rare words actually result in more guesses.
- **Line Chart**: "Difficulty Score Timeline".
    - Dual Axis: `avg_guesses` (Left) vs `difficulty_rating` (Right).
    - Shows trends over time.

### Backend API
- **Endpoint**: `GET /api/v1/words/stats/difficulty`
- **Response**: List of data points containing `date`, `avg_guesses`, `difficulty_rating`, `frequency_score`.

### Data Logic (ETL)
- **Frequency Score**: Calculated in `transform.py` using a heuristic based on vowel count and common letters (mock logic for MVP).
- **Difficulty Rating**: Composite score (1-10) derived from average guesses and frequency penalty.

---

## 2. Guess Distribution Analysis (Feature 1.4)

**Goal**: Analyze how the global player base distributes their guesses (1-6 tries).

### Frontend (`DistributionPage.tsx`)
- **Bar Chart**: "Global Guess Distribution".
    - Aggregated sum of all games. Shows the "bell curve" of Wordle guesses.
- **Composed Chart**: "Distribution Trends".
    - Stacked Bars (Ratio of 1-6 guesses) + Line (Average Guesses).
    - Visualizes how the community improves or struggles over time.

### Backend API
- **Endpoint**: `GET /api/v1/distributions`
- **Parameters**: `limit` (default 30 days).
- **Response**: List of distribution objects (`guess_1`...`guess_6`, `failed`, `avg_guesses`).

---

## 3. Sentiment Analysis (Feature 1.9)

**Goal**: Track public sentiment and frustration from Twitter data.

### Frontend (`SentimentPage.tsx`)
- **Composed Chart**: "Sentiment & Frustration Timeline".
    - Bar: `frustration_index` (Proportion of negative tweets).
    - Line: `avg_sentiment` (VADER compound score).
- **Scatter Plot**: "Frustration vs Difficulty".
    - Correlates hard puzzles (High Avg Guesses) with high frustration indices.

### Backend API
- **Endpoint**: `GET /api/v1/analytics/sentiment`
- **Response**: Linked data joining `TweetSentiment` and `Word` tables to provide performance context alongside sentiment metrics.

### Data Logic (ETL)
- **Sentiment Scoring**: Uses NLTK's VADER sentiment analyzer in `transform.py`.
- **Frustration Index**: Percentage of tweets with compound score < -0.2 (configurable env var `FRUSTRATION_THRESHOLD`).

---

## Testing & Validation
- **Frontend**: Verified via manual inspection of charts at `localhost:3000`.
- **Backend**: API endpoints validated via `curl` and Swagger UI.
- **Data**: Database counts verified after ETL run (300+ records per table).
