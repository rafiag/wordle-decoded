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
} from 'recharts';
import { statsApi } from '../services/api';

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
        const data = payload[0].payload;
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

const TableRow = memo(({ item, idx }: any) => (
    <tr className="border-b border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <td className="p-3 text-[var(--accent-cyan)] font-mono">#{idx + 1}</td>
        <td className="p-3 font-bold">{item.word}</td>
        <td className="p-3 text-right text-[var(--text-secondary)] font-mono text-sm">{item.date}</td>
        <td className="p-3 text-right font-mono" style={{ color: item.difficulty > 5 ? 'var(--accent-coral)' : 'var(--accent-lime)' }}>
            {item.difficulty?.toFixed(1)}
        </td>
        <td className="p-3 text-right font-mono text-[var(--text-secondary)]">
            {(item.success_rate * 100).toFixed(2)}%
        </td>
        <td className="p-3 text-right font-bold" style={{ color: 'var(--accent-coral)' }}>
            {(item.score * 100).toFixed(2)}%
        </td>
        <td className="p-3 text-right text-[var(--text-secondary)]">
            {(item.total_tweets).toLocaleString()}
        </td>
    </tr>
));

export default function BoldSentimentSection() {
    const { data: sentimentData, isLoading } = useQuery({
        queryKey: ['sentimentData'],
        queryFn: statsApi.getSentimentData,
    });

    const [rankingMode, setRankingMode] = useState<'hated' | 'loved'>('hated');

    const sentimentDistribution = useMemo(() => {
        if (!sentimentData?.timeline) return [];
        const data = sentimentData.timeline;
        let very_pos = 0, positive = 0, neutral = 0, negative = 0, very_neg = 0;
        data.forEach((d: any) => {
            very_pos += (d.very_pos_count || 0);
            positive += (d.pos_count || 0);
            neutral += (d.neu_count || 0);
            negative += (d.neg_count || 0);
            very_neg += (d.very_neg_count || 0);
        });
        return [
            { name: 'Very Neg', value: very_neg },
            { name: 'Negative', value: negative },
            { name: 'Neutral', value: neutral },
            { name: 'Positive', value: positive },
            { name: 'Very Pos', value: very_pos },
        ];
    }, [sentimentData]);

    const avgFrustration = useMemo(() => {
        if (!sentimentData?.timeline) return 0;
        const data = sentimentData.timeline;
        const sum = data.reduce((sum: number, d: any) => sum + (d.frustration || 0), 0);
        return ((sum / data.length) * 100).toFixed(2);
    }, [sentimentData]);

    // Format top lists
    const topWords = useMemo(() => {
        if (!sentimentData) return [];
        const source = (rankingMode === 'hated' ? sentimentData.top_hated : sentimentData.top_loved) || [];
        return source.map((d: any) => ({
            word: d.target_word || 'Unknown',
            date: d.date,
            score: d.frustration,
            difficulty: d.difficulty,
            success_rate: d.success_rate,
            total_tweets: d.sample_size || 0
        }));
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Distribution Chart */}
                <div className="card h-80">
                    <h3 className="text-lg font-bold mb-4">Sentiment Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={sentimentDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {sentimentDistribution.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="rgba(0,0,0,0.5)" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Timeline Chart */}
                <div className="card h-80 lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4">Daily Sentiment Trend</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={sentimentData?.timeline || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="very_neg_count" stackId="a" fill={V2_COLORS.very_neg} />
                            <Bar dataKey="neg_count" stackId="a" fill={V2_COLORS.neg} />
                            <Bar dataKey="neu_count" stackId="a" fill={V2_COLORS.neu} />
                            <Bar dataKey="pos_count" stackId="a" fill={V2_COLORS.pos} />
                            <Bar dataKey="very_pos_count" stackId="a" fill={V2_COLORS.very_pos} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Frustration Meter */}
                <div className="card text-center flex flex-col justify-center">
                    <h3 className="text-lg font-bold mb-6">Frustration Index</h3>
                    <div className="text-6xl font-bold font-mono text-[var(--accent-coral)] mb-2">
                        {avgFrustration}%
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                        Percentage of tweets expressing significant annoyance or failure.
                    </p>
                    <div className="mt-8 h-4 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-coral)]"
                            style={{ width: `${avgFrustration}%` }}
                        />
                    </div>
                </div>

                {/* Top Words Table */}
                <div className="card lg:col-span-2 overflow-hidden">
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
                                    <th className="p-2 text-left">#</th>
                                    <th className="p-2 text-left">Word</th>
                                    <th className="p-2 text-right">Date</th>
                                    <th className="p-2 text-right">Diff</th>
                                    <th className="p-2 text-right">Success</th>
                                    <th className="p-2 text-right">Frustration</th>
                                    <th className="p-2 text-right">Tweets</th>
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
