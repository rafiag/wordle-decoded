import { useMemo } from 'react';
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
import SectionHeader from '../components/shared/SectionHeader';
import ContentCard from '../components/shared/ContentCard';
import { statsApi } from '../services/api';
import { wordleColors } from '../theme/colors';

interface SentimentDataPoint {
    date: string;
    target_word?: string; // Added from backend
    sentiment: number;
    frustration: number;
    very_pos_count: number;
    pos_count: number;
    neu_count: number;
    neg_count: number;
    very_neg_count: number;
    avg_guesses: number;
    difficulty?: number; // Added from backend
    difficulty_label?: string; // Added from backend
    success_rate?: number; // Added from backend
}

// 5-Bucket Palette
const BUCKET_COLORS = {
    very_neg: '#d32f2f', // Dark Red
    neg: '#ef5350',      // Red
    neu: wordleColors.gray,
    pos: wordleColors.green,
    very_pos: wordleColors.greenDark,
};

const PIE_COLORS = [
    BUCKET_COLORS.very_pos,
    BUCKET_COLORS.pos,
    BUCKET_COLORS.neu,
    BUCKET_COLORS.neg,
    BUCKET_COLORS.very_neg
];

/**
 * Custom Tooltip for the Grouped Bar Chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as SentimentDataPoint;
        const total = (data.very_pos_count || 0) + (data.pos_count || 0) + (data.neu_count || 0) + (data.neg_count || 0) + (data.very_neg_count || 0);

        return (
            <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                <p className="label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
                {data.target_word && (
                    <p className="target-word" style={{ color: wordleColors.greenDark, fontWeight: 'bold' }}>
                        Solution: {data.target_word}
                    </p>
                )}
                <p className="intro" style={{ fontSize: '0.9em', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px' }}>
                    Total Tweets: {total.toLocaleString()}
                </p>
                <div className="breakdown" style={{ fontSize: '0.85em' }}>
                    <div style={{ color: BUCKET_COLORS.very_pos }}>Very Pos: {data.very_pos_count}</div>
                    <div style={{ color: BUCKET_COLORS.pos }}>Positive: {data.pos_count}</div>
                    <div style={{ color: BUCKET_COLORS.neu }}>Neutral: {data.neu_count}</div>
                    <div style={{ color: BUCKET_COLORS.neg }}>Negative: {data.neg_count}</div>
                    <div style={{ color: BUCKET_COLORS.very_neg }}>Very Neg: {data.very_neg_count}</div>
                </div>
            </div>
        );
    }
    return null;
};

/**
 * Sentiment section with grouped bar chart, frustration meter, and sentiment distribution pie chart.
 */
