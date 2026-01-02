import { useState } from 'react';
import { Trap } from '../../../types';

interface TrapPatternLockProps {
    data: Trap;
}

export function TrapPatternLock({ data }: TrapPatternLockProps) {
    const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

    const word = data.word;
    const neighbors = data.deadly_neighbors || [];

    // Find which index varies
    let variableIndex = 0;
    if (neighbors.length > 0) {
        const first = neighbors[0];
        for (let i = 0; i < 5; i++) {
            if (word[i] !== first[i]) {
                variableIndex = i;
                break;
            }
        }
    }

    // Collect all unique letters at variable index
    const allWords = [word, ...neighbors];
    const uniqueLetters = Array.from(new Set(allWords.map(w => w[variableIndex]))).sort();

    return (
        <div className="trap-lock-visual">
            {/* The Word Lock (5 Tiles) */}
            <div className="trap-lock-row">
                {Array.from({ length: 5 }).map((_, i) => {
                    const isVariable = i === variableIndex;
                    const letter = word[i];

                    return (
                        <div
                            key={i}
                            className={`trap-lock-tile ${isVariable ? 'is-variable' : ''} ${isVariable && hoveredLetter ? 'active' : ''}`}
                        >
                            {isVariable && hoveredLetter ? hoveredLetter : letter}
                        </div>
                    );
                })}
            </div>

            {/* The Keys (Neighbors) */}
            <div className="trap-keys-label">
                Pattern Variations ({neighbors.length})
            </div>
            <div className="trap-keys-grid">
                {uniqueLetters.map((char) => {
                    const isTrapChar = char === word[variableIndex];
                    const isActive = hoveredLetter === char;

                    return (
                        <button
                            key={char}
                            className={`trap-key ${isTrapChar ? 'is-trap-word' : ''} ${isActive ? 'active' : ''}`}
                            onMouseEnter={() => setHoveredLetter(char)}
                            onMouseLeave={() => setHoveredLetter(null)}
                        >
                            {char}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
