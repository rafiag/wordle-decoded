import { useState } from 'react';
import { statsApi } from '../services/api';
import type { WordDetails } from '../types';

// Highlight card data (static, computed from database analysis)
const HIGHLIGHT_CARDS = [
    {
        id: 'deadly-trap',
        icon: '🪤',
        title: 'Deadly Trap',
        word: 'LIVER',
        primaryStat: '17.2',
        primaryLabel: 'Trap Score',
        secondaryStat: '23 deadly neighbors',
        description: 'Most confusing word with similar alternatives',
        variant: 'coral' as const,
    },
    {
        id: 'cultural-phenomenon',
        icon: '🌟',
        title: 'Cultural Phenomenon',
        word: 'MOIST',
        primaryStat: '+46%',
        primaryLabel: 'Tweet Volume vs Avg',
        secondaryStat: 'Difficulty 3 (45% easier)',
        description: 'Easy word that went viral on social media',
        variant: 'cyan' as const,
    },
    {
        id: 'heartbreaker',
        icon: '💔',
        title: 'Heartbreaker',
        word: 'CYNIC',
        primaryStat: '33.2%',
        primaryLabel: 'Frustration Index',
        secondaryStat: '86.6% success rate',
        description: 'Solved by most, but hated by many',
        variant: 'purple' as const,
    },
];

/**
 * BoldWordHighlightsSection - Final dashboard section with:
 * 1. Word Highlight Cards (3 featured words with interesting stats)
 * 2. Word Explorer (search for any word's comprehensive stats)
 */
