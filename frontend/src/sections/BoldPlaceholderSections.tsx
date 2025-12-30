import React from 'react';

// Reusable Placeholder Component
const Placeholder = ({ title, color }: { title: string; color: string }) => (
    <div className="h-96 w-full card border-l-4 flex flex-col justify-center items-center opacity-70 hover:opacity-100 transition-opacity"
        style={{ borderColor: color }}>
        <h3 className="text-2xl font-bold mb-4 font-heading">{title}</h3>
        <p className="text-[var(--text-secondary)]">Visualization coming in Phase 5</p>
        <div className="w-16 h-16 mt-6 rounded-full border-4 border-dashed animate-spin-slow"
            style={{ borderColor: color, borderTopColor: 'transparent' }} />
    </div>
);

export const BoldDifficultySection = () => (
    <section id="difficulty" className="mb-20 scroll-mt-20">
        <div className="section-header">
            <div className="section-eyebrow">Feature 1</div>
            <h2 className="section-title">The Difficulty Timeline</h2>
            <p className="section-description">
                How word rarity correlates with player performance over time. Watch the difficulty curve evolve across 500+ puzzles.
            </p>
        </div>
        <Placeholder title="Word Difficulty Trends" color="var(--accent-cyan)" />
    </section>
);

export const BoldDistributionSection = () => (
    <section id="guesses" className="mb-20 scroll-mt-20">
        <div className="section-header">
            <div className="section-eyebrow">Feature 2</div>
            <h2 className="section-title">How America Guesses</h2>
            <p className="section-description">
                The distribution of guess counts reveals patterns in player behavior. Most solve in 4 guesses—how do you stack up?
            </p>
        </div>
        <Placeholder title="Guess Breakdown" color="var(--accent-orange)" />
    </section>
);

export const BoldPatternsSection = () => (
    <section id="pattern" className="mb-20 scroll-mt-20">
        <div className="section-header">
            <div className="section-eyebrow">Feature 3</div>
            <h2 className="section-title">Pattern Detective</h2>
            <p className="section-description">
                Input your Wordle pattern (emoji sequence) and discover how common your path to victory was.
            </p>
        </div>
        <Placeholder title="Starting Pattern Stats" color="var(--accent-lime)" />
    </section>
);

export const BoldNYTEffectSection = () => (
    <section id="nyt-effect" className="mb-20 scroll-mt-20">
        <div className="section-header">
            <div className="section-eyebrow">Feature 5</div>
            <h2 className="section-title">The NYT Effect</h2>
            <p className="section-description">
                When the New York Times acquired Wordle in June 2022, everything changed. See the before/after impact on difficulty.
            </p>
        </div>
        <Placeholder title="Before vs After Stats" color="#ffffff" />
    </section>
);

export const BoldTrapsSection = () => (
    <section id="traps" className="mb-20 scroll-mt-20">
        <div className="section-header">
            <div className="section-eyebrow">Feature 7</div>
            <h2 className="section-title">Letter Traps</h2>
            <p className="section-description">
                Which letter patterns trip up players the most? This heatmap reveals the trickiest letter positions and combinations.
            </p>
        </div>
        <Placeholder title="Trap Pattern Detection" color="var(--accent-coral)" />
    </section>
);
