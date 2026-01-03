import { lazy, Suspense } from 'react';
import BoldHeroSection from '../sections/BoldHeroSection';

// Lazy load below-the-fold sections
const BoldAtAGlanceSection = lazy(() => import('../sections/BoldAtAGlanceSection'));
const BoldDifficultySection = lazy(() => import('../sections/difficulty'));
const BoldTrapsSection = lazy(() => import('../sections/traps'));
const BoldSentimentSection = lazy(() => import('../sections/sentiment'));
const BoldNYTEffectSection = lazy(() => import('../sections/nyt-effect'));
const BoldWordHighlightsSection = lazy(() => import('../sections/BoldWordHighlightsSection'));
const BoldPatternsSection = lazy(() => import('../sections/BoldPatternsSection'));

/**
 * Loading fallback for sections
 */
const SectionLoader = () => (
    <div className="w-full h-[400px] flex items-center justify-center text-[var(--text-secondary)] animate-pulse bg-[var(--card-bg)] rounded-xl my-8 border border-[var(--border-primary)]">
        Loading section...
    </div>
);

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

                <Suspense fallback={<SectionLoader />}>
                    <BoldAtAGlanceSection />
                </Suspense>

                <Suspense fallback={<SectionLoader />}>
                    <BoldDifficultySection />
                </Suspense>

                <Suspense fallback={<SectionLoader />}>
                    <BoldTrapsSection />
                </Suspense>

                <Suspense fallback={<SectionLoader />}>
                    <BoldSentimentSection />
                </Suspense>

                <Suspense fallback={<SectionLoader />}>
                    <BoldNYTEffectSection />
                </Suspense>

                <Suspense fallback={<SectionLoader />}>
                    <BoldWordHighlightsSection />
                </Suspense>

                <Suspense fallback={<SectionLoader />}>
                    <BoldPatternsSection />
                </Suspense>
            </div>
        </div>
    );
}
