import { useMemo } from 'react';
import { ProcessedDay, DifficultyLabel } from '../../../types';

export interface StreakChartDataItem {
    [key: string]: any;
    date: string;
    easyStreak: number | null;
    hardStreak: number | null;
    difficultyLabel: DifficultyLabel;
}

export interface StreakData {
    streakChartData: StreakChartDataItem[];
    maxEasyStreak: number;
    maxHardStreak: number;
}

/**
 * Calculates consecutive Easy/Hard day streaks for the last 90 days.
 */
export function useStreakData(processedData: ProcessedDay[] | null): StreakData {
    return useMemo(() => {
        if (!processedData || processedData.length === 0) {
            return { streakChartData: [], maxEasyStreak: 0, maxHardStreak: 0 };
        }

        // Filter last 90 days
        const lastDate = new Date(processedData[processedData.length - 1].date);
        const cutoff = new Date(lastDate);
        cutoff.setDate(cutoff.getDate() - 90);

        const recent = processedData.filter((d: ProcessedDay) => new Date(d.date) >= cutoff);

        let currentEasy = 0;
        let currentHard = 0;
        let maxEasy = 0;
        let maxHard = 0;

        const data: StreakChartDataItem[] = recent.map((d: ProcessedDay) => {
            const isEasy = d.difficultyLabel === 'Easy';
            const isHard = d.difficultyLabel === 'Hard';

            if (isEasy) {
                currentEasy++;
                currentHard = 0;
            } else if (isHard) {
                currentHard++;
                currentEasy = 0;
            } else {
                currentEasy = 0;
                currentHard = 0;
            }

            maxEasy = Math.max(maxEasy, currentEasy);
            maxHard = Math.max(maxHard, currentHard);

            return {
                date: d.date,
                easyStreak: currentEasy > 0 ? currentEasy : null,
                hardStreak: currentHard > 0 ? currentHard : null,
                difficultyLabel: d.difficultyLabel
            };
        });

        return { streakChartData: data, maxEasyStreak: maxEasy, maxHardStreak: maxHard };
    }, [processedData]);
}
