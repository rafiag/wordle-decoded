# Database & Data Pipeline Overview

## Overview
This feature establishes the core data foundation for the Wordle Exploration project. It handles the retrieval, cleaning, and structured storage of Wordle game performance and social sentiment data.

### Value Proposition
- **Structured Access**: Transitions raw, messy Kaggle CSVs into a queryable relational database.
- **Enriched Metadata**: Derives missing puzzle dates and calculates daily sentiment metrics (Frustration Index).
- **Idempotent Processing**: Allows for repeated ETL runs without data duplication.

## Setup and Quick Start

### Prerequisites
- Python 3.8+
- SQLite3
- Kaggle API key (configured in `.env`)

### Ingestion Workflow
To download the raw data and populate the database:

1. **Download Data**:
   ```bash
   python download_kaggle_data.py
   ```
2. **Run ETL Pipeline**:
   ```bash
   python scripts/run_etl.py
   ```

### Verification
You can verify the data ingestion using the CLI or by inspecting `data/wordle.db` directly.
```python
from backend.db.database import SessionLocal
from backend.db.schema import Word
db = SessionLocal()
print(f"Total Words Processed: {db.query(Word).count()}")
db.close()
```
