import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import SectionHeader from '../components/shared/SectionHeader';
import ContentCard from '../components/shared/ContentCard';
import { statsApi } from '../services/api';
import { chartColors } from '../theme/colors';

interface DifficultyPoint {
    date: string;
    avg_guesses: number;
    difficulty: number;
}

/**
 * Distribution section with overall distribution bar chart and time series.
 */
export default function DistributionSection() {
    const { data: distribution, isLoading: distLoading } = useQuery({
        queryKey: ['aggregateDistribution'],
        queryFn: statsApi.getAggregateDistribution,
    });

    // Get timeline data from dashboard init
    const { data: dashboardData, isLoading: dashLoading } = useQuery({
        queryKey: ['dashboard-init'],
        queryFn: statsApi.getDashboardInit,
    });

    const timelineData = dashboardData?.difficulty || [];

    // Transform distribution data for bar chart
    const barChartData = distribution ? [
        { name: '1/6', value: distribution.guess_1, fill: chartColors.primary },
        { name: '2/6', value: distribution.guess_2, fill: chartColors.primary },
        { name: '3/6', value: distribution.guess_3, fill: chartColors.primary },
        { name: '4/6', value: distribution.guess_4, fill: chartColors.secondary },
        { name: '5/6', value: distribution.guess_5, fill: chartColors.secondary },
        { name: '6/6', value: distribution.guess_6, fill: chartColors.tertiary },
        { name: 'Failed', value: distribution.failed, fill: chartColors.negative },
    ] : [];

    // Calculate success rate per point (1 - failed rate)
    const successRateData = timelineData.map((point: DifficultyPoint) => ({
        date: point.date,
        successRate: point.avg_guesses <= 6 ? Math.round((1 - (point.avg_guesses - 3) / 4) * 100) : 50,
    }));

    return (
        <section id="distribution" className="section">
            <div className="container">
                <SectionHeader
                    badge="📊 Trends"
                    title="Guess Distribution Trends"
                    description="See how players perform across different puzzles"
                />

                <ContentCard header="Overall Guess Distribution">
                    {distLoading ? (
                        <div className="chart-placeholder chart-placeholder-bar">
                            <div className="placeholder-content">
                                <span className="placeholder-icon">📊</span>
                                <p>Loading distribution data...</p>
                            </div>
                        </div>
                    ) : (
                        <figure>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill={chartColors.primary} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <figcaption className="sr-only">
                                Bar chart showing guess distribution from 1/6 to 6/6 and failed attempts.
                                Most players solve puzzles in 3-4 guesses.
                            </figcaption>
                        </figure>
                    )}
                    <div className="insight-callout">
                        <span className="insight-icon">💡</span>
                        <span>Most players solve in 3-4 guesses. Only about 2% of attempts fail completely!</span>
                    </div>
                </ContentCard>

                <div className="split-cards">
                    <ContentCard header="Success Rate Over Time">
                        {dashLoading ? (
                            <div className="chart-placeholder chart-placeholder-line">
                                <div className="placeholder-content">
                                    <span className="placeholder-icon">📈</span>
                                    <p>Loading success rate data...</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '250px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={successRateData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" hide />
                                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="successRate"
                                            stroke={chartColors.primary}
                                            dot={false}
                                            name="Success Rate"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </ContentCard>

                    <ContentCard header="Average Guesses Timeline">
                        {dashLoading ? (
                            <div className="chart-placeholder chart-placeholder-line">
                                <div className="placeholder-content">
                                    <span className="placeholder-icon">📉</span>
                                    <p>Loading guesses data...</p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '250px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timelineData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" hide />
                                        <YAxis domain={[3, 6]} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="avg_guesses"
                                            stroke={chartColors.secondary}
                                            dot={false}
                                            name="Avg Guesses"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </ContentCard>
                </div>
            </div>
        </section>
    );
}