export default function SentimentSection() {
    const { data: sentimentData, isLoading } = useQuery({
        queryKey: ['sentimentData'],
        queryFn: statsApi.getSentimentData,
    });

    // Calculate sentiment distribution from timeline data (Absolute Counts)
    const sentimentDistribution = useMemo(() => {
        if (!sentimentData?.sentiment_correlation) return [];

        const data = sentimentData.sentiment_correlation as SentimentDataPoint[];
        let very_pos = 0, positive = 0, neutral = 0, negative = 0, very_neg = 0;

        data.forEach((d: SentimentDataPoint) => {
            very_pos += (d.very_pos_count || 0);
            positive += (d.pos_count || 0);
            neutral += (d.neu_count || 0);
            negative += (d.neg_count || 0);
            very_neg += (d.very_neg_count || 0);
        });

        // Recharts Pie calculates percent automatically from values
        return [
            { name: 'Very Pos', value: very_pos },
            { name: 'Positive', value: positive },
            { name: 'Neutral', value: neutral },
            { name: 'Negative', value: negative },
            { name: 'Very Neg', value: very_neg },
        ];
    }, [sentimentData]);

    // Calculate average frustration from data
    const avgFrustration = useMemo(() => {
        if (!sentimentData?.sentiment_correlation) return 24;
        const data = sentimentData.sentiment_correlation as SentimentDataPoint[];
        const sum = data.reduce((sum: number, d: SentimentDataPoint) => sum + (d.frustration || 0), 0);
        return Math.round((sum / data.length) * 100);
    }, [sentimentData]);

    // Helper for difficulty color
    const getDifficultyColor = (label?: string) => {
        switch (label) {
            case 'Easy': return wordleColors.green;
            case 'Medium': return wordleColors.yellow;
            case 'Hard': return wordleColors.negative; // Red
            case 'Expert': return '#990000'; // Dark Red
            default: return '#666';
        }
    };

    // Calculate Top 5 Frustrating Words dynamically
    const topFrustratedWords = useMemo(() => {
        if (!sentimentData?.sentiment_correlation) return [];
        const data = sentimentData.sentiment_correlation as SentimentDataPoint[];

        // Sort by frustration index descending (highest first)
        // Filter out days with very low sample size to avoid noise? (Optional, skipping for transparency)
        return [...data]
            .sort((a, b) => (b.frustration || 0) - (a.frustration || 0))
            .slice(0, 5)
            .map(d => ({
                word: d.target_word || 'Unknown',
                date: d.date,
                score: d.frustration,
                sentiment: d.sentiment,
                difficulty: d.difficulty,
                difficulty_label: d.difficulty_label,
                success_rate: d.success_rate,
                total_tweets: (d.very_pos_count || 0) + (d.pos_count || 0) + (d.neu_count || 0) + (d.neg_count || 0) + (d.very_neg_count || 0)
            }));
    }, [sentimentData]);

    return (
        <section id="sentiment" className="section section-alt">
            <div className="container">
                <SectionHeader
                    badge="💬 Emotion"
                    title="Player Sentiment Analysis"
                    description="Track player frustration and excitement through grouped sentiment buckets"
                />

                {/* Row 1: Distribution & Volume */}
                <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '35% 65%', gap: '20px', marginBottom: '20px' }}>

                    <ContentCard header="Sentiment Distribution">
                        {isLoading ? (
                            <div className="chart-placeholder chart-placeholder-pie">
                                <div className="placeholder-content">
                                    <span className="placeholder-icon">🥧</span>
                                    <p>Loading distribution...</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '300px' }}>
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
                                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        >
                                            {sentimentDistribution.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </ContentCard>

                    <ContentCard header="Daily Sentiment Volume by Category">
                        {isLoading ? (
                            <div className="chart-placeholder chart-placeholder-line">
                                <div className="placeholder-content">
                                    <span className="placeholder-icon">📊</span>
                                    <p>Loading sentiment data...</p>
                                </div>
                            </div>
                        ) : (
                            <figure>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={sentimentData?.sentiment_correlation || []}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="date" hide />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="very_neg_count" name="Very Negative" stackId="a" fill={BUCKET_COLORS.very_neg} />
                                            <Bar dataKey="neg_count" name="Negative" stackId="a" fill={BUCKET_COLORS.neg} />
                                            <Bar dataKey="neu_count" name="Neutral" stackId="a" fill={BUCKET_COLORS.neu} />
                                            <Bar dataKey="pos_count" name="Positive" stackId="a" fill={BUCKET_COLORS.pos} />
                                            <Bar dataKey="very_pos_count" name="Very Positive" stackId="a" fill={BUCKET_COLORS.very_pos} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <figcaption className="sr-only">
                                    Stacked bar chart showing daily tweet counts broken down by 5 sentiment categories.
                                </figcaption>
                            </figure>
                        )}
                        <div className="insight-callout" style={{ marginTop: '10px' }}>
                            <span className="insight-icon">💡</span>
                            <span>"Very Negative" spikes (Dark Red) often correlate with trap words or hard mode failures!</span>
                        </div>
                    </ContentCard>
                </div>

                {/* Row 2: Frustration Meter & Top Table */}
                <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                    <ContentCard header="Frustration Index">
                        <div className="frustration-meter" style={{ textAlign: 'center', padding: '20px' }}>
                            <div className="meter-label" style={{ fontSize: '3rem', fontWeight: 'bold', color: wordleColors.negative }}>
                                {avgFrustration}%
                            </div>
                            <div className="meter-description" style={{ fontSize: '1.2em', marginBottom: '10px' }}>
                                Average Frustration Level
                            </div>
                            <div className="meter-visual" style={{ width: '100%', height: '20px', background: '#eee', borderRadius: '10px', overflow: 'hidden', margin: '15px 0' }}>
                                <div className="meter-fill" style={{ width: `${avgFrustration}%`, height: '100%', background: `linear-gradient(90deg, ${wordleColors.green}, ${wordleColors.negative})` }}></div>
                            </div>
                            <div className="meter-subtext" style={{ fontSize: '0.9em', color: '#666', marginTop: '15px', lineHeight: '1.4' }}>
                                <strong>Calculation Note:</strong> Represents the percentage of tweets with a sentiment score below <strong>-0.1</strong>. High values indicate widespread player annoyance.
                            </div>
                        </div>
                    </ContentCard>

                    <ContentCard header="Most Frustrating Words (Top 5)">
                        <div className="table-responsive">
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Rank</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Word</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Date</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Difficulty</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Success Rate</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Frustration Idx</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Total Tweets</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topFrustratedWords.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>
                                                <span className="rank-badge" style={{
                                                    background: idx === 0 ? wordleColors.negative : '#eee',
                                                    color: idx === 0 ? '#fff' : '#333',
                                                    padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9em'
                                                }}>#{idx + 1}</span>
                                            </td>
                                            <td style={{ padding: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>{item.word}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', color: '#666' }}>{item.date}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                {item.difficulty ? (
                                                    <span style={{
                                                        color: getDifficultyColor(item.difficulty_label),
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {item.difficulty.toFixed(1)}
                                                        {item.difficulty_label && <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>({item.difficulty_label})</span>}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                {item.success_rate ? `${(item.success_rate * 100).toFixed(1)}%` : '-'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: wordleColors.negative }}>
                                                {(item.score * 100).toFixed(1)}%
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>{item.total_tweets.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {topFrustratedWords.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </ContentCard>
                </div>
            </div>
        </section >
    );
}
