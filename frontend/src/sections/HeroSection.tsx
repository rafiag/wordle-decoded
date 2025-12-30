import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import StatCard from '../components/shared/StatCard';
import { statsApi } from '../services/api';
import type { AtAGlanceStats } from '../types';

// Section categories for navigation
const sectionCategories = [
    {
        icon: '📊',
        title: 'The Basics',
        description: 'Core metrics and patterns',
        path: '/basics',
        sections: [
            { path: '/basics#difficulty', name: 'Word Difficulty', desc: 'How rarity affects performance' },
            { path: '/basics#distribution', name: 'Guess Distribution', desc: 'Player success patterns' },
        ],
    },
    {
        icon: '🔍',
        title: 'Deep Dives',
        description: 'Advanced analysis',
        path: '/deep-dive',
        sections: [
            { path: '/deep-dive#sentiment', name: 'Player Sentiment', desc: 'Frustration & excitement' },
            { path: '/deep-dive#traps', name: 'Trap Words', desc: 'Words with tricky neighbors' },
            { path: '/deep-dive#patterns', name: 'Pattern Analysis', desc: 'Your game patterns' },
        ],
    },
    {
        icon: '📰',
        title: 'Special Events',
        description: 'Notable moments',
        path: '/deep-dive',
        sections: [
            { path: '/deep-dive#nyt', name: 'NYT Effect', desc: 'Did NYT make it harder?' },
            { path: '/deep-dive#outliers', name: 'Viral Days', desc: 'Unusual tweet activity' },
        ],
    },
];

/**
 * Hero section with overview stats from at-a-glance endpoint.
 * Shows 4 key statistics at the top of the landing page.
 */
export default function HeroSection() {
    const { data, isLoading } = useQuery<AtAGlanceStats>({
        queryKey: ['at-a-glance'],
        queryFn: async () => {
            const response = await statsApi.getAtAGlanceStats();
            return response;
        },
    });

    return (
        <section id="hero" className="section hero-section">
            <div className="container">
                <div className="hero-content">
                    <h2 className="section-title hero-title">Discover What Makes Wordle Puzzles Hard</h2>
                    <p className="hero-subtitle">
                        Explore 500+ days of Wordle data, player patterns, and puzzle difficulty insights
                    </p>

                    {/* Overview Stats Cards */}
                    <div className="stats-grid">
                        <StatCard
                            icon="📊"
                            value={data ? data.avg_guesses.toFixed(2) : '---'}
                            label="Avg Guesses"
                            variant="gray"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon="📰"
                            value={data ? `${data.nyt_effect.direction === 'increase' ? '+' : ''}${data.nyt_effect.delta}` : '---'}
                            label="NYT Effect"
                            variant="gray"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon="😊"
                            value={data?.community_mood.mood_label || '---'}
                            label={data ? `Community Mood (${data.community_mood.positive_pct}% positive)` : 'Community Mood'}
                            variant="green"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon="🎉"
                            value={data?.easiest_word.word || '---'}
                            label={data ? `Easiest Word (${data.easiest_word.success_rate}% success)` : 'Easiest Word'}
                            variant="green"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon="🔥"
                            value={data?.hardest_word.word || '---'}
                            label={data ? `Hardest Word (${data.hardest_word.avg_guesses} guesses, ${data.hardest_word.success_rate}% success)` : 'Hardest Word'}
                            variant="red"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon="🌟"
                            value={data?.most_viral.word || '---'}
                            label={data ? `Most Viral (${data.most_viral.tweet_volume.toLocaleString()} tweets)` : 'Most Viral'}
                            variant="yellow"
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Table of Contents / Navigation */}
                    <div className="toc-section">
                        <h3 className="toc-title">What You'll Discover</h3>
                        <div className="toc-grid">
                            {sectionCategories.map((category) => (
                                <div key={category.title} className="toc-category">
                                    <div className="toc-category-header">
                                        <span className="toc-category-icon">{category.icon}</span>
                                        <div>
                                            <h4 className="toc-category-title">{category.title}</h4>
                                            <p className="toc-category-desc">{category.description}</p>
                                        </div>
                                    </div>
                                    <ul className="toc-list">
                                        {category.sections.map((section) => (
                                            <li key={section.path}>
                                                <Link to={section.path} className="toc-link">
                                                    <span className="toc-link-name">{section.name}</span>
                                                    <span className="toc-link-desc">{section.desc}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
