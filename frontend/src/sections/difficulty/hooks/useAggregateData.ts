import { useMemo } from 'react';
import { ProcessedDay, DifficultyLabel } from '../../../types';

interface AggregateBucket {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    fail: number;
    total: number;
}

export interface AggregateChartData {
    name: string;
    '1/6': number;
    '2/6': number;
    '3/6': number;
    '4/6': number;
    '5/6': number;
    '6/6': number;
    'Failed': number;
    'pct_1/6': string;
    'pct_2/6': string;
    'pct_3/6': string;
    'pct_4/6': string;
    'pct_5/6': string;
    'pct_6/6': string;
    'pct_Failed': string;
}

const LEGEND_ORDER = ['1/6', '2/6', '3/6', '4/6', '5/6', '6/6', 'Failed'];

/**
 * Aggregates guess distribution data by difficulty level.
 * Returns data formatted for horizontal stacked bar chart.
 */
export function useAggregateData(processedData: ProcessedDay[] | null): AggregateChartData[] {
    return useMemo<AggregateChartData[]>(() => {
        if (!processedData) return [];

        const buckets: { [key in 'Overall' | DifficultyLabel]: AggregateBucket } = {
            Overall: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
            Easy: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
            Medium: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
            Hard: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
            Expert: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
            Unknown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
        };

        processedData.forEach((day: ProcessedDay) => {
            const addStats = (bucket: AggregateBucket) => {
                bucket[1] += day.guess_1;
                bucket[2] += day.guess_2;
                bucket[3] += day.guess_3;
                bucket[4] += day.guess_4;
                bucket[5] += day.guess_5;
                bucket[6] += day.guess_6;
                bucket.fail += day.failed;
                bucket.total += (day.guess_1 + day.guess_2 + day.guess_3 + day.guess_4 + day.guess_5 + day.guess_6 + day.failed);
            };

            addStats(buckets.Overall);
            if (day.difficultyLabel === 'Easy') addStats(buckets.Easy);
            else if (day.difficultyLabel === 'Medium') addStats(buckets.Medium);
            else if (day.difficultyLabel === 'Hard') addStats(buckets.Hard);
            else if (day.difficultyLabel === 'Expert') addStats(buckets.Expert);
            else addStats(buckets.Unknown);
        });

        const categories: ('Overall' | DifficultyLabel)[] = ['Overall', 'Easy', 'Medium', 'Hard', 'Expert'];

        const result: AggregateChartData[] = categories.map(cat => {
            const bucket = buckets[cat];

            const row: Record<string, string | number> = { name: cat };
            LEGEND_ORDER.forEach(key => {
                const numKey = key === 'Failed' ? 'fail' : parseInt(key.split('/')[0]) as 1 | 2 | 3 | 4 | 5 | 6;
                const count = key === 'Failed' ? bucket.fail : bucket[numKey];
                row[key] = count;

                const pct = bucket.total > 0 ? (count / bucket.total * 100) : 0;
                row[`pct_${key}`] = pct > 10 ? `${pct.toFixed(0)}%` : '';
            });

            return row as unknown as AggregateChartData;
        });

        return result;
    }, [processedData]);
}
