import { useEffect, useState } from 'react';
import { statsApi } from '../services/api';
import type { OutliersOverview } from '../types';

interface ViralMoment {
    date: string;
    word: string;
    type: string;
    metric: string;
    value: number;
    z_score: number;
    context?: string;
}

export default function ViralSection() {
    const [viralMoments, setViralMoments] = useState<ViralMoment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchViral() {
            try {
                // Using getOutliersOverview which returns top_outliers array
                const data: OutliersOverview = await statsApi.getOutliersOverview(20);
                // Extract top outliers, sorted by value (volume)
                const outliers = data.top_outliers || [];
                const formattedMoments: ViralMoment[] = outliers.map((o) => ({
                    date: o.date,
                    word: o.word,
                    type: o.type,
                    metric: o.metric,
                    value: o.value ?? 0,
                    z_score: o.z_score ?? 0,
                    context: o.context
                }));
                setViralMoments(formattedMoments);
            } catch (err) {
                console.error("Failed to fetch viral moments", err);
            } finally {
                setLoading(false);
            }
        }
        fetchViral();
    }, []);

    if (loading) {
        return (
            <section id="viral" className="mb-20 pt-10 scroll-mt-20">
                <h2 className="text-3xl font-bold mb-2 font-heading">Viral Moments</h2>
                <p className="text-[var(--text-secondary)] mb-8">Days that broke the internet.</p>
                <div className="text-center py-10 text-[var(--accent-cyan)] animate-pulse">Loading viral moments...</div>
            </section>
        );
    }

    return (
        <section id="viral" className="mb-20 pt-10 scroll-mt-20">
            <div className="section-header">
                <div className="section-eyebrow">Feature 6</div>
                <h2 className="section-title">Viral Moments</h2>
                <p className="section-description">
                    Days when Wordle broke the internet. Unusual tweet volume spikes and search interest surges reveal the most controversial puzzles.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {viralMoments.map((moment, idx) => (
                    <div
                        key={`${moment.date}-${idx}`}
                        className="card group hover:border-[var(--accent-purple)] hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[var(--accent-purple)] font-mono text-sm border border-[var(--border-color)] px-2 py-1 rounded">
                                {moment.date}
                            </span>
                            <span className="text-2xl">🔥</span>
                        </div>

                        <h3 className="text-4xl font-bold font-mono text-white mb-4 group-hover:text-[var(--accent-purple)] transition-colors">
                            {moment.word}
                        </h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">Type</span>
                                <span className="font-mono text-[var(--accent-coral)] capitalize">
                                    {moment.type?.replace(/_/g, ' ') ?? 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">{moment.metric || 'Metric'}</span>
                                <span className="font-mono text-white">
                                    {typeof moment.value === 'number' ? moment.value.toLocaleString() : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--text-secondary)]">Z-Score</span>
                                <span className="font-mono text-[var(--accent-lime)]">
                                    {typeof moment.z_score === 'number' ? moment.z_score.toFixed(2) : 'N/A'}
                                </span>
                            </div>
                            {moment.context && (
                                <p className="text-xs text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border-color)]">
                                    {moment.context}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Fallback empty state if no moments found */}
                {viralMoments.length === 0 && (
                    <div className="col-span-full text-center py-10 text-[var(--text-secondary)]">
                        No viral moments detected in current dataset.
                    </div>
                )}
            </div>
        </section>
    );
}
