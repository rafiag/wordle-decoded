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

---

## 4. NYT Effect Analysis Endpoints (Feature 1.6)

### `GET /nyt/analysis`
Retrieve a comprehensive analysis of the NYT Effect, including summary statistics, statistical test results, and a daily timeline.

**Usage:**
- Full NYT Effect Dashboard (KPIs, Badges, Timeline)

**Parameters:**
*None*

**Expected Response (`200 OK`):**
```json
{
  "summary": {
    "summary": {
      "before": { "avg_guesses": 3.92, "avg_difficulty": 4.5, "total_games": 230 },
      "after": { "avg_guesses": 4.08, "avg_difficulty": 5.2, "total_games": 85 },
      "diff_guesses": 0.16,
      "diff_difficulty": 0.7
    },
    "tests": {
      "t_test_means": { "significant": true, "p_value": 0.015, "interpretation": "Significant diff" }
    }
  },
  "tests": { ... }, // Map of test results
  "timeline": [
    {
      "date": "2021-12-31",
      "word": "REBUS",
      "era": "Pre-NYT",
      "avg_guesses": 3.75,
      "difficulty": 6
    }
  ]
}
```

---

## 5. Pattern Analysis Endpoints (Feature 1.5)

### `GET /patterns/top`
Retrieve the most frequently occurring patterns (e.g., successful start words or common failure patterns).

**Usage:**
- "Most Common Patterns" Leaderboard

**Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | `int` | `10` | Number of patterns to return |

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "pattern": "⬜⬜🟨⬜⬜",
      "count": 15000,
      "success_rate": 0.05,
      "rank": 1
    }
  ],
  "meta": {
    "count": "1"
  }
}
```

---

### `GET /patterns/search`
Retrieve detailed statistics for a specific pattern configuration.

**Usage:**
- Pattern Detail View (Success Rate, Avg Guesses)

**Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `pattern` | `str` | The emoji pattern string (e.g., `🟩🟩⬜⬜🟩`) |

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "pattern": "🟩🟩⬜⬜🟩",
    "count": 450,
    "success_count": 400,
    "success_rate": 0.89,
    "avg_guesses": 3.2,
    "rank": 45
  }
}
```

---

### `GET /patterns/{pattern}/next`
Retrieve the most likely next patterns that follow the given pattern, based on historical transition data.

**Usage:**
- "What happens next?" Flow Visualization
- Transition Probability Map

**Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | `int` | `5` | Number of next steps to return |

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "next_pattern": "🟩🟩🟩🟩🟩",
      "count": 120,
      "probability": 0.45
    },
    {
      "next_pattern": "🟩🟩🟨⬜🟩",
      "count": 80,
      "probability": 0.30
    }
  ]
}
```

---

## 6. Outlier Detection Endpoints (Feature 1.7)

### `GET /outliers/overview`
Retrieve a unified view of outlier data, including a list of top outliers and data for the scatter plot.

**Usage:**
- Outliers Dashboard (List & Scatter Plot)

**Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | `int` | `50` | Number of top outliers to return |

**Expected Response (`200 OK`):**
```json
{
  "plot_data": [
    {
      "date": "2022-01-09",
      "word": "FAVOR",
      "volume": 350000,
      "sentiment": -0.2,
      "outlier_type": "viral_frustration"
    }
  ],
  "top_outliers": [
    {
      "id": 204,
      "date": "2022-01-09",
      "word": "FAVOR",
      "type": "viral_frustration",
      "z_score": 3.42,
      "context": "Unusually high volume..."
    }
  ]
}
```

### `GET /outliers/{date}`
Retrieve detailed outlier analysis for a specific date.

**Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `date` | `str` | Date in `YYYY-MM-DD` format |

---

## 7. Trap Analysis Endpoints (Feature 1.8)

### `GET /traps/top`
Retrieve the words with the highest "Trap Scores" (words with many lookalike neighbors that confuse players).

**Usage:**
- "Deadly Traps" Leaderboard
- Brute Force Analysis

**Parameters:**
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | `int` | `20` | Number of trap words to return |

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": [
    {
      "word": "IGHTS",
      "trap_score": 12.5,
      "neighbor_count": 8,
      "deadly_neighbors": ["LIGHT", "NIGHT", "RIGHT", "SIGHT", "MIGHT"]
    }
  ],
  "meta": {
    "count": 1
  }
}
```

### `GET /traps/{word}`
Retrieve trap analysis for a specific word, listing all its confusion neighbors.

**Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `word` | `str` | The 5-letter target word |

---

## 8. Dashboard Optimization Endpoints (Feature 2.0)

### `GET /dashboard/init`
Retrieve critical initial data for the dashboard in a single request (Hero stats, Main Distribution Chart, and Difficulty Timeline).
Designed to reduce the "Time to Interactive" and number of initial HTTP requests.

**Usage:**
- Initial Page Load ("Above the Fold" content)

**Parameters:**
*None*

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "total_games_tracked": 1500000,
      "avg_daily_players": 4500.5,
      "avg_sentiment": 0.45,
      "viral_events_count": 12
    },
    "distribution": {
      "guess_1": 150, "guess_2": 800, "guess_3": 2500,
      "guess_4": 1200, "guess_5": 400, "guess_6": 100,
      "failed": 50, "total_games": 5200
    },
    "difficulty": [
       { "date": "2022-01-01", "difficulty": 3, "avg_guesses": 3.78, "frequency": 0.8 }
    ]
  }
}
```

---

## 9. Analytics Overview Endpoints

### `GET /analytics/overview`
Retrieve high-level dashboard metrics for the Hero section.

**Usage:**
- Dashboard Headers/Hero
- KPI Cards

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "total_games_tracked": 1500000,
    "avg_daily_players": 4500.5,
    "avg_sentiment": 0.45,
    "viral_events_count": 12
  }
}
```

---

## 10. Aggregate Distribution Endpoints

### `GET /distributions/aggregate`
Retrieve the sum of all guess counts across all time (1-6 and failed).

**Usage:**
- "All-Time Guess Distribution" Bar Chart

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "guess_1": 150,
    "guess_2": 800,
    "guess_3": 2500,
    "guess_4": 1200,
    "guess_5": 400,
    "guess_6": 100,
    "failed": 50,
    "total_games": 5200
  }
}
```

---

## 11. Outlier Highlights Endpoints

### `GET /outliers/highlights`
Retrieve key highlight cards (Highest Volume, Most Frustrating, Easiest Day).

**Usage:**
- "Viral Days" Highlights Section

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "highest_volume": {
      "title": "Highest Volume",
      "word": "FAVOR",
      "date": "2022-01-09",
      "metric": "Tweets",
      "value": 350000,
      "description": "Most discussed Wordle day"
    },
    "most_frustrating": { ... },
    "easiest": { ... }
  }
}
```
