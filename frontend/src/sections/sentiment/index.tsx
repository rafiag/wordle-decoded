import { useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../../services/api';
import { SentimentResponse } from '../../types';
import { useSentimentDistribution } from './hooks/useSentimentDistribution';
import { useSentimentTopWords } from './hooks/useSentimentTopWords';
import { FrustrationMeter } from './components/FrustrationMeter';
import { SentimentTable } from './components/SentimentTable';
import { TooltipTerm } from '../../components/shared/Tooltip';
import { useSectionTracking } from '../../analytics/hooks/useSectionTracking';

// Lazy load chart components
const SentimentPieChart = lazy(() => import('./components/SentimentPieChart').then(m => ({ default: m.SentimentPieChart })));
const SentimentTimelineChart = lazy(() => import('./components/SentimentTimelineChart').then(m => ({ default: m.SentimentTimelineChart })));

export default function BoldSentimentSection() {
    useSectionTracking({ sectionName: 'sentiment' });
    const { data: sentimentData, isLoading } = useQuery<SentimentResponse>({
        queryKey: ['sentimentData'],
        queryFn: statsApi.getSentimentData,
    });

    const [rankingMode, setRankingMode] = useState<'hated' | 'loved'>('hated');

    // Process data with hooks
    const sentimentDistribution = useSentimentDistribution(sentimentData?.aggregates);
    const topWords = useSentimentTopWords(sentimentData?.top_hated, sentimentData?.top_loved, rankingMode);

    const avgFrustration = sentimentData?.aggregates?.avg_frustration || 0;
    const frustrationBreakdown = (sentimentData?.aggregates?.frustration_by_difficulty as { Easy: number; Medium: number; Hard: number; Expert: number }) || { Easy: 0, Medium: 0, Hard: 0, Expert: 0 };

    return (
        <section id="sentiment" className="mb-20 pt-10">
            <div className="section-header">
                <h2 className="section-title">
                    <TooltipTerm termKey="sentiment">Sentiment</TooltipTerm> Analysis
                </h2>
                <p className="section-description">
                    Community frustration vs. excitement over time.
                </p>
            </div>

            {isLoading ? (
                <div className="py-20 text-center text-[var(--text-secondary)]">Loading sentiment data...</div>
            ) : (
                <>
                    <div className="grid-2-col mb-8">
                        <Suspense fallback={<div className="card animate-pulse bg-[var(--card-bg)]" style={{ minHeight: '350px' }} />}>
                            <SentimentPieChart data={sentimentDistribution} />
                        </Suspense>
                        <Suspense fallback={<div className="card animate-pulse bg-[var(--card-bg)]" style={{ minHeight: '350px' }} />}>
                            <SentimentTimelineChart data={sentimentData?.timeline || []} />
                        </Suspense>
                    </div>

                    <div className="grid-2-col">
                        <FrustrationMeter avgFrustration={avgFrustration} frustrationBreakdown={frustrationBreakdown} />
                        <SentimentTable words={topWords} rankingMode={rankingMode} onRankingModeChange={setRankingMode} />
                    </div>
                </>
            )}
        </section>
    );
}
