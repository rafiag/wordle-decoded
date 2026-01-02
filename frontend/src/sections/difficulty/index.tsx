import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../../services/api';
import type { DifficultyStat, DistributionStat, DifficultyLabel, WordRanking } from '../../types';
import { useProcessedDifficultyData } from './hooks/useProcessedDifficultyData';
import { useAggregateData } from './hooks/useAggregateData';
import { useDailyChartData } from './hooks/useDailyChartData';
import { useStreakData } from './hooks/useStreakData';
import { AggregateDistributionChart } from './components/AggregateDistributionChart';
import { DailyDistributionChart } from './components/DailyDistributionChart';
import { StreakChart } from './components/StreakChart';
import { TopWordsTable } from './components/TopWordsTable';

export default function BoldDifficultySection() {
    // Fetch Data
    const { data: difficultyStats, isLoading: statsLoading } = useQuery<DifficultyStat[]>({
        queryKey: ['difficultyStats'],
        queryFn: statsApi.getDifficultyStats,
    });

    const { data: distributions, isLoading: distLoading } = useQuery<DistributionStat[]>({
        queryKey: ['distributions', 2000],
        queryFn: () => statsApi.getDistributions(2000),
    });

    const { data: topHardest } = useQuery<WordRanking[]>({
        queryKey: ['hardestWords'],
        queryFn: () => statsApi.getHardestWords(10),
    });

    const { data: topEasiest } = useQuery<WordRanking[]>({
        queryKey: ['easiestWords'],
        queryFn: () => statsApi.getEasiestWords(10),
    });

    // State
    const [dailyFilter, setDailyFilter] = useState<'Overall' | DifficultyLabel>('Overall');
    const [rankingMode, setRankingMode] = useState<'easiest' | 'hardest'>('hardest');

    // Process Data with Custom Hooks
    const processedData = useProcessedDifficultyData(difficultyStats, distributions);
    const aggregateData = useAggregateData(processedData);
    const dailyChartData = useDailyChartData(processedData, dailyFilter);
    const { streakChartData, maxEasyStreak, maxHardStreak } = useStreakData(processedData);

    // Top Words Data
    const topWords = rankingMode === 'hardest' ? (topHardest || []) : (topEasiest || []);

    if (statsLoading || distLoading) {
        return <div className="p-8 text-center text-[var(--text-secondary)]">Loading difficulty data...</div>;
    }

    return (
        <section id="difficulty" className="mb-20 pt-10">
            <div className="section-header">
                <h2 className="section-title">Difficulty & Distribution</h2>
                <p className="section-description">
                    Analyze how difficulty affects guess distribution and global performance.
                </p>
            </div>

            {/* Row 1: Charts (1/3 and 2/3 split) */}
            <div className="grid-3-col mb-8">
                <AggregateDistributionChart data={aggregateData} />
                <DailyDistributionChart
                    data={dailyChartData}
                    dailyFilter={dailyFilter}
                    onFilterChange={setDailyFilter}
                />
            </div>

            {/* Row 2: Streak Chart (Full width) */}
            <StreakChart
                data={streakChartData}
                maxEasyStreak={maxEasyStreak}
                maxHardStreak={maxHardStreak}
            />

            {/* Row 3: Top Words Table (Full width) */}
            <TopWordsTable
                words={topWords}
                rankingMode={rankingMode}
                onRankingModeChange={setRankingMode}
            />
        </section>
    );
}
