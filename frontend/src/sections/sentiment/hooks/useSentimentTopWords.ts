import { useMemo } from 'react';
import { SentimentTopWord } from '../../../types';

/**
 * Selects top words based on ranking mode (hated vs loved).
 */
export function useSentimentTopWords(
    topHated: SentimentTopWord[] | undefined,
    topLoved: SentimentTopWord[] | undefined,
    rankingMode: 'hated' | 'loved'
): SentimentTopWord[] {
    return useMemo(() => {
        if (rankingMode === 'hated') return topHated || [];
        return topLoved || [];
    }, [topHated, topLoved, rankingMode]);
}
