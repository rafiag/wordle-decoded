import { useMemo } from 'react';

export interface SentimentDistributionItem {
    [key: string]: any;
    name: string;
    value: number;
    total: number;
}

/**
 * Processes sentiment distribution data, ensuring proper ordering
 * from Very Neg to Very Pos.
 */
export function useSentimentDistribution(
    aggregates: { distribution?: { name: string; value: number }[] } | undefined
): SentimentDistributionItem[] {
    return useMemo(() => {
        if (!aggregates?.distribution) return [];

        const distMap = new Map<string, number>(
            aggregates.distribution.map((d: { name: string; value: number }) => [d.name, d.value])
        );

        const total = (distMap.get('Very Neg') || 0) +
            (distMap.get('Negative') || 0) +
            (distMap.get('Neutral') || 0) +
            (distMap.get('Positive') || 0) +
            (distMap.get('Very Pos') || 0);

        // Return strictly ordered array
        return [
            { name: 'Very Neg', value: distMap.get('Very Neg') || 0, total },
            { name: 'Negative', value: distMap.get('Negative') || 0, total },
            { name: 'Neutral', value: distMap.get('Neutral') || 0, total },
            { name: 'Positive', value: distMap.get('Positive') || 0, total },
            { name: 'Very Pos', value: distMap.get('Very Pos') || 0, total },
        ];
    }, [aggregates]);
}
