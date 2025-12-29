import HeroSection from '../sections/HeroSection';
import DifficultySection from '../sections/DifficultySection';
import DistributionSection from '../sections/DistributionSection';
import PatternsSection from '../sections/PatternsSection';
import SentimentSection from '../sections/SentimentSection';
import OutliersSection from '../sections/OutliersSection';
import TrapsSection from '../sections/TrapsSection';
import NYTEffectSection from '../sections/NYTEffectSection';
import SectionDivider from '../components/shared/SectionDivider';

/**
 * Main single-page dashboard.
 * All sections are rendered in order with anchor IDs for navigation.
 * Section groups are separated by visual dividers.
 */
export default function DashboardPage() {
    return (
        <main>
            <HeroSection />

            {/* The Basics */}
            <SectionDivider icon="📊" title="The Basics" />
            <DifficultySection />
            <DistributionSection />

            {/* Deep Dives */}
            <SectionDivider icon="🔍" title="Deep Dives" />
            <SentimentSection />
            <TrapsSection />
            <PatternsSection />

            {/* Special Events */}
            <SectionDivider icon="📰" title="Special Events" />
            <NYTEffectSection />
            <OutliersSection />
        </main>
    );
}
