import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import SectionHeader from '../components/shared/SectionHeader';
import ContentCard from '../components/shared/ContentCard';
import { statsApi } from '../services/api';
import { wordleColors } from '../theme/colors';

interface Trap {
    word: string;
    trap_score: number;
    neighbor_count: number;
    deadly_neighbors: string[];
    date?: string;
}

/**
 * Traps section with bar chart and trap word cards.
 */
export default function TrapsSection() {
    const { data: traps, isLoading } = useQuery({
        queryKey: ['topTraps'],
        queryFn: () => statsApi.getTopTraps(20),
    });

    // Prepare data for bar chart (top 10)
    const chartData = traps?.slice(0, 10).map((trap: Trap) => ({
        word: trap.word,
        score: trap.trap_score,
    })) || [];

    // Get top 6 for cards
    const topTraps = traps?.slice(0, 6) || [];

    return (
        <section id="traps" className="section section-alt">
            <div className="container">
                <SectionHeader
                    badge="🪤 Analysis"
                    title="Trap Pattern Analysis"
                    description="Words that look simple but are deadly because of their many similar neighbors"
                />

                <ContentCard
                    header="Top 20 Trap Words"
                    subheader="Words with the highest 'Trap Score' (high neighbor count + low frequency)"
                >
                    {isLoading ? (
                        <div className="chart-placeholder chart-placeholder-bar">
                            <div className="placeholder-content">
                                <span className="placeholder-icon">📊</span>
                                <p>Loading trap data...</p>
                            </div>
                        </div>
                    ) : (
                        <figure>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="word" />
                                        <Tooltip />
                                        <Bar dataKey="score" fill={wordleColors.trapAmber} name="Trap Score" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <figcaption className="sr-only">
                                Bar chart showing top 10 trap words ranked by trap score.
                                Higher scores indicate more similar words that could confuse players.
                            </figcaption>
                        </figure>
                    )}
                    <div className="insight-callout">
                        <span className="insight-icon">💡</span>
                        <span>Words like SLATE and CRANE have many neighbors — one wrong letter and you're stuck!</span>
                    </div>
                </ContentCard>

                <div className="trap-cards-grid">
                    {topTraps.map((trap: Trap) => (
                        <div key={trap.word} className="trap-card">
                            <div className="trap-header">
                                <h3 className="trap-word">{trap.word}</h3>
                                <div className="trap-score-display">
                                    <span className="trap-score-value">{trap.trap_score?.toFixed(1) || 'N/A'}</span>
                                    <span className="trap-score-label">Trap Score</span>
                                </div>
                            </div>
                            <div className="trap-details">
                                <p className="trap-neighbor-count">
                                    <strong>{trap.neighbor_count} Deadly Neighbors</strong> (differ by 1 letter):
                                </p>
                                <div className="trap-neighbors">
                                    {trap.deadly_neighbors?.slice(0, 10).map((neighbor, idx) => (
                                        <span key={idx} className="neighbor-tag">{neighbor}</span>
                                    ))}
                                    {trap.deadly_neighbors?.length > 10 && (
                                        <span className="neighbor-tag">+{trap.deadly_neighbors.length - 10} more</span>
                                    )}
                                </div>
                            </div>
                            {trap.date && (
                                <p className="trap-date">Appeared on: {trap.date}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
