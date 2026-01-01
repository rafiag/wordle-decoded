import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../services/api';
import InsightCard from '../components/shared/InsightCard';

/**
 * NYT Effect section for Bold Dashboard (V2).
 * Shows before/after comparison table with insights and real data.
 */
export default function BoldNYTEffectSection() {
    const { data: periodData, isLoading } = useQuery({
        queryKey: ['nytPeriods'],
        queryFn: statsApi.getNYTPeriods,
    });

    const formatChange = (value: number, significant: boolean, metricType: 'bad-up' | 'good-up') => {
        const direction = value >= 0 ? 'up' : 'down';
        const absValue = Math.abs(value).toFixed(1);

        // If not statistically significant, use grey
        if (!significant) {
            return {
                text: `${direction} by ${absValue}%`,
                significant: '',
                colorClass: 'change-neutral'
            };
        }

        // For 'bad-up' metrics (difficulty): up=red, down=green
        // For 'good-up' metrics (success_rate, sentiment, tweets): up=green, down=red
        let colorClass: string;
        if (metricType === 'bad-up') {
            colorClass = value >= 0 ? 'change-negative' : 'change-positive';
        } else {
            colorClass = value >= 0 ? 'change-positive' : 'change-negative';
        }

        return {
            text: `${direction} by ${absValue}%`,
            significant: '✓ statistically significant',
            colorClass
        };
    };

    const formatValue = (value: number, decimals: number = 1) => {
        return value?.toFixed(decimals) || '0.0';
    };

    const formatTweetCount = (value: number) => {
        return `${value?.toFixed(1)}k` || '0.0k';
    };

    // Helper to render metric cells with change info
    const renderMetricCell = (
        value: number,
        changePct: number,
        significant: boolean,
        metricType: 'bad-up' | 'good-up',
        decimals: number = 1,
        suffix: string = ''
    ) => {
        const change = formatChange(changePct, significant, metricType);
        return (
            <td className="metric-value metric-highlight">
                {formatValue(value, decimals)}{suffix}
                <br />
                <span className={`metric-change ${change.colorClass}`}>
                    {change.text}
                    {change.significant && (
                        <>
                            <br />
                            {change.significant}
                        </>
                    )}
                </span>
            </td>
        );
    };

    return (
        <section id="nyt-effect" className="mb-20 pt-10 scroll-mt-20">
            <div className="section-header">
                <h2 className="section-title">The NYT Effect</h2>
                <p className="section-description">
                    How puzzles changed after The New York Times acquisition in February 2022
                </p>
            </div>

            <div className="card">
                {isLoading ? (
                    <div className="chart-placeholder">
                        <span style={{ zIndex: 1 }}>📊 Loading NYT analysis data...</span>
                    </div>
                ) : periodData ? (
                    <>
                        <div className="nyt-table-container">
                            <table className="nyt-metrics-table">
                                <thead>
                                    <tr>
                                        <th>Metrics</th>
                                        <th>
                                            Before
                                            <br />
                                            <span className="table-period">31-Dec to 31-Jan</span>
                                        </th>
                                        <th>
                                            1-month after
                                            <br />
                                            <span className="table-period">1-Feb to 28/29-Feb</span>
                                        </th>
                                        <th>
                                            3-month after
                                            <br />
                                            <span className="table-period">1-Feb to 30-Apr</span>
                                        </th>
                                        <th>
                                            6-month after
                                            <br />
                                            <span className="table-period">1-Feb to 31-Jul</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Success Rate */}
                                    <tr>
                                        <td className="metric-name">Success Rate</td>
                                        <td className="metric-value">
                                            {formatValue(periodData.before?.success_rate)}%
                                        </td>
                                        {renderMetricCell(periodData.one_month?.success_rate, periodData.one_month?.success_rate_change_pct, periodData.one_month?.success_rate_significant, 'good-up', 1, '%')}
                                        {renderMetricCell(periodData.three_month?.success_rate, periodData.three_month?.success_rate_change_pct, periodData.three_month?.success_rate_significant, 'good-up', 1, '%')}
                                        {renderMetricCell(periodData.six_month?.success_rate, periodData.six_month?.success_rate_change_pct, periodData.six_month?.success_rate_significant, 'good-up', 1, '%')}
                                    </tr>

                                    {/* Avg. Difficulty Score */}
                                    <tr>
                                        <td className="metric-name">Avg. Difficulty Score</td>
                                        <td className="metric-value">
                                            {formatValue(periodData.before?.avg_difficulty)}
                                        </td>
                                        {renderMetricCell(periodData.one_month?.avg_difficulty, periodData.one_month?.difficulty_change_pct, periodData.one_month?.difficulty_significant, 'bad-up')}
                                        {renderMetricCell(periodData.three_month?.avg_difficulty, periodData.three_month?.difficulty_change_pct, periodData.three_month?.difficulty_significant, 'bad-up')}
                                        {renderMetricCell(periodData.six_month?.avg_difficulty, periodData.six_month?.difficulty_change_pct, periodData.six_month?.difficulty_significant, 'bad-up')}
                                    </tr>

                                    {/* Avg. Sentiment Score */}
                                    <tr>
                                        <td className="metric-name">Avg. Sentiment Score</td>
                                        <td className="metric-value">
                                            {formatValue(periodData.before?.avg_sentiment, 2)}
                                        </td>
                                        {renderMetricCell(periodData.one_month?.avg_sentiment, periodData.one_month?.sentiment_change_pct, periodData.one_month?.sentiment_significant, 'good-up', 2)}
                                        {renderMetricCell(periodData.three_month?.avg_sentiment, periodData.three_month?.sentiment_change_pct, periodData.three_month?.sentiment_significant, 'good-up', 2)}
                                        {renderMetricCell(periodData.six_month?.avg_sentiment, periodData.six_month?.sentiment_change_pct, periodData.six_month?.sentiment_significant, 'good-up', 2)}
                                    </tr>

                                    {/* Avg. Daily Tweet */}
                                    <tr>
                                        <td className="metric-name">Avg. Daily Tweet</td>
                                        <td className="metric-value">
                                            {formatTweetCount(periodData.before?.avg_daily_tweets)}
                                        </td>
                                        {renderMetricCell(periodData.one_month?.avg_daily_tweets, periodData.one_month?.tweet_change_pct, periodData.one_month?.tweet_significant, 'good-up', 1, 'k')}
                                        {renderMetricCell(periodData.three_month?.avg_daily_tweets, periodData.three_month?.tweet_change_pct, periodData.three_month?.tweet_significant, 'good-up', 1, 'k')}
                                        {renderMetricCell(periodData.six_month?.avg_daily_tweets, periodData.six_month?.tweet_change_pct, periodData.six_month?.tweet_significant, 'good-up', 1, 'k')}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <InsightCard title="Puzzles became significantly harder after NYT acquisition">
                            <p>
                                After the NYT acquisition, difficulty increased steadily from{' '}
                                <strong>{formatValue(periodData.before?.avg_difficulty)}</strong> to{' '}
                                <strong>{formatValue(periodData.six_month?.avg_difficulty)}</strong>
                                {' '}(+{Math.abs(periodData.six_month?.difficulty_change_pct).toFixed(1)}%).
                                Despite this, success rate actually improved from{' '}
                                <strong>{formatValue(periodData.before?.success_rate)}%</strong> to{' '}
                                <strong>{formatValue(periodData.six_month?.success_rate)}%</strong>
                                {' '}(+{Math.abs(periodData.six_month?.success_rate_change_pct).toFixed(1)}%).
                                {periodData.six_month?.difficulty_significant && periodData.six_month?.success_rate_significant && (
                                    <> Both changes were statistically significant (p &lt; 0.05), indicating a deliberate
                                        shift in puzzle curation strategy.</>
                                )}
                            </p>
                        </InsightCard>
                    </>
                ) : (
                    <div className="chart-placeholder">
                        <span style={{ zIndex: 1 }}>⚠️ No data available</span>
                    </div>
                )}
            </div>

            <style>{`
                .nyt-table-container {
                    overflow-x: auto;
                    margin-bottom: 2rem;
                    border-radius: 12px;
                }

                .nyt-metrics-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: 'Inter', sans-serif;
                }

                .nyt-metrics-table th {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                .nyt-metrics-table th:first-child {
                    border-top-left-radius: 8px;
                }

                .nyt-metrics-table th:last-child {
                    border-top-right-radius: 8px;
                }

                .table-period {
                    font-weight: 400;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .nyt-metrics-table td {
                    padding: 1rem;
                    border: 1px solid var(--border-color);
                    font-size: 0.875rem;
                }

                .metric-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .metric-value {
                    text-align: center;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .metric-highlight {
                    background: rgba(0, 217, 255, 0.05);
                }

                .metric-change {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 600;
                    margin-top: 0.25rem;
                    line-height: 1.4;
                }

                .change-positive {
                    color: #00ff88;
                }

                .change-negative {
                    color: #ff6b9d;
                }

                .change-neutral {
                    color: #787c7e;
                }

                @media (max-width: 768px) {
                    .nyt-metrics-table {
                        font-size: 0.75rem;
                    }

                    .nyt-metrics-table th,
                    .nyt-metrics-table td {
                        padding: 0.5rem;
                    }

                    .table-period {
                        font-size: 0.625rem;
                    }

                    .metric-change {
                        font-size: 0.625rem;
                    }
                }
            `}</style>
        </section>
    );
}
