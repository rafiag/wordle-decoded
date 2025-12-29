import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import SectionHeader from '../components/shared/SectionHeader';
import ContentCard from '../components/shared/ContentCard';
import FilterGroup from '../components/shared/FilterGroup';
import { statsApi } from '../services/api';
import { chartColors } from '../theme/colors';

/**
 * Outliers section with volume timeline and highlight cards.
 */
export default function OutliersSection() {
    const [filter, setFilter] = useState('All Time');

    const { data: overview, isLoading } = useQuery({
        queryKey: ['outliersOverview'],
        queryFn: () => statsApi.getOutliersOverview(50),
    });

    const { data: highlights } = useQuery({
        queryKey: ['outlierHighlights'],
        queryFn: statsApi.getOutlierHighlights,
    });

    return (
        <section id="outliers" className="section">
            <div className="container">
                <SectionHeader
                    badge="🚀 Discovery"
                    title="Viral Days & Outliers"
                    description="Discover puzzles that sparked unusual tweet volume or search interest"
                />

                <ContentCard
                    header="Tweet Volume Outliers"
                    filterButtons={
                        <FilterGroup
                            options={['All Time', 'Last 30 Days', 'Last 90 Days']}
                            value={filter}
                            onChange={setFilter}
                        />
                    }
                >
                    {isLoading ? (
                        <div className="chart-placeholder">
                            <div className="placeholder-content">
                                <span className="placeholder-icon">🚀</span>
                                <p>Loading outlier data...</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" dataKey="volume" name="Tweet Volume" />
                                    <YAxis type="number" dataKey="sentiment" name="Sentiment" domain={[-1, 1]} />
                                    <Tooltip
                                        content={({ payload }) => {
                                            if (payload && payload.length > 0) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-2 border rounded shadow">
                                                        <p className="font-bold">{data.word}</p>
                                                        <p>Date: {data.date}</p>
                                                        <p>Volume: {data.volume?.toLocaleString()}</p>
                                                        <p>Sentiment: {data.sentiment?.toFixed(2)}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Scatter
                                        name="Outliers"
                                        data={overview?.plot_data || []}
                                        fill={chartColors.secondary}
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </ContentCard>

                <div className="outlier-cards">
                    <div className="outlier-card outlier-high">
                        <div className="outlier-badge">🔥 Highest Volume</div>
                        <div className="outlier-word">{highlights?.highest_volume?.word || 'SWILL'}</div>
                        <div className="outlier-date">
                            {highlights?.highest_volume?.date || 'Puzzle #329 • May 14, 2022'}
                        </div>
                        <div className="outlier-stats">
                            <span>📊 {highlights?.highest_volume?.value?.toLocaleString() || '45,230'} tweets</span>
                            <span>🔍 Search spike: +280%</span>
                        </div>
                    </div>

                    <div className="outlier-card outlier-hard">
                        <div className="outlier-badge">😤 Most Frustrating</div>
                        <div className="outlier-word">{highlights?.most_frustrating?.word || 'FOYER'}</div>
                        <div className="outlier-date">
                            {highlights?.most_frustrating?.date || 'Puzzle #298 • Apr 13, 2022'}
                        </div>
                        <div className="outlier-stats">
                            <span>😡 Sentiment: {highlights?.most_frustrating?.value || '-0.45'}</span>
                            <span>🔍 "Hint" searches: +190%</span>
                        </div>
                    </div>

                    <div className="outlier-card outlier-easy">
                        <div className="outlier-badge">✨ Easiest</div>
                        <div className="outlier-word">{highlights?.easiest?.word || 'SKILL'}</div>
                        <div className="outlier-date">
                            {highlights?.easiest?.date || 'Puzzle #367 • Jun 21, 2022'}
                        </div>
                        <div className="outlier-stats">
                            <span>✅ Success: 98.7%</span>
                            <span>🎯 Avg guesses: 3.1</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
