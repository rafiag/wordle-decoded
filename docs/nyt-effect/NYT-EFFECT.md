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

### `GET /api/v1/nyt/analysis`
Returns the complete analysis including summary statistics, test results, and timeline data.

**Response Structure:**
```json
{
  "summary": {
    "summary": {
      "before": { "avg_guesses": 3.92, ... },
      "after": { "avg_guesses": 4.08, ... },
      "diff_guesses": 0.16,
      "diff_difficulty": 0.7
    },
    "tests": {
      "t_test_means": { "significant": true, ... }
    }
  },
  "tests": { ... },
  "timeline": [
    {
      "date": "2022-01-01",
      "word": "REBUS",
      "era": "Pre-NYT",
      "avg_guesses": 3.75,
      "difficulty": 6
    },
    ...
  ]
}
```

## Dependencies
- **SciPy:** Used for `stats.ttest_ind`, `stats.mannwhitneyu`, and `stats.levene`.
- **Pandas:** Used for efficient data manipulation and aggregation.
