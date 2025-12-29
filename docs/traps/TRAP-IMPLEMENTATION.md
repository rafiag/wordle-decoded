# Trap Pattern Analysis Implementation Guide

## Overview
This document details the implementation of Feature 1.8: Trap Pattern Analysis. A "Trap" in Wordle is a pattern (e.g., `_IGHT`) where many valid words fit, leading to a forced loss if the user guesses sequentially.

## Architecture

### 1. Database Schema (`TrapAnalysis` table)
- **trap_score**: Float value indicating "deadliness".
- **neighbor_count**: Number of valid words differing by 1 letter.
- **deadly_neighbors**: JSON list of the neighbor words.

### 2. Enhanced Detection Algorithm (`backend.etl.transform`)
We use an optimized **Masking Dictionary** approach to identify neighbors efficiently.

**Complexity**: $O(N \times L)$ where N is word list size (13k) and L is word length (5).
*   *Old Brute Force approach was $O(N^2)$ and crashed.*

**Logic:**
1.  **Mask Generation**: For every word (e.g., `LIGHT`), generate 5 masks: `_IGHT`, `L_GHT`, `LI_HT`, `LIG_T`, `LIGH_`.
2.  **Grouping**: Store words in a hash map keyed by mask.
    - `_IGHT` -> [`LIGHT`, `NIGHT`, `RIGHT`, `FIGHT`, ...]
3.  **Neighbor Identification**: Any list with length > 1 represents a "neighborhood".
4.  **Trap Scoring**:
    - **Formula**: `Sum(Frequency Score of Neighbors)`
    - This weighted score highlights "common" traps. A trap with common words (NIGHT, RIGHT) is deadlier than a trap with obscure words (LAIGH, RAIGH) because players are more likely to guess the common ones.
    *   *Note*: The "1 / Aggregate Frequency" formula was abandoned in favor of this direct summation for better interpretability.

### 3. API Endpoints
- `GET /api/v1/traps/top`: Returns words with highest trap scores.
- `GET /api/v1/traps/{word}`: Lookup specific word's trap status.

### 4. Verification
Tested against the full Wordle guess list (~13,000 words).
- **Processing Time**: < 1.0 second.
- **Results**: Identified ~300 significant trap configurations.
- **Top Trap**: `_IGHT` (light, night, right, fight, sight, tight, might, eight...).

## Limitations
- **Hard Mode**: Analysis assumes standard play. Hard mode (must use revealed hints) makes traps significantly more dangerous, but the *ranking* remains similar.
- **Turn Order**: Does not account for which guess number the player is on (early vs late game traps).
