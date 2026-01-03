# Visualization API Reference

This document provides detailed documentation for the API endpoints supporting the visualization features (1.3, 1.4, 1.9).

**Base URL**: `http://localhost:8000/api/v1`

---

## 1. Word Difficulty Endpoints (Feature 1.3)

### `GET /words`
Retrieve a paginated list of words with their difficulty metrics. used for "Hardest Words" tables and general word exploration.

**Parameters:**
| `skip` | `int` | `0` | Number of records to skip (offset) |
| `limit` | `int` | `100` | Number of records to return |
| `sort` | `str` | `"date"` | Field to sort by (`date`, `avg_guess_count`, `difficulty_rating`, `success_rate`) |
| `order` | `str` | `"desc"` | Sort direction (`asc`, `desc`) |

**Note on Sorting:** Sorting by `avg_guess_count` uses a multi-factor logic:
- `order=desc` (Hardest): Sorted by `difficulty_rating` DESC, then `avg_guess_count` DESC, then `success_rate` ASC.
- `order=asc` (Easiest): Sorted by `difficulty_rating` ASC, then `avg_guess_count` ASC, then `success_rate` DESC.

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
      }
    ]
  },
  "meta": {
    "count": "320"
  }
}
```

---

### `GET /words/{word}/details`
Retrieve comprehensive details for a specific word, including sentiment, trap analysis, and outlier status. Used by the Word Explorer.

**Parameters:**
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `word` | `str` | The 5-letter word to retrieve |

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "details": {
      "word": "SWILL",
      "date": "2022-02-19",
      "difficulty_rating": 9,
      "difficulty_label": "Expert",
      "success_rate": 0.82,
      "avg_guess_count": 4.9,
      "tweet_volume": 5200,
      "sentiment_score": -0.15,
      "frustration_index": 0.45,
      "trap_score": 12.5,
      "neighbor_count": 5,
      "deadly_neighbors": ["STILL", "SKILL", "SPILL", "SWILL", "SWELL"],
      "is_outlier": true,
      "outlier_z_score": 2.45
    }
  },
  "meta": {}
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
Retrieve correlation data between tweet sentiment and puzzle performance. Includes 5-bucket sentiment counts, difficulty labels, and success rates.

**Usage:**
- Sentiment Distribution Pie Chart
- Daily Sentiment Volume (Grouped Bar Chart)
- Frustration Index Meter
- Most Frustrating Words Table

**Parameters:**
*None*

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "aggregates": {
      "distribution": [
        {"name": "Very Neg", "value": 500},
        {"name": "Negative", "value": 2000},
        {"name": "Neutral", "value": 8500},
        {"name": "Positive", "value": 15000},
        {"name": "Very Pos", "value": 4000}
      ],
      "avg_frustration": 12.5,
      "frustration_by_difficulty": {
        "Easy": 5.2,
        "Medium": 12.4,
        "Hard": 18.2,
        "Expert": 25.1
      }
    },
    "timeline": [
      {
        "date": "2022-01-01",
        "target_word": "REBUS",
        "frustration": 0.12,
        "difficulty_label": "Medium",
        "very_pos_count": 50,
        "pos_count": 200,
        "neu_count": 350,
        "neg_count": 80,
        "very_neg_count": 20,
        "total_tweets": 700
      }
    ],
    "top_hated": [
       { "date": "2022-01-01", "target_word": "REBUS", "frustration": 0.12, ... }
    ],
    "top_loved": [
       { "date": "2022-01-05", "target_word": "PARTY", "sentiment": 0.8, ... }
    ]
  },
  "meta": {
    "count": "90",
    "note": "Timeline limited to last 90 days. Aggregates and Top Lists are all-time."
  }
}
```

**Field Descriptions:**
| Field | Type | Description |
| :--- | :--- | :--- |
| `date` | `string` | Puzzle date (YYYY-MM-DD) |
| `target_word` | `string` | The solution word for that day |
| `sentiment` | `float` | Average VADER Compound Score (-1.0 to 1.0) |
| `frustration` | `float` | Fraction of tweets with sentiment < **-0.1** |
| `very_pos_count` | `int` | Tweets with sentiment ≥ 0.5 |
| `pos_count` | `int` | Tweets with sentiment 0.05 to 0.5 |
| `neu_count` | `int` | Tweets with sentiment -0.05 to 0.05 |
| `neg_count` | `int` | Tweets with sentiment -0.5 to -0.05 |
| `very_neg_count` | `int` | Tweets with sentiment < -0.5 |
| `avg_guesses` | `float` | Average guesses for that puzzle |
| `difficulty` | `int` | Difficulty rating (1-10) |
| `difficulty_label` | `string` | Human-readable label: Easy (1-3), Medium (4-6), Hard (7-8), Expert (9-10) |
| `success_rate` | `float` | Fraction of players who solved the puzzle |

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

## 8. Dashboard Optimization Endpoints
Currently optimized via selective lazy loading and the `at-a-glance` endpoint.

---

## 9. Analytics Overview Endpoints

### `GET /dashboard/at-a-glance`
Retrieve 6 key metrics for the landing page hero section. Uses the `global_stats` table for O(1) performance.

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "hardest_word": {
      "word": "MUMMY",
      "date": "2022-05-04",
      "avg_guesses": 4.99,
      "success_rate": 80.2,
      "difficulty": 10
    },
    "easiest_word": {
      "word": "TRAIN",
      "date": "2022-03-24",
      "avg_guesses": 3.26,
      "success_rate": 99.3,
      "difficulty": 2
    },
    "most_viral": {
      "word": "LIGHT",
      "date": "2022-01-30",
      "tweet_volume": 31988,
      "percent_increase": 119
    },
    "avg_guesses": 4.06,
    "success_rate": 96.5,
    "nyt_effect": {
      "delta": 0.14,
      "direction": "increase"
    },
    "community_mood": {
      "avg_sentiment": 0.05,
      "positive_pct": 92.4,
      "mood_label": "Mixed"
    }
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

---

## 12. At a Glance Endpoints

### `GET /dashboard/at-a-glance`
Retrieve 6 key metrics for the landing page hero section (Hardest Word, Easiest Word, Most Viral Moment, Avg Guesses, NYT Effect, and Community Mood).

**Usage:**
- Landing Page Hero Section
- Quick Summary KPI Cards

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "hardest_word": {
      "word": "MUMMY",
      "difficulty": 10.0,
      "success_rate": 80.2,
      "avg_guesses": 4.99,
      "date": "2022-05-04"
    },
    "easiest_word": {
      "word": "TRAIN",
      "difficulty": 2.1,
      "success_rate": 99.3,
      "avg_guesses": 3.26,
      "date": "2022-03-24"
    },
    "most_viral": {
      "date": "2022-01-30",
      "word": "LIGHT",
      "tweet_volume": 31988,
      "percent_increase": 119
    },
    "avg_guesses": 4.06,
    "nyt_effect": {
      "delta": 0.14,
      "direction": "increase"
    },
    "community_mood": {
      "avg_sentiment": 0.05,
      "positive_pct": 92.4,
      "mood_label": "Mixed"
    }
  }
}
```
