import { NYTPeriods } from '../../../types';
import { formatValue, formatTweetCount } from '../utils/formatters';
import { MetricCell } from './MetricCell';

interface NYTMetricsTableProps {
    periodData: NYTPeriods;
}

export function NYTMetricsTable({ periodData }: NYTMetricsTableProps) {
    return (
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
                        <MetricCell
                            value={periodData.one_month?.success_rate}
                            changePct={periodData.one_month?.success_rate_change_pct}
                            significant={periodData.one_month?.success_rate_significant}
                            metricType="good-up"
                            decimals={1}
                            suffix="%"
                        />
                        <MetricCell
                            value={periodData.three_month?.success_rate}
                            changePct={periodData.three_month?.success_rate_change_pct}
                            significant={periodData.three_month?.success_rate_significant}
                            metricType="good-up"
                            decimals={1}
                            suffix="%"
                        />
                        <MetricCell
                            value={periodData.six_month?.success_rate}
                            changePct={periodData.six_month?.success_rate_change_pct}
                            significant={periodData.six_month?.success_rate_significant}
                            metricType="good-up"
                            decimals={1}
                            suffix="%"
                        />
                    </tr>

                    {/* Avg. Difficulty Score */}
                    <tr>
                        <td className="metric-name">Avg. Difficulty Score</td>
                        <td className="metric-value">
                            {formatValue(periodData.before?.avg_difficulty)}
                        </td>
                        <MetricCell
                            value={periodData.one_month?.avg_difficulty}
                            changePct={periodData.one_month?.difficulty_change_pct}
                            significant={periodData.one_month?.difficulty_significant}
                            metricType="bad-up"
                        />
                        <MetricCell
                            value={periodData.three_month?.avg_difficulty}
                            changePct={periodData.three_month?.difficulty_change_pct}
                            significant={periodData.three_month?.difficulty_significant}
                            metricType="bad-up"
                        />
                        <MetricCell
                            value={periodData.six_month?.avg_difficulty}
                            changePct={periodData.six_month?.difficulty_change_pct}
                            significant={periodData.six_month?.difficulty_significant}
                            metricType="bad-up"
                        />
                    </tr>

                    {/* Avg. Sentiment Score */}
                    <tr>
                        <td className="metric-name">Avg. Sentiment Score</td>
                        <td className="metric-value">
                            {formatValue(periodData.before?.avg_sentiment, 2)}
                        </td>
                        <MetricCell
                            value={periodData.one_month?.avg_sentiment}
                            changePct={periodData.one_month?.sentiment_change_pct}
                            significant={periodData.one_month?.sentiment_significant}
                            metricType="good-up"
                            decimals={2}
                        />
                        <MetricCell
                            value={periodData.three_month?.avg_sentiment}
                            changePct={periodData.three_month?.sentiment_change_pct}
                            significant={periodData.three_month?.sentiment_significant}
                            metricType="good-up"
                            decimals={2}
                        />
                        <MetricCell
                            value={periodData.six_month?.avg_sentiment}
                            changePct={periodData.six_month?.sentiment_change_pct}
                            significant={periodData.six_month?.sentiment_significant}
                            metricType="good-up"
                            decimals={2}
                        />
                    </tr>

                    {/* Avg. Daily Tweet */}
                    <tr>
                        <td className="metric-name">Avg. Daily Tweet</td>
                        <td className="metric-value">
                            {formatTweetCount(periodData.before?.avg_daily_tweets)}
                        </td>
                        <MetricCell
                            value={periodData.one_month?.avg_daily_tweets}
                            changePct={periodData.one_month?.tweet_change_pct}
                            significant={periodData.one_month?.tweet_significant}
                            metricType="good-up"
                            decimals={1}
                            suffix="k"
                        />
                        <MetricCell
                            value={periodData.three_month?.avg_daily_tweets}
                            changePct={periodData.three_month?.tweet_change_pct}
                            significant={periodData.three_month?.tweet_significant}
                            metricType="good-up"
                            decimals={1}
                            suffix="k"
                        />
                        <MetricCell
                            value={periodData.six_month?.avg_daily_tweets}
                            changePct={periodData.six_month?.tweet_change_pct}
                            significant={periodData.six_month?.tweet_significant}
                            metricType="good-up"
                            decimals={1}
                            suffix="k"
                        />
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
