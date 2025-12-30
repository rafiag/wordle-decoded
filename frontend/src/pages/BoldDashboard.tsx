import React from 'react';
import BoldHeroSection from '../sections/BoldHeroSection';
import BoldAtAGlanceSection from '../sections/BoldAtAGlanceSection';
import BoldSentimentSection from '../sections/BoldSentimentSection';
import ViralSection from '../sections/ViralSection';
import {
    BoldDifficultySection,
    BoldDistributionSection,
    BoldPatternsSection,
    BoldNYTEffectSection,
    BoldTrapsSection
} from '../sections/BoldPlaceholderSections';

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

                {/* Phase 4: At A Glance */}
                <BoldAtAGlanceSection />

                {/* Phase 5: Placeholders */}
                <BoldDifficultySection />
                <BoldDistributionSection />
                <BoldPatternsSection />

                {/* Phase 4: Sentiment (New Placement) */}
                <BoldSentimentSection />

                {/* Phase 5: Placeholder */}
                <BoldNYTEffectSection />

                {/* Phase 6: Viral (New Section) */}
                <ViralSection />

                {/* Phase 5: Placeholder */}
                <BoldTrapsSection />

            </div>
        </div>
    );
}
