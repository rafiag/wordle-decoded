import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import SectionHeader from '../components/shared/SectionHeader';
import ContentCard from '../components/shared/ContentCard';
import { statsApi } from '../services/api';
import { chartColors, wordleColors } from '../theme/colors';

interface SentimentDataPoint {
    date: string;
    sentiment: number;
    frustration: number;
    avg_guesses: number;
}

const PIE_COLORS = [wordleColors.positive, wordleColors.neutral, wordleColors.negative];

/**
 * Sentiment section with timeline, frustration meter, and sentiment distribution pie chart.
 */
export default function SentimentSection() {
    const { data: sentimentData, isLoading } = useQuery({
        queryKey: ['sentimentData'],
        queryFn: statsApi.getSentimentData,
    });

    // Calculate sentiment distribution from timeline data
    const sentimentDistribution = useMemo(() => {
        if (!sentimentData?.sentiment_correlation) return [];

        const data = sentimentData.sentiment_correlation as SentimentDataPoint[];
        let positive = 0, neutral = 0, negative = 0;

        data.forEach((d: SentimentDataPoint) => {
            if (d.sentiment > 0.1) positive++;
            else if (d.sentiment < -0.1) negative++;
            else neutral++;
        });

        const total = data.length || 1;
        return [
            { name: 'Positive', value: Math.round((positive / total) * 100), count: positive },
            { name: 'Neutral', value: Math.round((neutral / total) * 100), count: neutral },
            { name: 'Negative', value: Math.round((negative / total) * 100), count: negative },
        ];
    }, [sentimentData]);

    // Calculate average frustration from data
    const avgFrustration = useMemo(() => {
        if (!sentimentData?.sentiment_correlation) return 24;
        const data = sentimentData.sentiment_correlation as SentimentDataPoint[];
        const sum = data.reduce((sum: number, d: SentimentDataPoint) => sum + (d.frustration || 0), 0);
        return Math.round((sum / data.length) * 100);
    }, [sentimentData]);

    return (
        <section id="sentiment" className="section section-alt">
            <div className="container">
                <SectionHeader
                    badge="💬 Emotion"
                    title="Player Sentiment Analysis"
                    description="Track player frustration and excitement through tweet sentiment"
                />

                <ContentCard header="Sentiment Timeline">
                    {isLoading ? (
                        <div className="chart-placeholder chart-placeholder-line">
                            <div className="placeholder-content">
                                <span className="placeholder-icon">📈</span>
                                <p>Loading sentiment data...</p>
                            </div>
                        </div>
                    ) : (
                        <figure>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={sentimentData?.sentiment_correlation || []}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" hide />
                                        <YAxis domain={[-1, 1]} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="sentiment"
                                            stroke={chartColors.primary}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <figcaption className="sr-only">
                                Line chart showing player sentiment over time, ranging from -1 (negative) to +1 (positive).
                                Most days show slightly positive sentiment.
                            </figcaption>
                        </figure>
                    )}
                    <div className="insight-callout">
                        <span className="insight-icon">💡</span>
                        <span>Harder words like PARER and FOYER caused the biggest frustration spikes!</span>
                    </div>
                </ContentCard>

                <div className="split-cards">
                    <ContentCard header="Frustration Index">
                        <div className="frustration-meter">
                            <div className="meter-visual">
                                <div className="meter-fill" style={{ width: `${avgFrustration}%` }}></div>
                            </div>
                            <div className="meter-label">{avgFrustration}% of tweets show frustration</div>
                            <div className="meter-description">
                                Percentage of tweets with negative sentiment below threshold
                            </div>
                        </div>
                    </ContentCard>

                    <ContentCard header="Sentiment Distribution">
                        {isLoading ? (
                            <div className="chart-placeholder chart-placeholder-pie">
                                <div className="placeholder-content">
                                    <span className="placeholder-icon">🥧</span>
                                    <p>Loading distribution...</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sentimentDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}%`}
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
                </div>

                <ContentCard header="Most Frustrating Words">
                    <div className="word-sentiment-list">
                        <div className="word-sentiment-item sentiment-negative">
                            <span className="word-sentiment-rank">1</span>
                            <span className="word-sentiment-word">FOYER</span>
                            <div className="word-sentiment-bar">
                                <div className="sentiment-bar-fill" style={{ width: '85%' }}></div>
                            </div>
                            <span className="word-sentiment-score">-0.45</span>
                        </div>
                        <div className="word-sentiment-item sentiment-negative">
                            <span className="word-sentiment-rank">2</span>
                            <span className="word-sentiment-word">SWILL</span>
                            <div className="word-sentiment-bar">
                                <div className="sentiment-bar-fill" style={{ width: '78%' }}></div>
                            </div>
                            <span className="word-sentiment-score">-0.38</span>
                        </div>
                        <div className="word-sentiment-item sentiment-negative">
                            <span className="word-sentiment-rank">3</span>
                            <span className="word-sentiment-word">TATTY</span>
                            <div className="word-sentiment-bar">
                                <div className="sentiment-bar-fill" style={{ width: '72%' }}></div>
                            </div>
                            <span className="word-sentiment-score">-0.32</span>
                        </div>
                    </div>
                </ContentCard>
            </div>
        </section >
    );
}
