import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../../services/api';
import InsightCard from '../../components/shared/InsightCard';
import { NYTMetricsTable } from './components/NYTMetricsTable';
import { formatValue } from './utils/formatters';
import { useSectionTracking } from '../../analytics/hooks/useSectionTracking';

export default function BoldNYTEffectSection() {
    useSectionTracking({ sectionName: 'nyt-effect' });
    const { data: periodData, isLoading } = useQuery({
        queryKey: ['nytPeriods'],
        queryFn: statsApi.getNYTPeriods,
    });

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
                        <span className="relative z-10">📊 Loading NYT analysis data...</span>
                    </div>
                ) : periodData ? (
                    <>
                        <NYTMetricsTable periodData={periodData} />

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
                        <span className="relative z-10">⚠️ No data available</span>
                    </div>
                )}
            </div>

            <style>{`
                .nyt-table-container {
                    overflow-x: auto;
                    margin-bottom: 2rem;
                    border-radius: 12px;
                    position: relative;
                }

                /* Scroll indicator gradient on right edge for mobile */
                @media (max-width: 1024px) {
                    .nyt-table-container::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        width: 40px;
                        background: linear-gradient(to left, var(--bg-card), transparent);
                        pointer-events: none;
                        border-radius: 0 12px 12px 0;
                    }

                    .nyt-table-container::-webkit-scrollbar {
                        height: 6px;
                    }

                    .nyt-table-container::-webkit-scrollbar-thumb {
                        background: var(--border-color);
                        border-radius: 3px;
                    }

                    .nyt-table-container::-webkit-scrollbar-track {
                        background: rgba(255, 255, 255, 0.05);
                    }
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
                    color: var(--accent-lime);
                }

                .change-negative {
                    color: var(--accent-coral);
                }

                .change-neutral {
                    color: var(--text-secondary);
                }

                @media (min-width: 769px) and (max-width: 1024px) {
                    .nyt-metrics-table {
                        font-size: 0.8125rem;
                    }

                    .nyt-metrics-table th,
                    .nyt-metrics-table td {
                        padding: 0.75rem;
                    }

                    .table-period {
                        font-size: 0.6875rem;
                    }
                }

                @media (max-width: 768px) {
                    .nyt-metrics-table {
                        font-size: 0.75rem;
                        min-width: 600px; /* Force horizontal scroll for readability */
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

                @media (max-width: 480px) {
                    .nyt-metrics-table th,
                    .nyt-metrics-table td {
                        padding: 0.375rem;
                    }

                    .metric-name {
                        font-size: 0.6875rem;
                    }
                }
            `}</style>
        </section>
    );
}
