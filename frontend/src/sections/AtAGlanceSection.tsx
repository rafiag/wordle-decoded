import { useEffect, useState } from 'react';
import { statsApi } from '../services/api';
import type { AtAGlanceStats } from '../types';

/**
 * At a Glance section for landing page.
 * Displays 6 key statistics in a grid format.
 */
export default function AtAGlanceSection() {
    const [stats, setStats] = useState<AtAGlanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true);
                const data = await statsApi.getAtAGlanceStats();
                setStats(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load statistics';
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">At a Glance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="wordle-card animate-pulse">
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">At a Glance</h2>
                <div className="wordle-card bg-red-50 border-red-200">
                    <p className="text-red-600">Failed to load statistics. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">At a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Hardest Word Ever */}
                <div className="wordle-card">
                    <div className="flex items-start space-x-4">
                        <div className="text-5xl flex-shrink-0">🎯</div>
                        <div className="flex-1">
                            <h3 className="text-sm text-gray-600 mb-1">Hardest Word Ever</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.hardest_word.word}</p>
                            <p className="text-sm text-gray-700">Difficulty {stats.hardest_word.difficulty}/10</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {stats.hardest_word.success_rate.toFixed(2)}% success • {stats.hardest_word.avg_guesses.toFixed(2)} avg guesses
                            </p>
                        </div>
                    </div>
                </div>

                {/* Easiest Day */}
                <div className="wordle-card">
                    <div className="flex items-start space-x-4">
                        <div className="text-5xl flex-shrink-0">🎉</div>
                        <div className="flex-1">
                            <h3 className="text-sm text-gray-600 mb-1">Easiest Day</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.easiest_word.word}</p>
                            <p className="text-sm text-gray-700">{stats.easiest_word.success_rate.toFixed(2)}% success rate</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {stats.easiest_word.avg_guesses.toFixed(2)} avg guesses • Difficulty {stats.easiest_word.difficulty}/10
                            </p>
                        </div>
                    </div>
                </div>

                {/* Most Viral Moment */}
                <div className="wordle-card">
                    <div className="flex items-start space-x-4">
                        <div className="text-5xl flex-shrink-0">🔥</div>
                        <div className="flex-1">
                            <h3 className="text-sm text-gray-600 mb-1">Most Viral Moment</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-1">
                                {new Date(stats.most_viral.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-700">{stats.most_viral.word}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {stats.most_viral.tweet_volume.toLocaleString()} tweets • {stats.most_viral.percent_increase.toFixed(2)}% above average
                            </p>
                        </div>
                    </div>
                </div>

                {/* Average Guesses */}
                <div className="wordle-card">
                    <div className="flex items-start space-x-4">
                        <div className="text-5xl flex-shrink-0">📊</div>
                        <div className="flex-1">
                            <h3 className="text-sm text-gray-600 mb-1">Average Guesses</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.avg_guesses.toFixed(2)}</p>
                            <p className="text-sm text-gray-700">Across all puzzles</p>
                            <p className="text-xs text-gray-500 mt-2">How many tries does the average player need?</p>
                        </div>
                    </div>
                </div>

                {/* NYT Effect */}
                <div className="wordle-card">
                    <div className="flex items-start space-x-4">
                        <div className="text-5xl flex-shrink-0">📰</div>
                        <div className="flex-1">
                            <h3 className="text-sm text-gray-600 mb-1">NYT Effect</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-1">
                                {stats.nyt_effect.direction === 'increase' ? '+' : ''}{stats.nyt_effect.delta}
                            </p>
                            <p className="text-sm text-gray-700">
                                {stats.nyt_effect.direction === 'increase' ? 'Guesses increased' : 'Guesses decreased'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">After Feb 10, 2022 acquisition</p>
                        </div>
                    </div>
                </div>

                {/* Community Mood */}
                <div className="wordle-card">
                    <div className="flex items-start space-x-4">
                        <div className="text-5xl flex-shrink-0">😊</div>
                        <div className="flex-1">
                            <h3 className="text-sm text-gray-600 mb-1">Community Mood</h3>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.community_mood.mood_label}</p>
                            <p className="text-sm text-gray-700">{stats.community_mood.positive_pct.toFixed(2)}% positive tweets</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Average sentiment: {stats.community_mood.avg_sentiment > 0 ? '+' : ''}{stats.community_mood.avg_sentiment.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
