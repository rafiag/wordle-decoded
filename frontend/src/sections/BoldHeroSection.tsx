import React from 'react';

/**
 * BoldHeroSection - A strictly presentational component for the V2 'Bold' design.
 * 
 * Features:
 * - Data Noir styling (gradients, glows, typography)
 * - Animated background elements (via CSS pseudo-elements)
 * - Clean layout (no stat cards, just landing focus)
 * - Scroll Nudge indicator
 * 
 * Note: Styles are defined in bold-theme.css under .hero, .hero-title, etc.
 */
const BoldHeroSection: React.FC = () => {
    return (
        <section id="hero" className="hero">
            <div className="container mx-auto px-4">
                <div className="hero-content text-center">
                    <div className="hero-eyebrow">Data Exploration Dashboard</div>
                    <h1 className="hero-title">
                        WORDLE<br />DECODED
                    </h1>
                    <p className="hero-subtitle">
                        You've played the game. Now see the data.
                    </p>
                </div>

                {/* Scroll Nudge Separator */}
                <div className="scroll-nudge">
                    <div className="scroll-nudge-text">Scroll to Explore</div>
                    <div className="scroll-arrow"></div>
                </div>
            </div>
        </section>
    );
};

export default BoldHeroSection;
