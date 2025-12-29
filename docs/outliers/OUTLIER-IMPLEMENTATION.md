# Outlier Detection Implementation Guide

## Overview
This document details the implementation of Feature 1.7: Outlier Detection for the Wordle Explorer. The system identifies days with anomalous tweet patterns (Volume, Sentiment) or specific game characteristics (Difficulty).

## Architecture

### 1. Database Schema (`Outlier` table)
- **metrics**: key dimensions for outlier detection.
    - `volume` (Total Tweets)
    - `sentiment` (Average Sentiment)
    - `difficulty` (Average Guesses - *Optional/Correlation*)
- **outlier_type**: classification tag.
    - `viral_frustration`: High Volume + Low Sentiment + High Difficulty
    - `viral_fun`: High Volume + High Sentiment
    - `quiet_day`: Low Volume (Z-Score < -2)
    - `search_spike`: High Volume only (Contextual)

### 2. Detection Logic (`backend.etl.transform`)
The ETL process calculates Z-scores for finding statistical anomalies using historical baselines (moving average).

**Algorithm:**
1.  **Baseline Calculation**: Compute global mean and standard deviation for `total_tweets` and `avg_sentiment`.
    *   *Note*: Day-of-week normalization was considered but abandoned in favor of a simpler global baseline for MVP reliability.
2.  **Z-Score Computation**:
    $$ Z = \frac{X - \mu}{\sigma} $$
3.  **Thresholding**:
    - `|Z| > 2.0`: Flagged as an outlier.
    - Contextual mapping is applied (e.g., Holidays) if data is available.

### 3. API Endpoints
- `GET /api/v1/outliers/overview`: **(New - Unified)** Returns both scatter plot data and top outlier list.
- `GET /api/v1/outliers`: List outliers (paginated, sortable by date).
- `GET /api/v1/outliers/{date}`: Detailed view for a specific date.

### 4. Frontend Visualization
- **Bar Chart**: Top anomalies ranked by Z-Score magnitude.
- **Scatter Plot**: Volume (Y) vs Sentiment (X) to visualize the correlation and highlight outliers.
- **Accessible Palette**:
    - Viral Frustration: Orange (`#ee7733`)
    - Viral Fun: Blue (`#0077bb`)
    - Platform Growth: Light Blue (`#3b82f6`)

## Future Improvements
- **Contextual Awareness**: Integrate real-world events API to explain "Search Spikes" (e.g., "Word 'FEAST' on Thanksgiving").
- **Dynamic Baselines**: Implement sliding window (e.g., 30-day moving average) to account for platform growth over years.
