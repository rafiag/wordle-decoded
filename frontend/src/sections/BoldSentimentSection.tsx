import { useMemo, useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LegendPayload,
} from 'recharts';
import { statsApi } from '../services/api';
import { SentimentResponse, SentimentTimelinePoint } from '../types';

// V2 Theme Colors
const V2_COLORS = {
    very_neg: '#ff6b9d', // Coral
    neg: '#ffa500',      // Orange
    neu: '#666666',      // Muted
    pos: '#00ff88',      // Lime
    very_pos: '#00d9ff'  // Cyan
};

const PIE_COLORS = [
    V2_COLORS.very_neg,
    V2_COLORS.neg,
    V2_COLORS.neu,
    V2_COLORS.pos,
    V2_COLORS.very_pos
];

// Dark Theme Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as SentimentTimelinePoint;
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded shadow-lg">
                <p className="font-bold text-[var(--text-primary)] mb-1">{label}</p>
                {data.target_word && (
                    <p className="text-[var(--accent-cyan)] font-mono text-sm mb-2">
                        Solution: {data.target_word}
                    </p>
                )}
                <div className="text-xs space-y-1">
                    <div style={{ color: V2_COLORS.very_pos }}>Very Pos: {data.very_pos_count}</div>
                    <div style={{ color: V2_COLORS.pos }}>Positive: {data.pos_count}</div>
                    <div style={{ color: V2_COLORS.neu }}>Neutral: {data.neu_count}</div>
                    <div style={{ color: V2_COLORS.neg }}>Negative: {data.neg_count}</div>
                    <div style={{ color: V2_COLORS.very_neg }}>Very Neg: {data.very_neg_count}</div>
                </div>
            </div>
        );
    }
    return null;
};

const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        // Percentage calculation: (value / total) * 100
        // We expect 'total' to be injected into the data object
        const percentage = data.total ? ((data.value / data.total) * 100).toFixed(2) : '0.00';

        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded shadow-lg">
                <p className="font-bold text-[var(--text-primary)] mb-1">{data.name}</p>
                <div className="text-sm space-y-1">
                    <div className="text-[var(--text-secondary)]">
                        Count: <span className="text-[var(--text-primary)] font-mono ml-1">{data.value.toLocaleString()}</span>
                    </div>
                    <div className="text-[var(--text-secondary)]">
                        Proportion: <span className="text-[var(--accent-cyan)] font-mono ml-1">{percentage}%</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const TableRow = memo(({ item, idx }: any) => (
    <tr className="border-b border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <td className="p-3 text-[var(--accent-cyan)] font-mono">#{idx + 1}</td>
        <td className="p-3 font-bold">{item.target_word || item.word}</td>
        <td className="p-3 text-right text-[var(--text-secondary)] font-mono text-sm">{item.date}</td>
        <td className="p-3 text-right font-mono" style={{ color: item.difficulty > 5 ? 'var(--accent-coral)' : 'var(--accent-lime)' }}>
            {item.difficulty?.toFixed(1)}
        </td>
        <td className="p-3 text-right font-mono text-[var(--text-secondary)]">
            {(item.success_rate * 100).toFixed(2)}%
        </td>
        <td className="p-3 text-right font-bold" style={{ color: 'var(--accent-coral)' }}>
            {(item.frustration * 100).toFixed(2)}%
        </td>
        <td className="p-3 text-right font-bold" style={{ color: 'var(--accent-lime)' }}>
            {(item.sentiment).toFixed(2)}
        </td>
        <td className="p-3 text-right text-[var(--text-secondary)]">
            {(item.total_tweets).toLocaleString()}
        </td>
    </tr>
));

