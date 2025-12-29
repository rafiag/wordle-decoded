# Feature Implementation Details

This document provides deep dives into the algorithms and logic behind specific analytical features.

## 1. Outlier & Viral Day Detection (1.7)
The system identifies days with anomalous engagement or sentiment shifts using Z-score statistical analysis.

### Algorithm
- **Baseline**: Calculates mean and standard deviation for tweet volume and sentiment.
- **Z-Score**: Identifies any day where $|Z| > 2.0$.
- **Classifications**:
  - `viral_frustration`: High Volume + Low Sentiment + High Difficulty
  - `viral_fun`: High Volume + High Sentiment
  - `quiet_day`: Significant drop in social volume.

### Visualizations
A scatter plot correlates Volume and Sentiment, highlighting outliers as color-coded points.

---

## 2. Trap Pattern Analysis (1.8)
A "Trap" is a word pattern (e.g., `_IGHT`) where many valid words fit, leading to high failure rates in Hard Mode.

### Algorithm (Masking Dictionary)
- **Masking**: For every word (e.g., `LIGHT`), generates 5 masks (`_IGHT`, `L_GHT`, etc.).
- **Neighborhoods**: Groups words by mask; any group size > 1 is a potential trap.
- **Trap Score**: `Sum(Frequency Score of Neighbors)`. Common words in a neighborhood make a trap deadlier.

### Complexity
- **Current**: $O(N \times L)$ using HashMaps (~1 second for 13k words).
- **Previous approach**: $O(N^2)$ brute force (crashed on large lists).

---

## 3. NYT Effect Analysis (1.6)
Analyzes the impact of the New York Times acquisition on February 10, 2022.

### Statistical Tests
- **Welch's t-test**: Checks for significant shifts in average guess counts.
- **Mann-Whitney U test**: Non-parametric test for distribution changes.
- **Levene's test**: Checks for changes in variance (consistency of puzzle difficulty).

### Logic
Data is tagged as `Pre-NYT` or `Post-NYT` and passed through the SciPy stats engine to determine if perceived difficulty increases were statistically significant or merely anecdotal.

---

## 4. At a Glance Summary (2.1)
The landing page hero section summarizes key metrics from across all analytical features in a high-performance endpoint.

### Components
- **Hardest/Easiest Word**: Identified using `avg_guess_count` and `success_rate` across the entire `Word` table.
- **Most Viral Moment**: Based on peak `actual_value` from the `Outlier` table, identifying the highest-engagement day.
- **Community Mood**: Aggregates `avg_sentiment` and calculates the percentage of positive sentiment tweets.
- **NYT Effect**: Provides the instant delta (+/-) of average guesses before and after the acquisition date.

### Performance Optimization
- **Unified Endpoint**: Reduces initial load time by combining 6 distinct analytical queries into a single JSON response.
- **SQL Aggregations**: Uses SQLAlchemy `func.avg` and `func.max` directly for efficient server-side calculation.
