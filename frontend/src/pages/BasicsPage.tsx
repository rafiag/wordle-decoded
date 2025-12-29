import DifficultySection from '../sections/DifficultySection';
import DistributionSection from '../sections/DistributionSection';
import PageHeader from '../components/shared/PageHeader';
import TechnicalSection from '../components/shared/TechnicalSection';

/**
 * The Basics page - for casual Wordle fans.
 * Contains foundational analytics: difficulty and distribution.
 */
export default function BasicsPage() {
    const technicalContent = [
        {
            subtitle: 'Word Difficulty Calculation',
            description: 'Difficulty ratings are based on word frequency scores from the COCA (Corpus of Contemporary American English) database. Words are scored 1-10, where 10 represents the rarest words. This correlates strongly with actual player performance (avg guesses), as rare words require more attempts to solve.',
        },
        {
            subtitle: 'Guess Distribution Methodology',
            description: 'Distribution data is aggregated from Twitter share patterns collected via Kaggle. Each puzzle\'s distribution shows the percentage of players who solved in 1-6 guesses or failed. We track over 300 days of data to identify trends and outliers in player performance.',
        },
    ];

    return (
        <main>
            <PageHeader
                icon="📊"
                title="The Basics"
                description="Foundational Wordle analytics - understand word difficulty and how players perform across all puzzles."
            />

            <DifficultySection />
            <DistributionSection />

            <TechnicalSection
                title="📚 How We Calculate These Metrics"
                content={technicalContent}
            />
        </main>
    );
}