export default function BoldSentimentSection() {
    const { data: sentimentData, isLoading } = useQuery<SentimentResponse>({
        queryKey: ['sentimentData'],
        queryFn: statsApi.getSentimentData,
    });

    const [rankingMode, setRankingMode] = useState<'hated' | 'loved'>('hated');

    // Use pre-calculated aggregates from backend but FORCE proper order
    const sentimentDistribution = useMemo(() => {
        if (!sentimentData?.aggregates?.distribution) return [];

        // Convert to map for easy lookup
        const distMap = new Map<string, number>(sentimentData.aggregates.distribution.map((d: { name: string; value: number }) => [d.name, d.value]));

        // Calculate total for percentages
        const total = (distMap.get('Very Neg') || 0) +
            (distMap.get('Negative') || 0) +
            (distMap.get('Neutral') || 0) +
            (distMap.get('Positive') || 0) +
            (distMap.get('Very Pos') || 0);

        // Return strictly ordered array: Very Neg -> Negative -> Neutral -> Positive -> Very Pos
        return [
            { name: 'Very Neg', value: distMap.get('Very Neg') || 0, total },
            { name: 'Negative', value: distMap.get('Negative') || 0, total },
            { name: 'Neutral', value: distMap.get('Neutral') || 0, total },
            { name: 'Positive', value: distMap.get('Positive') || 0, total },
            { name: 'Very Pos', value: distMap.get('Very Pos') || 0, total },
        ];
    }, [sentimentData]);

    const avgFrustration = sentimentData?.aggregates?.avg_frustration || 0;
    const frustrationBreakdown = sentimentData?.aggregates?.frustration_by_difficulty || { Easy: 0, Medium: 0, Hard: 0 };

    // Format top lists
    const topWords = useMemo(() => {
        if (!sentimentData) return [];
        return rankingMode === 'hated' ? sentimentData.top_hated : sentimentData.top_loved;
    }, [sentimentData, rankingMode]);

    if (isLoading) return <div className="py-20 text-center text-[var(--text-secondary)]">Loading sentiment data...</div>;

    return (
        <section id="sentiment" className="mb-20 pt-10">
            <div className="section-header">
                <div className="section-eyebrow" style={{ color: 'var(--accent-lime)' }}>Feature 4</div>
                <h2 className="section-title">Sentiment Analysis</h2>
                <p className="section-description">
                    Community frustration vs. excitement over time.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
                {/* Distribution Chart */}
                <div className="card h-96">
                    <h3 className="text-lg font-bold mb-4">Sentiment Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={sentimentDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {sentimentDistribution.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="rgba(0,0,0,0.5)" />
                                ))}
                            </Pie>
                            <Tooltip content={<PieTooltip />} />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px', paddingBottom: '20px' }}
                                formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>{value}</span>}
                                itemSorter={(item: any) => {
                                    const order: { [key: string]: number } = {
                                        'Very Neg': 0, 'Negative': 1, 'Neutral': 2, 'Positive': 3, 'Very Pos': 4
                                    };
                                    return order[item.value] ?? 999;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Timeline Chart */}
                <div className="card h-96 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold">Daily Sentiment Trend</h3>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">Showing last 90 days of activity</p>
                        </div>
                    </div>

                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sentimentData?.timeline || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} vertical={false} />
                                <XAxis dataKey="date" hide />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    iconType="square"
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>{value}</span>}
                                    itemSorter={(item: LegendPayload) => {
                                        const key = String(item.dataKey || '');
                                        const order: { [key: string]: number } = {
                                            'very_neg_count': 0, 'neg_count': 1, 'neu_count': 2, 'pos_count': 3, 'very_pos_count': 4
                                        };
                                        return order[key] ?? 999;
                                    }}
                                />
                                {/* Ordered from Very Neg to Very Pos */}
                                <Bar name="Very Neg" dataKey="very_neg_count" stackId="a" fill={V2_COLORS.very_neg} />
                                <Bar name="Negative" dataKey="neg_count" stackId="a" fill={V2_COLORS.neg} />
                                <Bar name="Neutral" dataKey="neu_count" stackId="a" fill={V2_COLORS.neu} />
                                <Bar name="Positive" dataKey="pos_count" stackId="a" fill={V2_COLORS.pos} />
                                <Bar name="Very Pos" dataKey="very_pos_count" stackId="a" fill={V2_COLORS.very_pos} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 p-3 bg-[rgba(255,255,255,0.03)] rounded flex gap-3 text-sm text-[var(--text-secondary)] border border-[var(--border-color)]">
                        <span className="text-lg">💡</span>
                        <span>
                            "Very Negative" spikes <span style={{ color: V2_COLORS.very_neg }}>(Pink)</span> often correlate with trap words or hard mode failures!
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                {/* Frustration Meter */}
                <div className="card text-center flex flex-col justify-center py-8">
                    <h3 className="text-lg font-bold mb-8">Frustration Index</h3>
                    <div className="text-6xl font-bold font-mono text-[var(--accent-coral)]">
                        {avgFrustration}%
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto mb-[10px]">
                        Percentage of tweets expressing significant annoyance or failure.
                    </p>
                    <div className="h-[20px] w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden my-[15px]">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-coral)]"
                            style={{ width: `${avgFrustration}%` }}
                        />
                    </div>

                    <div className="pt-[15px] border-t border-[var(--border-color)]">
                        <p className="text-xs text-[var(--text-secondary)] font-bold mb-[10px] uppercase tracking-wider">Breakdown by Difficulty</p>
                        <div className="flex justify-between px-6">
                            <div>
                                <div className="text-xs text-[var(--text-secondary)] mb-1">Easy</div>
                                <div className="text-xl font-mono font-bold" style={{ color: V2_COLORS.pos }}>{frustrationBreakdown.Easy}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-[var(--text-secondary)] mb-1">Medium</div>
                                <div className="text-xl font-mono font-bold" style={{ color: V2_COLORS.neg }}>{frustrationBreakdown.Medium}%</div>
                            </div>
                            <div>
                                <div className="text-xs text-[var(--text-secondary)] mb-1">Hard</div>
                                <div className="text-xl font-mono font-bold" style={{ color: V2_COLORS.very_neg }}>{frustrationBreakdown.Hard}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Words Table */}
                <div className="card overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">
                            {rankingMode === 'hated' ? 'Most Frustrating Days' : 'Most Loved Days'}
                        </h3>
                        <div className="flex gap-2 bg-[var(--bg-primary)] p-1 rounded-lg">
                            <button
                                onClick={() => setRankingMode('hated')}
                                className={`px-4 py-1 rounded text-sm font-bold transition-all ${rankingMode === 'hated'
                                    ? 'bg-[var(--accent-coral)] text-white'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                            >
                                Hated
                            </button>
                            <button
                                onClick={() => setRankingMode('loved')}
                                className={`px-4 py-1 rounded text-sm font-bold transition-all ${rankingMode === 'loved'
                                    ? 'bg-[var(--accent-lime)] text-black'
                                    : 'text-[var(--text-secondary)] hover:text-white'
                                    }`}
                            >
                                Loved
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                                    <th className="p-3 text-left">#</th>
                                    <th className="p-3 text-left">Word</th>
                                    <th className="p-3 text-right">Date</th>
                                    <th className="p-3 text-right">Difficulty</th>
                                    <th className="p-3 text-right">Success</th>
                                    <th className="p-3 text-right">Frustration</th>
                                    <th className="p-3 text-right">Sentiment</th>
                                    <th className="p-3 text-right">Tweets</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topWords.map((item: any, idx: number) => (
                                    <TableRow key={idx} item={item} idx={idx} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
