# Outlier & Viral Day Detection (Feature 1.7)

## Overview
This feature analyzes the Wordle tweet volume and sentiment to identify unusual days in Wordle history. It detects viral moments, controversial puzzles, and quiet days using statistical methods (Z-scores).

## Technical Implementation

### ETL Pipeline
- **Transformation**: `backend.etl.transform.transform_outlier_data`
- **Method**: 
    1. Merge aggregate tweet volume and sentiment data.
    2. Calculate Z-scores for daily tweet volume against the historical mean.
    3. Flag days deviating by > 2.0 standard deviations.
- **Classification**:
    - `viral_frustration`: High Volume (Z > 2.0) + Negative Sentiment (< -0.05)
    - `viral_fun`: High Volume (Z > 2.0) + Positive Sentiment (> 0.2)
    - `quiet_day`: Low Volume (Z < -2.0)
    - `sentiment_negative`: Extremely negative sentiment (< -0.3)

### Database
- **Table**: `outliers`
- **Schema**:
    - `word_id`: Foreign Key to Word
    - `outlier_type`: Classification string
    - `z_score`: Volume standard deviation
    - `actual_value`: The metric value (volume or sentiment) causing the outlier
    - `context`: Auto-generated description

### API
- `GET /api/v1/outliers`: List all outliers with filtering support.
- `GET /api/v1/outliers/{date}`: Get detailed context for a specific day.
