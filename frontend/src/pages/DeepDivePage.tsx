import NYTEffectSection from '../sections/NYTEffectSection';
import SentimentSection from '../sections/SentimentSection';
import OutliersSection from '../sections/OutliersSection';
import TrapsSection from '../sections/TrapsSection';
import PageHeader from '../components/shared/PageHeader';
import TechnicalSection from '../components/shared/TechnicalSection';

/**
 * Deep Dive page - for data enthusiasts.
 * Contains advanced analytics: NYT effect, sentiment, outliers, and traps.
 */
export default function DeepDivePage() {
    const technicalContent = [
        {
            subtitle: 'NYT Effect Analysis - Statistical Testing',
            description: 'We use two-sample t-tests to compare average guesses, difficulty scores, and success rates before and after February 10, 2022 (NYT acquisition date). P-values < 0.05 indicate statistically significant changes. Effect sizes (shown as delta values) quantify the practical significance of these changes.',
        },
        {
            subtitle: 'Sentiment Analysis - Frustration Index',
            description: 'Tweet sentiment is analyzed using VADER (Valence Aware Dictionary and sEntiment Reasoner), scoring each tweet from -1 (very negative) to +1 (very positive). Frustration Index is calculated as the percentage of negative tweets (score < -0.1) for each puzzle, adjusted for difficulty and performance factors.',
        },
        {
            subtitle: 'Outlier Detection - Z-Score Method',
            description: 'Viral days and unusual moments are detected using Z-score analysis on tweet volume. Days with Z-scores > 2.0 (2 standard deviations above mean) are flagged as high-volume outliers. We categorize these by sentiment to distinguish "viral frustration" from "viral celebration" moments.',
        },
        {
            subtitle: 'Trap Pattern Detection - Edit Distance Algorithm',
            description: 'Trap words are identified by counting similar words (Levenshtein distance ≤ 1) in the valid Wordle word list. Words with 5+ neighbors (like FIGHT → LIGHT, MIGHT, NIGHT, SIGHT, TIGHT) are classified as traps. Trap severity correlates with increased guess counts and failure rates.',
        },
    ];

    return (
        <main>
            <PageHeader
                icon="🔍"
                title="Deep Dive"
                description="Advanced analytics - explore the NYT acquisition impact, community sentiment, viral moments, and trap patterns that make certain puzzles challenging."
            />

            <NYTEffectSection />
            <SentimentSection />
            <OutliersSection />
            <TrapsSection />

            <TechnicalSection
                title="🔬 Statistical Methods & Data Sources"
                content={technicalContent}
            />
        </main>
    );
}
