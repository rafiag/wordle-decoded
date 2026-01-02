import { useMemo } from 'react';
import type { DifficultyLabel, DifficultyStat, DistributionStat, ProcessedDay } from '../../../types';

/**
 * Processes raw difficulty and distribution data by joining on date
 * and calculating difficulty labels.
 */
export function useProcessedDifficultyData(
    difficultyStats: DifficultyStat[] | undefined,
    distributions: DistributionStat[] | undefined
): ProcessedDay[] | null {
    return useMemo<ProcessedDay[] | null>(() => {
        if (!difficultyStats || !distributions) return null;

        // Create a map of date -> difficulty
        const difficultyMap = new Map<string, number>();
        difficultyStats.forEach((p: DifficultyStat) => {
            difficultyMap.set(p.date, p.difficulty);
        });

        // Join data
        const joined = distributions.map((d: DistributionStat) => {
            const diff = difficultyMap.get(d.date);
            let difficultyLabel: DifficultyLabel = 'Unknown';
            if (diff !== undefined) {
                if (diff <= 3) difficultyLabel = 'Easy';
                else if (diff <= 6) difficultyLabel = 'Medium';
                else if (diff > 6) difficultyLabel = 'Hard';
            }

            return {
                ...d,
                difficulty: diff || 0,
                difficultyLabel
            };
        });

        // Sort by date ascending
        const sortedByDate = [...joined].sort((a: ProcessedDay, b: ProcessedDay) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        return sortedByDate;
    }, [difficultyStats, distributions]);
}
