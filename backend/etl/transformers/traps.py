"""
Trap word analysis module.

Identifies 'trap' words with many neighbors (Hamming distance 1).
"""

import pandas as pd
import logging
import time
import json
from typing import Optional, List
from collections import defaultdict

from .shared import calculate_frequency_score

# Configure logger
logger = logging.getLogger(__name__)


def transform_trap_data(games_df: pd.DataFrame, guess_list: Optional[List[str]] = None) -> pd.DataFrame:
    """
    Analyzes all words to find 'Traps' - words with many neighbors (Hamming distance 1).
    Optimized with Masking Dictionary approach O(N*L) instead of O(N^2).
    """
    logger.info("Transforming trap data (Enhanced)...")
    start_time = time.time()

    unique_words_df = games_df[['Game', 'target', 'frequency_score']].drop_duplicates()
    target_words = unique_words_df['target'].dropna().astype(str).str.upper().unique()

    # define candidate pool: Official Guesses + Historical Answers
    candidate_pool = set(target_words)
    if guess_list:
        # Filter for 5-letter words just in case
        valid_guesses = {g.upper() for g in guess_list if len(g) == 5}
        candidate_pool.update(valid_guesses)
        logger.info(f"Using expanded candidate pool of {len(candidate_pool)} words.")
    else:
        logger.info(f"Using historical targets only ({len(candidate_pool)} words).")

    # 1. Build Mask Dictionary
    # Map "_IGHT" -> ["LIGHT", "NIGHT", "RIGHT", ...]
    mask_to_words = defaultdict(list)

    for word in candidate_pool:
        for i in range(5):
            mask = word[:i] + "_" + word[i+1:]
            mask_to_words[mask].append(word)

    results = []

    for _, row in unique_words_df.iterrows():
        target = str(row['target']).upper()
        if len(target) != 5: continue

        neighbors = set()

        # 2. Find Neighbors using Masks
        for i in range(5):
            mask = target[:i] + "_" + target[i+1:]
            candidates = mask_to_words.get(mask, [])
            for candidate in candidates:
                if candidate != target:
                    neighbors.add(candidate)

        neighbor_list = sorted(list(neighbors))
        neighbor_count = len(neighbor_list)

        # 3. Trap Score: Sum of Neighbor Frequencies
        # This highlights words with MANY COMMON neighbors (which are the real traps).
        # We calculate frequency on the fly for neighbors since they might be from the raw list.
        neighbor_freq_sum = sum(calculate_frequency_score(n) for n in neighbor_list)

        # We can also weigh by the inverse of the target frequency (rare words with common neighbors are worse?)
        # But 'Sum of Neighbor Frequence' is a strong enough signal on its own.
        # Let's add a small multiplier if the target itself is rare, but keep it simple.
        trap_score = neighbor_freq_sum

        # Only store if it has neighbors
        if neighbor_count > 0:
            results.append({
                'word_id': row['Game'],
                'trap_score': trap_score,
                'neighbor_count': neighbor_count,
                'deadly_neighbors': json.dumps(neighbor_list)
            })

    duration = time.time() - start_time
    logger.info(f"Identified {len(results)} potential trap words in {duration:.2f} seconds.")
    return pd.DataFrame(results)
