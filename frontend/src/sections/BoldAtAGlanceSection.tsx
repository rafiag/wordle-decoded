import { useEffect, useState } from 'react';
import StatCard from '../components/shared/StatCard';
import { statsApi } from '../services/api';
import type { AtAGlanceStats } from '../types';
import { useSectionTracking } from '../analytics/hooks/useSectionTracking';

/**
 * BoldAtAGlanceSection - V2 landing section.
 * Features:
 * - 6 Primary Stat Cards (Data Noir styling) in 3x2 grid
 * - Overview Navigation Links
 */
export default function BoldAtAGlanceSection() {
    useSectionTracking({ sectionName: 'at-a-glance' });
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



    return (
        <section id="at-a-glance" className="mb-20 pt-10">
            <div className="section-header">
                <h2 className="section-title">At a Glance</h2>
                <p className="section-description">
                    The big picture: key metrics from over 500 days of Wordle puzzles, tweets, and player performance.
                </p>
            </div>

            {/* Primary Stats Grid - 3x2 Layout */}
            <div className="stats-grid">
                <StatCard
                    icon="📊"
                    value={stats ? stats.avg_guesses.toFixed(2) : '---'}
                    label="Avg Guesses"
                    variant="gray"
                    isLoading={loading}
                />
                <StatCard
                    icon="📰"
                    value={stats ? `${stats.success_rate.toFixed(2)}%` : '---'}
                    label="Success Rate"
                    variant="gray"
                    isLoading={loading}
                />
                <StatCard
                    icon="😊"
                    value={stats?.community_mood.mood_label || '---'}
                    label={stats ? `Community Mood (${stats.community_mood.positive_pct.toFixed(2)}% positive)` : 'Community Mood'}
                    variant="gray"
                    isLoading={loading}
                />
                <StatCard
                    icon="🎉"
                    value={stats?.easiest_word.word || '---'}
                    label={stats ? `Easiest Word (${stats.easiest_word.avg_guesses.toFixed(2)} guesses, ${stats.easiest_word.success_rate.toFixed(2)}% success)` : 'Easiest Word'}
                    variant="gray"
                    isLoading={loading}
                />
                <StatCard
                    icon="🔥"
                    value={stats?.hardest_word.word || '---'}
                    label={stats ? `Hardest Word (${stats.hardest_word.avg_guesses.toFixed(2)} guesses, ${stats.hardest_word.success_rate.toFixed(2)}% success)` : 'Hardest Word'}
                    variant="gray"
                    isLoading={loading}
                />
                <StatCard
                    icon="🌟"
                    value={stats?.most_viral.word || '---'}
                    label={stats ? `Most Viral (${stats.most_viral.tweet_volume.toLocaleString()} tweets, +${stats.most_viral.percent_increase}% vs avg)` : 'Most Viral'}
                    variant="gray"
                    isLoading={loading}
                />
            </div>


        </section>
    );
}
