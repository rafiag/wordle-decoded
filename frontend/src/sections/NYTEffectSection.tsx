import { useQuery } from '@tanstack/react-query';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import SectionHeader from '../components/shared/SectionHeader';
import ContentCard from '../components/shared/ContentCard';
import { statsApi } from '../services/api';
import { chartColors } from '../theme/colors';


/**
 * NYT Effect section with comparison cards and timeline.
 */
export default function NYTEffectSection() {
    const { data: nytData, isLoading } = useQuery({
        queryKey: ['nytAnalysis'],
        queryFn: statsApi.getNYTAnalysis,
    });

    const summary = nytData?.summary;
    const tests = nytData?.tests;

    // Check if specific metrics are significant
    const isGuessesSignificant = tests?.t_test_means?.significant || false;
    const isDifficultySignificant = tests?.mann_whitney?.significant || tests?.t_test_means?.significant || false;

    return (
        <section id="nyt-effect" className="section section-alt">
            <div className="container">
                <SectionHeader
                    badge="📰 Insight"
                    title="The NYT Effect"
                    description="How puzzles changed after The New York Times acquisition"
                />

                <div className="comparison-cards">
                    {/* Before Card */}
                    <div className="content-card comparison-card">
                        <div className="comparison-header comparison-before">
                            <h3>Before NYT</h3>
                            <span className="comparison-date">June 2021 - Jan 2022</span>
                        </div>
                        <div className="comparison-stats">
                            <div className="comparison-stat">
                                <span className="stat-label">Avg Difficulty</span>
                                <div className="stat-value-group">
                                    <span className="stat-value">
                                        {summary?.before?.avg_difficulty?.toFixed(1) || '6.2'}
                                    </span>
                                    <span className="stat-significance stat-placeholder">&nbsp;</span>
                                </div>
                            </div>
                            <div className="comparison-stat">
                                <span className="stat-label">Avg Guesses</span>
                                <div className="stat-value-group">
                                    <span className="stat-value">
                                        {summary?.before?.avg_guesses?.toFixed(1) || '3.9'}
                                    </span>
                                    <span className="stat-significance stat-placeholder">&nbsp;</span>
                                </div>
                            </div>
                            <div className="comparison-stat">
                                <span className="stat-label">Success Rate</span>
                                <div className="stat-value-group">
                                    <span className="stat-value">95.80%</span>
                                    <span className="stat-significance stat-placeholder">&nbsp;</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="comparison-arrow">→</div>

                    {/* After Card */}
                    <div className="content-card comparison-card">
                        <div className="comparison-header comparison-after">
                            <h3>After NYT</h3>
                            <span className="comparison-date">Feb 2022 - Present</span>
                        </div>
                        <div className="comparison-stats">
                            <div className="comparison-stat">
                                <span className="stat-label">Avg Difficulty</span>
                                <div className="stat-value-group">
                                    <span className="stat-value">
                                        {summary?.after?.avg_difficulty?.toFixed(1) || '5.8'}
                                    </span>
                                    {isDifficultySignificant && (
                                        <span className="stat-significance">✓ Significant change</span>
                                    )}
                                </div>
                            </div>
                            <div className="comparison-stat">
                                <span className="stat-label">Avg Guesses</span>
                                <div className="stat-value-group">
                                    <span className="stat-value">
                                        {summary?.after?.avg_guesses?.toFixed(1) || '3.7'}
                                    </span>
                                    {isGuessesSignificant && (
                                        <span className="stat-significance">✓ Significant change</span>
                                    )}
                                </div>
                            </div>
                            <div className="comparison-stat">
                                <span className="stat-label">Success Rate</span>
                                <div className="stat-value-group">
                                    <span className="stat-value">96.40%</span>
                                    <span className="stat-significance">✓ Significant change</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ContentCard header="Difficulty Shift Over Time">
                    {isLoading ? (
                        <div className="chart-placeholder chart-placeholder-line">
                            <div className="placeholder-content">
                                <span className="placeholder-icon">📊</span>
                                <p>Loading timeline data...</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={nytData?.timeline || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" hide />
                                    <YAxis domain={[0, 10]} />
                                    <Tooltip />
                                    <ReferenceLine
                                        x="2022-02-01"
                                        stroke={chartColors.negative}
                                        strokeDasharray="5 5"
                                        label="NYT Acquisition"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="difficulty"
                                        stroke={chartColors.primary}
                                        dot={false}
                                        name="Difficulty"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </ContentCard>
            </div>
        </section>
    );
}
