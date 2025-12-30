import { useEffect, useState } from 'react';
import { statsApi } from '../services/api';
import type { AtAGlanceStats } from '../types';

/**
 * BoldAtAGlanceSection - V2 landing section.
 * Features:
 * - 4 Primary Stat Cards (Data Noir styling)
 * - Overview Navigation Links
 */
export default function BoldAtAGlanceSection() {
    const [stats, setStats] = useState<AtAGlanceStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await statsApi.getAtAGlanceStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to load stats", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return <div className="animate-pulse text-center py-20 text-[var(--accent-cyan)]">Loading stats...</div>;
    }

    // Fallback if API fails
    const safeStats = stats || {
        hardest_word: { word: '-----', difficulty: 0, success_rate: 0, avg_guesses: 0 },
        easiest_word: { word: '-----', difficulty: 0, success_rate: 0, avg_guesses: 0 },
        most_viral: { word: '-----', date: new Date().toISOString(), tweet_volume: 0, percent_increase: 0 },
        avg_guesses: 0,
        nyt_effect: { delta: 0, direction: 'increase' },
        community_mood: { mood_label: '-----', positive_pct: 0, avg_sentiment: 0 }
    } as AtAGlanceStats;

    return (
        <section id="at-a-glance" className="mb-20 pt-10">
            <div className="section-header">
                <div className="section-eyebrow">Overview</div>
                <h2 className="section-title">At a Glance</h2>
                <p className="section-description">
                    The big picture: key metrics from over 500 days of Wordle puzzles, tweets, and player performance.
                </p>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="card hover:border-[var(--accent-cyan)]">
                    <h3 className="text-[var(--accent-cyan)] text-lg mb-2 flex items-center gap-2">
                        <span>📊</span> Total Words
                    </h3>
                    <p className="text-4xl font-bold font-mono text-white">1,245</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Processed</p>
                </div>

                <div className="card hover:border-[var(--accent-coral)]">
                    <h3 className="text-[var(--accent-coral)] text-lg mb-2 flex items-center gap-2">
                        <span>🎯</span> Hardest Word
                    </h3>
                    <p className="text-4xl font-bold font-mono text-white">{safeStats.hardest_word?.word || '-----'}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Diff {safeStats.hardest_word?.difficulty ?? 0}/10
                    </p>
                </div>

                <div className="card hover:border-[var(--accent-lime)]">
                    <h3 className="text-[var(--accent-lime)] text-lg mb-2 flex items-center gap-2">
                        <span>🎉</span> Easiest Word
                    </h3>
                    <p className="text-4xl font-bold font-mono text-white">{safeStats.easiest_word?.word || '-----'}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {safeStats.easiest_word?.avg_guesses ?? 0} avg guesses
                    </p>
                </div>

                <div className="card hover:border-[var(--accent-purple)]">
                    <h3 className="text-[var(--accent-purple)] text-lg mb-2 flex items-center gap-2">
                        <span>🔥</span> Viral Day
                    </h3>
                    <p className="text-4xl font-bold font-mono text-white">{safeStats.most_viral?.word || '-----'}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {safeStats.most_viral?.tweet_volume?.toLocaleString() ?? 0} tweets
                    </p>
                </div>
            </div>

            {/* Overview Navigation Cards */}
            <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)]">Explore Sections</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                    { id: 'difficulty', label: 'Difficulty', icon: '📈', color: 'var(--accent-cyan)' },
                    { id: 'guesses', label: 'Guesses', icon: '📊', color: 'var(--accent-orange)' },
                    { id: 'pattern', label: 'Pattern', icon: '🧩', color: 'var(--accent-lime)' },
                    { id: 'sentiment', label: 'Sentiment', icon: '💬', color: 'var(--accent-coral)' },
                    { id: 'nyt-effect', label: 'NYT Effect', icon: '📰', color: '#fff' },
                    { id: 'viral', label: 'Viral', icon: '🔥', color: 'var(--accent-purple)' },
                    { id: 'traps', label: 'Traps', icon: '🪤', color: 'var(--accent-cyan)' }
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="card p-4 text-center hover:-translate-y-1 transition-transform cursor-pointer"
                        style={{ borderColor: 'var(--border-color)' }}
                    >
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-sm font-bold" style={{ color: item.color }}>{item.label}</div>
                    </button>
                ))}
            </div>
        </section>
    );
}
