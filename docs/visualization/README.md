# Visualization Features (Phase 1.2)

This directory documents the implementation of the core analytical visualizations for the Wordle Data Explorer.

## Overview
Phase 1.2 includes three main visualization dashboards:

1.  **Word Difficulty Analysis**: Correlates word rarity and complexity with player performance.
2.  **Guess Distribution**: Analyzes how the global player base guesses over time.
3.  **Sentiment Analysis**: Tracks tweet sentiment and frustration levels associated with specific puzzles.

## Quick Start
To view these visualizations:

1.  **Ensure the backend is running** and data is populated (see [Data Pipeline Docs](../data-pipeline/README.md)).
2.  **Start the frontend**:
    ```bash
    docker compose up frontend
    ```
3.  **Navigate to**:
    - Difficulty: `http://localhost:3000/difficulty`
    - Distribution: `http://localhost:3000/distribution`
    - Sentiment: `http://localhost:3000/sentiment`

## Documentation Structure
- [Implementation Details](VISUALIZATION-IMPLEMENTATION.md): Detailed technical specifications and architecture.
- [API Reference](API.md): Detailed API documentation including parameters and response schemas.

