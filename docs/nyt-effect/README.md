# Feature 1.6: The NYT Effect Analysis

## Overview
This feature analyzes the "NYT Effect" — investigating whether Wordle became harder after its acquisition by The New York Times on February 10, 2022. It compares statistical metrics before and after this date to determine if changes in difficulty, guess distribution, and player success rates are significant or merely anecdotal.

## Key Capabilities
- **Before/After Comparison:** Aggregates key metrics (Average Guesses, Difficulty Score) split by the acquisition era.
- **Statistical Significance:** Uses SciPy to run T-tests, Mann-Whitney U tests, and Levene's tests to validate findings.
- **Timeline Visualization:** Provides a time-series view tagged with "Pre-NYT" and "Post-NYT" labels for frontend visualization.

## Technical Components
- **Backend Service:** `NYTService` performs on-the-fly statistical analysis using Pandas and SciPy.
- **API Endpoints:**
  - `GET /api/v1/nyt/summary`: Overall comparison and statistical test results.
  - `GET /api/v1/nyt/timeline`: Daily data points for timeline charts.

## Setup
No additional setup is required beyond the standard project installation.
The analysis relies on the existing `words` and `distributions` data tables.

## Usage
Comparison data can be retrieved via the API:
```bash
curl http://localhost:8000/api/v1/nyt/summary
```
