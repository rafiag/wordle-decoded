# Trap Pattern Analysis (Feature 1.8)

## Overview
"Traps" are words that are difficult not because they are obscure, but because they have many similar "neighbors" (words differing by only one letter). This feature identifies these trap words to help explain why players fail on seemingly simple words.

## Data Requirements

### Wordle Guess List
- **File**: `data/raw/wordle_guesses.txt`
- **Source**: Official Wordle allowed guess list (combined solutions + valid guesses)
- **Format**: Plain text, one word per line, 5 letters each
- **Size**: ~13,000 words
- **Purpose**: Identifies ALL possible neighbor words (not just historical answers)

**Setup Instructions:**
1. Obtain the official Wordle word list from the game's source code or a trusted repository
2. Place the file at `data/raw/wordle_guesses.txt`
3. Ensure one word per line, all uppercase
4. Run ETL: `docker compose exec backend python scripts/run_etl.py --traps`

## Technical Implementation

### ETL Pipeline
- **Transformation**: `backend.etl.transform.transform_trap_data`
- **Algorithm** (Optimized Masking Dictionary):
    1. Extract all unique 5-letter target words from the dataset (~320 historical answers)
    2. Load extended guess list (~13k words) for comprehensive neighbor detection
    3. Build masking dictionary: For each word, generate 5 masks (e.g., "_IGHT", "L_GHT", ...)
    4. Identify neighbors via mask lookup (O(N*L) instead of O(N²))
    5. Calculate **Trap Score**: `Sum(frequency_score(neighbor))`
       - Highlights words with MANY COMMON neighbors
       - Common neighbors = players likely to waste guesses on them

### Database
- **Table**: `trap_analysis`
- **Schema**:
    - `word_id`: Foreign Key to Word
    - `trap_score`: Sum of neighbor frequency scores
    - `neighbor_count`: Number of 1-letter distinct neighbors
    - `deadly_neighbors`: JSON list of the neighbor words (e.g., "_IGHT" family)

### API
- `GET /api/v1/traps/top`: Returns words with the highest Trap Scores (default limit=20, max=100)
- `GET /api/v1/traps/{word}`: Detailed analysis for a specific word, including its neighbors
