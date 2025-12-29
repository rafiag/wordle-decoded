import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import SectionHeader from '../components/shared/SectionHeader';
import ContentCard from '../components/shared/ContentCard';
import FilterGroup from '../components/shared/FilterGroup';
import { statsApi } from '../services/api';
import { chartColors } from '../theme/colors';

interface DifficultyPoint {
    date: string;
    difficulty: number;
    avg_guesses: number;
    frequency: number;
}

/**
 * Difficulty section with timeline and scatter plot charts.
 */
export default function DifficultySection() {
    const [filter, setFilter] = useState('All');

    const { data: stats, isLoading } = useQuery({
        queryKey: ['difficultyStats'],
        queryFn: statsApi.getDifficultyStats,
    });

    // Filter data based on difficulty level
    const filteredStats = useMemo(() => {
        if (!stats || filter === 'All') return stats;

        return stats.filter((point: DifficultyPoint) => {
            if (filter === 'Easy') return point.difficulty <= 3;
            if (filter === 'Medium') return point.difficulty > 3 && point.difficulty <= 6;
            if (filter === 'Hard') return point.difficulty > 6;
            return true;
        });
    }, [stats, filter]);

    return (
        <section id="difficulty" className="section">
            <div className="container">
                <SectionHeader
                    badge="🎯 Analysis"
                    title="Word Difficulty Analysis"
                    description="Explore how word rarity correlates with player performance"
                />

                <ContentCard
                    header="Difficulty Timeline"
                    filterButtons={
                        <FilterGroup
                            options={['All', 'Easy', 'Medium', 'Hard']}
                            value={filter}
                            onChange={setFilter}
                        />
                    }
                >
                    {isLoading ? (
                        <div className="chart-placeholder">
                            <div className="placeholder-content">
                                <span className="placeholder-icon">📈</span>
                                <p>Loading difficulty timeline...</p>
                            </div>
                        </div>
                    ) : (
                        <figure>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={filteredStats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" hide />
                                        <YAxis yAxisId="left" orientation="left" domain={[3, 6]} />
                                        <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="avg_guesses"
                                            stroke={chartColors.primary}
                                            dot={false}
                                            name="Avg Guesses"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="difficulty"
                                            stroke={chartColors.secondary}
                                            dot={false}
                                            name="Difficulty Rating"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <figcaption className="sr-only">
                                Line chart showing puzzle difficulty and average guesses over time.
                                Difficulty ranges from 1-10, average guesses from 3-6.
                            </figcaption>
                        </figure>
                    )}
                    <div className="insight-callout">
                        <span className="insight-icon">💡</span>
                        <span>Harder words (higher difficulty) correlate with more guesses — but some rare words are still easy to solve!</span>
                    </div>
                </ContentCard>

                <ContentCard
                    header="Rarity vs Performance"
                    tooltip="ℹ️"
                >
                    {isLoading ? (
                        <div className="chart-placeholder chart-placeholder-scatter">
                            <div className="placeholder-content">
                                <span className="placeholder-icon">🎯</span>
                                <p>Loading scatter plot...</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid />
                                    <XAxis type="number" dataKey="frequency" name="Frequency Score" />
                                    <YAxis type="number" dataKey="avg_guesses" name="Avg Guesses" domain={[3, 6]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter
                                        name="Words"
                                        data={filteredStats}
                                        fill={chartColors.tertiary}
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </ContentCard>
            </div>
        </section>
    );
}
