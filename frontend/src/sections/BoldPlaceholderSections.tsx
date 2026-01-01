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

// Difficulty and Distribution replaced by BoldDifficultySection.tsx

export const BoldPatternsSection = () => (
    <section id="pattern" className="mb-20 scroll-mt-20">
        <div className="section-header">
            <h2 className="section-title">Pattern Detective</h2>
            <p className="section-description">
                Input your Wordle pattern (emoji sequence) and discover how common your path to victory was.
            </p>
        </div>
        <Placeholder title="Starting Pattern Stats" color="var(--accent-lime)" />
    </section>
);

export const BoldTrapsSection = () => (
    <section id="traps" className="mb-20 scroll-mt-20">
        <div className="section-header">
            <h2 className="section-title">Letter Traps</h2>
            <p className="section-description">
                Which letter patterns trip up players the most? This heatmap reveals the trickiest letter positions and combinations.
            </p>
        </div>
        <Placeholder title="Trap Pattern Detection" color="var(--accent-coral)" />
    </section>
);