export default function BoldWordHighlightsSection() {
    const [searchWord, setSearchWord] = useState('');
    const [wordDetails, setWordDetails] = useState<WordDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const isValidWord = searchWord.length === 5 && /^[a-zA-Z]+$/.test(searchWord);

    const handleSearch = async () => {
        if (!isValidWord) return;

        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const details = await statsApi.getWordDetails(searchWord);
            setWordDetails(details);
        } catch (err: unknown) {
            setWordDetails(null);
            const apiError = err as { status?: number };
            if (apiError.status === 404) {
                setError('Word not found in database. Try a different Wordle answer.');
            } else {
                setError('Failed to fetch word details. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValidWord) {
            handleSearch();
        }
    };

    return (
        <section id="word-highlights" className="mb-20 pt-10 scroll-mt-20">
            <div className="container">
                {/* Section Header */}
                <div className="section-header">
                    <h2 className="section-title">Word Highlights</h2>
                    <p className="section-description">
                        Discover remarkable Wordle words and explore detailed stats for any puzzle.
                    </p>
                </div>

                {/* Word Highlight Cards */}
                <div className="highlight-cards-grid">
                    {HIGHLIGHT_CARDS.map((card) => (
                        <div key={card.id} className={`highlight-card highlight-card-${card.variant}`}>
                            <div className="highlight-card-header">
                                <span className="highlight-card-icon">{card.icon}</span>
                                <span className="highlight-card-title">{card.title}</span>
                            </div>
                            <div className="highlight-card-word">{card.word}</div>
                            <div className="highlight-card-stats">
                                <div className="highlight-stat-primary">
                                    <span className="highlight-stat-value">{card.primaryStat}</span>
                                    <span className="highlight-stat-label">{card.primaryLabel}</span>
                                </div>
                                <div className="highlight-stat-secondary">{card.secondaryStat}</div>
                            </div>
                            <p className="highlight-card-description">{card.description}</p>
                        </div>
                    ))}
                </div>

                {/* Word Explorer */}
                <div className="word-explorer-section">
                    {/* Card containing everything */}
                    <div className="card">
                        <div className="pattern-results">
                            <h3 className="word-explorer-title">Word Explorer</h3>
                            <p className="word-explorer-subtitle">
                                Search any 5-letter Wordle answer to see its complete stats
                            </p>

                            {/* Search Input */}
                            <div className="pattern-input-row">
                                <div className="word-explorer-input-wrapper">
                                    <input
                                        type="text"
                                        value={searchWord}
                                        onChange={(e) => setSearchWord(e.target.value.toUpperCase().slice(0, 5))}
                                        onKeyDown={handleKeyDown}
                                        placeholder="ENTER"
                                        maxLength={5}
                                        className="word-explorer-input"
                                        aria-label="Enter 5-letter word"
                                    />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSearch}
                                    disabled={!isValidWord || isLoading}
                                >
                                    {isLoading ? 'Searching...' : 'Search Word'}
                                </button>
                            </div>

                            {/* Validation hint */}
                            {searchWord.length > 0 && !isValidWord && (
                                <p className="word-explorer-hint">Enter exactly 5 letters (A-Z only)</p>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="word-explorer-error">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            {/* Results Grid */}
                            {wordDetails && !error && (
                                <>                                    <div className="pattern-metrics-grid word-explorer-metrics">
                                    <div className="pattern-metric-card">
                                        <span className="metric-card-value">
                                            {wordDetails.difficulty_rating ?? '--'}
                                        </span>
                                        <span className="metric-card-label">
                                            Difficulty ({wordDetails.difficulty_label ?? 'N/A'})
                                        </span>
                                    </div>
                                    <div className="pattern-metric-card">
                                        <span className="metric-card-value">
                                            {wordDetails.success_rate
                                                ? `${(wordDetails.success_rate * 100).toFixed(1)}%`
                                                : '--'}
                                        </span>
                                        <span className="metric-card-label">Success Rate</span>
                                    </div>
                                    <div className="pattern-metric-card">
                                        <span className="metric-card-value">
                                            {wordDetails.avg_guess_count?.toFixed(2) ?? '--'}
                                        </span>
                                        <span className="metric-card-label">Avg. Guesses</span>
                                    </div>
                                    <div className="pattern-metric-card">
                                        <span className="metric-card-value">
                                            {wordDetails.tweet_volume?.toLocaleString() ?? '--'}
                                        </span>
                                        <span className="metric-card-label">Tweet Volume</span>
                                    </div>
                                    <div className="pattern-metric-card">
                                        <span className="metric-card-value">
                                            {wordDetails.sentiment_score?.toFixed(3) ?? '--'}
                                        </span>
                                        <span className="metric-card-label">Sentiment Score</span>
                                    </div>
                                    <div className="pattern-metric-card">
                                        <span className="metric-card-value">
                                            {wordDetails.frustration_index
                                                ? `${(wordDetails.frustration_index * 100).toFixed(1)}%`
                                                : '--'}
                                        </span>
                                        <span className="metric-card-label">Frustration Index</span>
                                    </div>
                                </div>

                                    {/* Trap Analysis Section */}
                                    {wordDetails.trap_score !== null && (
                                        <div className="word-explorer-trap-section">
                                            <h4>🪤 Trap Analysis</h4>
                                            <div className="word-explorer-trap-stats">
                                                <span>
                                                    <strong>Trap Score:</strong> {wordDetails.trap_score.toFixed(2)}
                                                </span>
                                                <span>
                                                    <strong>Neighbors:</strong> {wordDetails.neighbor_count}
                                                </span>
                                            </div>
                                            {wordDetails.deadly_neighbors && wordDetails.deadly_neighbors.length > 0 && (
                                                <div className="word-explorer-neighbors">
                                                    <strong>Deadly Neighbors:</strong>{' '}
                                                    {wordDetails.deadly_neighbors.slice(0, 10).join(', ')}
                                                    {wordDetails.deadly_neighbors.length > 10 && (
                                                        <span className="text-muted"> +{wordDetails.deadly_neighbors.length - 10} more</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Empty State */}
                            {!hasSearched && !error && (
                                <div className="word-explorer-empty">
                                    Enter a word above and click Search to see detailed stats
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading && (
                                <div className="word-explorer-empty">
                                    Loading word details...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}