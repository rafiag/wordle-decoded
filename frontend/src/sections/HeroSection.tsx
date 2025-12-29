import { useQuery } from '@tanstack/react-query';
import StatCard from '../components/shared/StatCard';
import { statsApi } from '../services/api';

interface DashboardInitData {
    overview: {
        total_puzzles: number;
        total_tweets: number;
        avg_guesses: number;
        avg_sentiment: number;
        viral_events_count: number;
        hardest_word: string;
        hardest_word_guesses: number;
        hardest_word_success: number;
        success_rate: number;
    };
}

// Section categories for TOC
const sectionCategories = [
    {
        icon: '📊',
        title: 'The Basics',
        description: 'Core metrics and patterns',
        sections: [
            { id: 'difficulty', name: 'Word Difficulty', desc: 'How rarity affects performance' },
            { id: 'distribution', name: 'Guess Distribution', desc: 'Player success patterns' },
        ],
    },
    {
        icon: '🔍',
        title: 'Deep Dives',
        description: 'Advanced analysis',
        sections: [
            { id: 'sentiment', name: 'Player Sentiment', desc: 'Frustration & excitement' },
            { id: 'traps', name: 'Trap Words', desc: 'Words with tricky neighbors' },
            { id: 'patterns', name: 'Pattern Analysis', desc: 'Your game patterns' },
        ],
    },
    {
        icon: '📰',
        title: 'Special Events',
        description: 'Notable moments',
        sections: [
            { id: 'nyt', name: 'NYT Effect', desc: 'Did NYT make it harder?' },
            { id: 'outliers', name: 'Viral Days', desc: 'Unusual tweet activity' },
        ],
    },
];

/**
 * Hero section with overview stats and grouped table of contents.
 * Fetches data from /dashboard/init endpoint.
 */
export default function HeroSection() {
    const { data, isLoading } = useQuery<DashboardInitData>({
        queryKey: ['dashboard-init'],
        queryFn: async () => {
            const response = await statsApi.getDashboardInit();
            return response;
        },
    });

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const overview = data?.overview;

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
                            icon="🎯"
                            value={overview ? formatNumber(overview.total_puzzles) : '---'}
                            label="Puzzles Analyzed"
                            variant="green"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon="📊"
                            value={overview ? overview.avg_guesses.toFixed(2) : '---'}
                            label="Avg Guesses"
                            variant="gray"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon="✅"
                            value={overview ? `${overview.success_rate}%` : '---'}
                            label="Success Rate"
                            variant="green"
                            isLoading={isLoading}
                        />
                        <StatCard
                            icon="🔥"
                            value={overview?.hardest_word || '---'}
                            label={overview ? `Hardest Word (${overview.hardest_word_guesses} guesses, ${overview.hardest_word_success}% success)` : 'Hardest Word'}
                            variant="red"
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Table of Contents */}
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
                                            <li key={section.id}>
                                                <a href={`#${section.id}`} className="toc-link">
                                                    <span className="toc-link-name">{section.name}</span>
                                                    <span className="toc-link-desc">{section.desc}</span>
                                                </a>
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
