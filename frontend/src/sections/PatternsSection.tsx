import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SectionHeader from '../components/shared/SectionHeader';
import ContentCard from '../components/shared/ContentCard';
import { statsApi } from '../services/api';

const STATES = ['⬜', '🟨', '🟩'] as const;
type BlockState = typeof STATES[number];

/**
 * Pattern section with interactive pattern input and analysis results.
 * Only fetches data when user clicks the Analyze button.
 */
export default function PatternsSection() {
    const [pattern, setPattern] = useState<BlockState[]>(['⬜', '🟨', '⬜', '⬜', '🟩']);
    const [analyzedPattern, setAnalyzedPattern] = useState<string | null>(null);
    const patternString = pattern.join('');

    // Only fetch when analyzedPattern is set (after button click)
    const { data: patternStats, isLoading: statsLoading } = useQuery({
        queryKey: ['patternStats', analyzedPattern],
        queryFn: () => statsApi.getPatternStats(analyzedPattern!),
        enabled: analyzedPattern !== null,
    });

    const { data: nextSteps, isLoading: flowLoading } = useQuery({
        queryKey: ['patternFlow', analyzedPattern],
        queryFn: () => statsApi.getPatternFlow(analyzedPattern!, 3),
        enabled: analyzedPattern !== null,
    });

    const cycleBlock = (index: number) => {
        const newPattern = [...pattern];
        const currentIndex = STATES.indexOf(newPattern[index]);
        newPattern[index] = STATES[(currentIndex + 1) % STATES.length];
        setPattern(newPattern);
    };

    const handleAnalyze = () => {
        setAnalyzedPattern(patternString);
    };

    const isLoading = statsLoading || flowLoading;
    const hasResults = analyzedPattern !== null;

    return (
        <section id="patterns" className="section">
            <div className="container">
                <SectionHeader
                    badge="🔍 Interactive"
                    title="Pattern-based Performance Analysis"
                    description="Input your game pattern to see how it compares"
                />

                <div className="split-cards">
                    {/* Input Card */}
                    <ContentCard variant="interactive">
                        <div className="pattern-input-area">
                            <h3>Analyze Your First Guess</h3>
                            <p>Enter your first guess pattern (5 blocks) to see success rates and what usually happens next</p>
                            <div className="pattern-input-blocks">
                                {pattern.map((block, index) => (
                                    <div
                                        key={index}
                                        className="pattern-block"
                                        onClick={() => cycleBlock(index)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Block ${index + 1}: ${block}`}
                                        onKeyDown={(e) => e.key === 'Enter' && cycleBlock(index)}
                                    >
                                        {block}
                                    </div>
                                ))}
                            </div>
                            <button
                                className="btn btn-primary"
                                disabled={isLoading}
                                onClick={handleAnalyze}
                            >
                                {isLoading ? 'Analyzing...' : 'Analyze Pattern'}
                            </button>
                        </div>
                    </ContentCard>

                    {/* Results Card */}
                    <ContentCard header="Analysis Results">
                        <div className="pattern-results">
                            <div className="pattern-result-header">
                                <span className="pattern-display">{analyzedPattern || patternString}</span>
                            </div>

                            <div className="pattern-metrics">
                                <div className="pattern-metric">
                                    <span className="metric-label">Success Rate</span>
                                    <span className="metric-value">
                                        {hasResults && patternStats ? `${(patternStats.success_rate * 100).toFixed(2)}%` : '--'}
                                    </span>
                                </div>
                                <div className="pattern-metric">
                                    <span className="metric-label">Sample Size</span>
                                    <span className="metric-value">
                                        {hasResults && patternStats ? patternStats.count.toLocaleString() : '--'}
                                    </span>
                                </div>
                                <div className="pattern-metric">
                                    <span className="metric-label">Avg Final Guess</span>
                                    <span className="metric-value">
                                        {hasResults && patternStats ? patternStats.avg_guesses?.toFixed(1) || '--' : '--'}
                                    </span>
                                </div>
                            </div>

                            <div className="pattern-flow-section">
                                <h4>Most Likely Next Steps</h4>
                                {hasResults && nextSteps && nextSteps.length > 0 ? (
                                    nextSteps.map((step, index) => (
                                        <div key={index} className="flow-item">
                                            <span className="flow-pattern">{step.next_pattern}</span>
                                            <span className="flow-percentage">{(step.probability * 100).toFixed(2)}%</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flow-item">
                                        <span className="flow-pattern">{hasResults ? 'No data available' : 'Click Analyze to see results'}</span>
                                        <span className="flow-percentage">--</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ContentCard>
                </div>
            </div>
        </section>
    );
}
