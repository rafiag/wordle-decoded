import { useMemo } from 'react';
import { ProcessedDay, DifficultyLabel } from '../../../types';

export interface DailyChartDataItem {
    [key: string]: any;
    date: string;
    '1/6': number;
    '2/6': number;
    '3/6': number;
    '4/6': number;
    '5/6': number;
    '6/6': number;
    'Failed': number;
    difficultyLabel: DifficultyLabel;
    word_solution: string;
}

/**
 * Filters and formats distribution data for daily chart (last 90 days).
 * Supports filtering by difficulty level.
 */
export function useDailyChartData(
    processedData: ProcessedDay[] | null,
    dailyFilter: 'Overall' | DifficultyLabel
): DailyChartDataItem[] {
    return useMemo<DailyChartDataItem[]>(() => {
        if (!processedData || processedData.length === 0) return [];

        // Filter last 90 days relative to the latest data point
        const lastDate = new Date(processedData[processedData.length - 1].date);
        const cutoff = new Date(lastDate);
        cutoff.setDate(cutoff.getDate() - 90);

        const recent = processedData.filter((d: ProcessedDay) => new Date(d.date) >= cutoff);

        // Filter by toggle
        const filtered = dailyFilter === 'Overall'
            ? recent
            : recent.filter((d: ProcessedDay) => d.difficultyLabel === dailyFilter);

        return filtered.map((d: ProcessedDay) => ({
            date: d.date,
            '1/6': d.guess_1,
            '2/6': d.guess_2,
            '3/6': d.guess_3,
            '4/6': d.guess_4,
            '5/6': d.guess_5,
            '6/6': d.guess_6,
            'Failed': d.failed,
            difficultyLabel: d.difficultyLabel,
            word_solution: d.word_solution
        }));
    }, [processedData, dailyFilter]);
}
