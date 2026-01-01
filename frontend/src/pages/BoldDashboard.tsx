import React from 'react';
import BoldHeroSection from '../sections/BoldHeroSection';
import BoldAtAGlanceSection from '../sections/BoldAtAGlanceSection';
import BoldSentimentSection from '../sections/BoldSentimentSection';
import ViralSection from '../sections/ViralSection';
import BoldDifficultySection from '../sections/BoldDifficultySection';
import BoldPatternsSection from '../sections/BoldPatternsSection';
import {
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

                <BoldAtAGlanceSection />
                <BoldDifficultySection />
                <BoldSentimentSection />
                <BoldPatternsSection />
                <BoldNYTEffectSection />
                <ViralSection />
                <BoldTrapsSection />

            </div>
        </div>
    );
}
