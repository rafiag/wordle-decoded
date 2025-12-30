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
        <h2 className="text-3xl font-bold mb-6 font-heading text-[var(--accent-cyan)]">Difficulty Analysis</h2>
        <Placeholder title="Word Difficulty Trends" color="var(--accent-cyan)" />
    </section>
);

export const BoldDistributionSection = () => (
    <section id="guesses" className="mb-20 scroll-mt-20">
        <h2 className="text-3xl font-bold mb-6 font-heading text-[var(--accent-orange)]">Guess Distribution</h2>
        <Placeholder title="Guess Breakdown" color="var(--accent-orange)" />
    </section>
);

export const BoldPatternsSection = () => (
    <section id="pattern" className="mb-20 scroll-mt-20">
        <h2 className="text-3xl font-bold mb-6 font-heading text-[var(--accent-lime)]">Pattern Analysis</h2>
        <Placeholder title="Starting Pattern Stats" color="var(--accent-lime)" />
    </section>
);

export const BoldNYTEffectSection = () => (
    <section id="nyt-effect" className="mb-20 scroll-mt-20">
        <h2 className="text-3xl font-bold mb-6 font-heading text-white">NYT Acquisition Effect</h2>
        <Placeholder title="Before vs After Stats" color="#ffffff" />
    </section>
);

export const BoldTrapsSection = () => (
    <section id="traps" className="mb-20 scroll-mt-20">
        <h2 className="text-3xl font-bold mb-6 font-heading text-[var(--accent-coral)]">Trap Words</h2>
        <Placeholder title="Trap Pattern Detection" color="var(--accent-coral)" />
    </section>
);
