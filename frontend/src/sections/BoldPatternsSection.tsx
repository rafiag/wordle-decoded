import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../services/api';

const STATES = ['⬜', '🟨', '🟩'] as const;
type BlockState = typeof STATES[number];

/**
 * Bold Pattern Section - Interactive pattern analysis with Data Noir theme.
 * Users can input their first guess pattern and see success rates and likely next steps.
 */
export default function BoldPatternsSection() {
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
        <section id="pattern" className="mb-20 pt-10 scroll-mt-20">
            <div className="container">
                {/* Section Header */}
                <div className="section-header">
                    <h2 className="section-title">Pattern Detective</h2>
                    <p className="section-description">
                        Input your Wordle pattern (emoji sequence) and discover how common your path to victory was.
                    </p>
                </div>

                {/* Vertical Stack Layout: Input on top, Results below */}
                <div className="pattern-stack">
                    {/* Input Card */}
                    <div className="card">
                        <div className="pattern-input-area">
                            <h3>Analyze Your First Guess</h3>
                            <p>Click blocks to change state, then analyze</p>

                            <div className="pattern-input-row">
                                <div className="pattern-input-blocks">
                                    {pattern.map((block, index) => (
                                        <div
                                            key={index}
                                            className={`pattern-block state-${STATES.indexOf(block)}`}
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
                        </div>
                        <div className="pattern-results">
                            <div className="pattern-result-header">
                                <h3>Analysis Results</h3>
                            </div>

                            {/* Metrics Grid */}
                            <div className="pattern-metrics-grid">
                                <div className="pattern-metric-card">
                                    <span className="metric-card-value">
                                        {hasResults && patternStats ? `${(patternStats.success_rate * 100).toFixed(1)}%` : '--'}
                                    </span>
                                    <span className="metric-card-label">Success Rate</span>
                                </div>
                                <div className="pattern-metric-card">
                                    <span className="metric-card-value">
                                        {hasResults && patternStats ? patternStats.count.toLocaleString() : '--'}
                                    </span>
                                    <span className="metric-card-label">Sample Size</span>
                                </div>
                                <div className="pattern-metric-card">
                                    <span className="metric-card-value">
                                        {hasResults && patternStats ? patternStats.avg_guesses?.toFixed(1) || '--' : '--'}
                                    </span>
                                    <span className="metric-card-label">Avg Guesses</span>
                                </div>
                            </div>

                            {/* Flow List */}
                            <div className="pattern-flow-list">
                                <div className="flow-header">Most Likely Next Steps</div>
                                {hasResults && nextSteps && nextSteps.length > 0 ? (
                                    nextSteps.map((step, index) => (
                                        <div key={index} className="flow-row">
                                            <span className="flow-pattern-display">{step.next_pattern}</span>
                                            <span className="flow-prob">{(step.probability * 100).toFixed(1)}%</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flow-row">
                                        <span className="flow-pattern-display" style={{ fontSize: '14px' }}>
                                            {hasResults ? 'No data available' : 'Click Analyze to see results'}
                                        </span>
                                        <span className="flow-prob">--</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
