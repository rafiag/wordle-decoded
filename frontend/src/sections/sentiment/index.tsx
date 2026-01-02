import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../../services/api';
import { SentimentResponse } from '../../types';
import { useSentimentDistribution } from './hooks/useSentimentDistribution';
import { useSentimentTopWords } from './hooks/useSentimentTopWords';
import { SentimentPieChart } from './components/SentimentPieChart';
import { SentimentTimelineChart } from './components/SentimentTimelineChart';
import { FrustrationMeter } from './components/FrustrationMeter';
import { SentimentTable } from './components/SentimentTable';

export default function BoldSentimentSection() {
    const { data: sentimentData, isLoading } = useQuery<SentimentResponse>({
        queryKey: ['sentimentData'],
        queryFn: statsApi.getSentimentData,
    });

    const [rankingMode, setRankingMode] = useState<'hated' | 'loved'>('hated');

    // Process data with hooks
    const sentimentDistribution = useSentimentDistribution(sentimentData?.aggregates);
    const topWords = useSentimentTopWords(sentimentData?.top_hated, sentimentData?.top_loved, rankingMode);

    const avgFrustration = sentimentData?.aggregates?.avg_frustration || 0;
    const frustrationBreakdown = sentimentData?.aggregates?.frustration_by_difficulty || { Easy: 0, Medium: 0, Hard: 0 };

    if (isLoading) return <div className="py-20 text-center text-[var(--text-secondary)]">Loading sentiment data...</div>;

    return (
        <section id="sentiment" className="mb-20 pt-10">
            <div className="section-header">
                <h2 className="section-title">Sentiment Analysis</h2>
                <p className="section-description">
                    Community frustration vs. excitement over time.
                </p>
            </div>

            <div className="grid-2-col mb-8">
                <SentimentPieChart data={sentimentDistribution} />
                <SentimentTimelineChart data={sentimentData?.timeline || []} />
            </div>

            <div className="grid-2-col">
                <FrustrationMeter avgFrustration={avgFrustration} frustrationBreakdown={frustrationBreakdown} />
                <SentimentTable words={topWords} rankingMode={rankingMode} onRankingModeChange={setRankingMode} />
            </div>
        </section>
    );
}
