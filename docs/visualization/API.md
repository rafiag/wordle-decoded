# Visualization API Reference

This document provides detailed documentation for the API endpoints supporting the visualization features (1.3, 1.4, 1.9).

**Base URL**: `http://localhost:8000/api/v1`

---

## 1. Word Difficulty Endpoints (Feature 1.3)

### `GET /words`
Retrieve a paginated list of words with their difficulty metrics. used for "Hardest Words" tables and general word exploration.

**Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `skip` | `int` | `0` | Number of records to skip (offset) |
| `limit` | `int` | `100` | Number of records to return |
| `sort` | `str` | `"date"` | Field to sort by (`date`, `avg_guess_count`, `difficulty_rating`) |
| `order` | `str` | `"desc"` | Sort direction (`asc`, `desc`) |

**Example Request:**
```http
GET /words?limit=5&sort=avg_guess_count&order=desc
```

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "words": [
      {
        "id": 245,
        "word": "SWILL",
        "date": "2022-02-19",
        "frequency_score": 0.4,
        "difficulty_rating": 9,
        "avg_guess_count": 4.9,
        "success_rate": 0.82
      }
    ],
    "total": 320
  },
  "meta": {
    "limit": "5",
    "skip": "0"
  }
}
```

---

### `GET /words/stats/difficulty`
Retrieve aggregated statistics for difficulty visualizations. Optimized for plotting timelines and scatter plots.

**Usage:**
- Difficulty Timeline Chart (Date vs Difficulty)
- Frequency vs Performance Scatter Plot

**Parameters:**
*None*

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "points": [
      {
        "date": "2022-01-01",
        "difficulty": 3,
        "avg_guesses": 3.78,
        "frequency": 0.8
      },
      {
        "date": "2022-01-02",
        "difficulty": 6,
        "avg_guesses": 4.5,
        "frequency": 0.2
      }
    ]
  },
  "meta": {
    "count": "320"
  }
}
```

---

## 2. Guess Distribution Endpoints (Feature 1.4)

### `GET /distributions`
Retrieve daily guess distribution data (counts for 1/6, 2/6, etc.).

**Usage:**
- Global Guess Distribution Bar Chart
- Distribution Trends Chart

**Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | `int` | `365` | Number of days to retrieve (most recent first) |

**Example Request:**
```http
GET /distributions?limit=30
```

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "distributions": [
      {
        "date": "2022-10-15",
        "guess_1": 150,
        "guess_2": 800,
        "guess_3": 2500,
        "guess_4": 1200,
        "guess_5": 400,
        "guess_6": 100,
        "failed": 50,
        "total_tweets": 5200,
        "avg_guesses": 3.45
      }
    ]
  },
  "meta": {
    "count": "30"
  }
}
```

---

## 3. Sentiment Analytics Endpoints (Feature 1.9)

### `GET /analytics/sentiment`
Retrieve correlation data between tweet sentiment and puzzle performance.

**Usage:**
- Sentiment & Frustration Timeline
- Frustration vs Difficulty Scatter Plot

**Parameters:**
*None*

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "sentiment_correlation": [
      {
        "date": "2022-01-01",
        "sentiment": 0.45,       // VADER Compound Score (-1.0 to 1.0)
        "frustration": 0.05,     // % of tweets with sentiment < threshold
        "avg_guesses": 3.78,
        "difficulty": 3
      }
    ]
  },
  "meta": {
    "count": "302"
  }
}
```
