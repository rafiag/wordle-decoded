# Feature 1.6 Technical Specification

## Architecture
The NYT Effect analysis is a backend-driven feature that aggregates existing game data to perform hypothesis testing.

### Logic Flow
1. **Data Retrieval:** Fetches all `Word` and `Distribution` records from the SQLite database.
2. **Data Alignment:** Merges word difficulty scores with player performance metrics (avg guesses).
3. **Era Tagging:** Splits data into `Pre-NYT` (Before 2022-02-10) and `Post-NYT` (On/After 2022-02-10).
4. **Statistical Analysis:**
   - **Welch's t-test:** Checks for significant difference in mean guess counts.
   - **Mann-Whitney U test:** Checks for differences in the underlying distribution of guesses (non-parametric).
   - **Levene's test:** Checks for changes in variance (consistency).

## API Contract

### `GET /api/v1/nyt/summary`
Returns the comparison summary and statistical test results.

**Response Structure:**
```json
{
  "summary": {
    "before": {
      "avg_guesses": 3.92,
      "avg_difficulty": 4.5,
      "avg_success_rate": 0.98,
      "total_games": 230,
      "variance_guesses": 0.15
    },
    "after": {
      "avg_guesses": 4.08,
      "avg_difficulty": 5.2,
      "avg_success_rate": 0.96,
      "total_games": 85,
      "variance_guesses": 0.22
    },
    "diff_guesses": 0.16,
    "diff_difficulty": 0.7
  },
  "tests": {
    "t_test_means": {
      "test_name": "Welch's t-test",
      "statistic": -2.45,
      "p_value": 0.015,
      "significant": true,
      "interpretation": "Statistically significant difference in average guess count."
    }
    // ... other tests
  }
}
```

### `GET /api/v1/nyt/timeline`
Returns a list of daily data points for visualization.

**Response Structure:**
```json
[
  {
    "date": "2022-01-01",
    "word": "REBUS",
    "era": "Pre-NYT",
    "avg_guesses": 3.75,
    "difficulty": 6
  },
  ...
]
```

## Dependencies
- **SciPy:** Used for `stats.ttest_ind`, `stats.mannwhitneyu`, and `stats.levene`.
- **Pandas:** Used for efficient data manipulation and aggregation.
