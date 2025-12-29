import PatternsSection from '../sections/PatternsSection';
import PageHeader from '../components/shared/PageHeader';
import TechnicalSection from '../components/shared/TechnicalSection';

/**
 * Interactive Tools page - for explorers.
 * Contains interactive features: pattern analysis and word explorer.
 */
export default function InteractivePage() {
    const technicalContent = [
        {
            subtitle: 'Pattern Analysis - Success Rate Calculation',
            description: 'Pattern success rates are calculated by matching your emoji pattern against historical Wordle game data. For each matching pattern, we track completion rates and average remaining guesses needed. The algorithm accounts for green tile positions, yellow tile hints, and gray tile exclusions to predict your likelihood of solving the puzzle.',
        },
        {
            subtitle: 'Word Explorer - Difficulty Scoring',
            description: 'Word statistics combine multiple data sources: frequency scores from the COCA corpus (0-10 scale), historical player performance (average guesses and success rates from Twitter data), and sentiment analysis. The search uses case-insensitive partial matching to help you find any Wordle answer word quickly.',
        },
    ];

    return (
        <main>
            <PageHeader
                icon="🎮"
                title="Interactive Tools"
                description="Hands-on exploration - analyze patterns from your games and search for any Wordle word to see detailed statistics and performance metrics."
            />

            <PatternsSection />

            {/* TODO: Add WordExplorer component after backend API is ready */}

            <TechnicalSection
                title="⚙️ Detection Algorithms & Search Methods"
                content={technicalContent}
            />
        </main>
    );
}
