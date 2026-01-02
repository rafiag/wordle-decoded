
import BoldHeroSection from '../sections/BoldHeroSection';
import BoldAtAGlanceSection from '../sections/BoldAtAGlanceSection';
import BoldDifficultySection from '../sections/BoldDifficultySection';
import BoldTrapsSection from '../sections/BoldTrapsSection';
import BoldSentimentSection from '../sections/BoldSentimentSection';
import BoldNYTEffectSection from '../sections/BoldNYTEffectSection';
import BoldWordHighlightsSection from '../sections/BoldWordHighlightsSection';
import BoldPatternsSection from '../sections/BoldPatternsSection';

/**
 * BoldDashboard - The main page for the V2 design.
 * Integrates all V2-specific components.
 */
export default function BoldDashboard() {
    return (
        <div>
            {/* Hero Section */}
            <BoldHeroSection />

            {/* Content Container */}
            <div className="container-v2 py-8">

                <BoldAtAGlanceSection />
                <BoldDifficultySection />
                <BoldTrapsSection />
                <BoldSentimentSection />
                <BoldNYTEffectSection />
                <BoldWordHighlightsSection />
                <BoldPatternsSection />
            </div>
        </div>
    );
}
