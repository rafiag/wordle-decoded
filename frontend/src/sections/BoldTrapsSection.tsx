import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Info, Target, GitMerge } from 'lucide-react';

import InsightCard from '../components/shared/InsightCard';
import { statsApi } from '../services/api';
import type { Trap } from '../types';

// Custom Tooltip Component (matching other sections)
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as Trap;
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded shadow-lg min-w-[200px]">
                <p className="font-bold text-[var(--text-primary)] mb-2 text-lg">{data.word}</p>

                <div className="mb-3 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
                    <div className="flex justify-between">
                        <span>Neighbors:</span>
                        <span className="font-mono text-[var(--accent-orange)] font-bold">{data.neighbor_count}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span>Trap Score:</span>
                        <span className="font-mono text-[var(--text-primary)]">{Math.round(data.trap_score)}</span>
                    </div>
                    {data.avg_guesses && (
                        <div className="flex justify-between mt-1">
                            <span>Avg Guesses:</span>
                            <span className="font-mono text-[var(--accent-cyan)]">{data.avg_guesses.toFixed(2)}</span>
                        </div>
                    )}
                    {data.success_rate && (
                        <div className="flex justify-between mt-1">
                            <span>Success Rate:</span>
                            <span className="font-mono text-[var(--accent-lime)]">{Math.round(data.success_rate * 100)}%</span>
                        </div>
                    )}
                </div>

                <div className="text-xs">
                    <div className="text-[var(--text-secondary)] mb-1 uppercase tracking-wide">Sample Neighbors</div>
                    <div className="text-[var(--text-primary)] leading-relaxed">
                        {data.deadly_neighbors.slice(0, 10).join(', ')}
                        {data.deadly_neighbors.length > 10 ? '...' : ''}
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const TrapPatternLock = ({ data }: { data: Trap }) => {
    const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

    return (
        <div className="trap-lock-visual">

            {/* 1. The Word Lock (5 Tiles) */}
            <div className="trap-lock-row">
                {(() => {
                    // Pattern Logic: Find which index varies
                    const word = data.word;
                    const neighbors = data.deadly_neighbors || [];

                    // Default to index 0 if something is weird, but try to find the actual diff
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

                    // Render 5 tiles
                    return Array.from({ length: 5 }).map((_, i) => {
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
                    });
                })()}
            </div>

            {/* 2. The Keys (Neighbors) */}
            <div className="trap-keys-label">
                Pattern Variations ({data.deadly_neighbors?.length || 0})
            </div>
            <div className="trap-keys-grid">
                {(() => {
                    const word = data.word;
                    const neighbors = data.deadly_neighbors || [];

                    // Determine variable index again (should be consistent)
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

                    // Collect all unique letters at this index
                    const allWords = [word, ...neighbors];
                    const uniqueLetters = Array.from(new Set(allWords.map(w => w[variableIndex]))).sort();

                    return uniqueLetters.map((char) => {
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
                    });
                })()}
            </div>
        </div>
    );
};

export default function BoldTrapsSection() {
    const [selectedWord, setSelectedWord] = useState<string | null>(null);

    // 1. Fetch Top Traps for Leaderboard
    const { data: topTraps, isLoading: isLoadingTop, isError: isErrorTop, error: errorTop } = useQuery({
        queryKey: ['topTraps'],
        queryFn: async () => {
            const data = await statsApi.getTopTraps(10);
            // Sort by neighbor count for the visual leaderboard
            return data.sort((a, b) => b.neighbor_count - a.neighbor_count);
        }
    });

    // 2. Fetch Details for Selected Word
    const { data: selectedTrapData } = useQuery({
        queryKey: ['trapDetail', selectedWord],
        queryFn: async () => {
            if (!selectedWord) return null;
            const data = await statsApi.getTrapByWord(selectedWord);
            return data;
        },
        enabled: !!selectedWord,
        refetchOnMount: true,
        refetchOnWindowFocus: false
    });

    // Auto-select the first trap when topTraps loads
    React.useEffect(() => {
        if (topTraps && topTraps.length > 0 && !selectedWord) {
            setSelectedWord(topTraps[0].word);
        }
    }, [topTraps, selectedWord]);

    if (isLoadingTop) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Trap Data...</div>;
    if (isErrorTop) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--accent-coral)' }}>Error loading traps: {(errorTop as any).message}</div>;

    // Helper to find the common pattern (e.g. _IGHT)
    const getPatternMask = (word: string, neighbors: string[]) => {
        if (!word || !neighbors.length) return word;
        const firstNeighbor = neighbors[0];
        let mask = '';
        for (let i = 0; i < 5; i++) {
            if (word[i] === firstNeighbor[i]) {
                mask += word[i];
            } else {
                mask += '_';
            }
        }
        return mask;
    };

    return (
        <section id="trap-words" style={{ padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '20%', right: '10%', width: '500px', height: '500px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', filter: 'blur(120px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '400px', height: '400px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '50%', filter: 'blur(100px)' }} />
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div className="section-header">
                    <h2 className="section-title">The Trap Zone</h2>
                    <p className="section-description">
                        A trap word isn't just obscure—it's a minefield. With 8+ neighbors sharing the same pattern, guessing becomes a dangerous game of chance.
                    </p>
                </div>

                <div className="trap-section-grid">

                    {/* Left Column: Leaderboard */}
                    <div className="card trap-leaderboard">
                        <div className="trap-leaderboard-header">
                            <h3 className="trap-leaderboard-title">
                                Deadly Leaderboard
                            </h3>
                        </div>

                        <div className="trap-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={topTraps}
                                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                                    barSize={28}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="word"
                                        type="category"
                                        hide
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={false} />
                                    <Bar
                                        dataKey="neighbor_count"
                                        radius={[0, 6, 6, 0]}
                                        activeBar={false}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        onClick={(data: any) => {
                                            if (data && data.payload) {
                                                setSelectedWord(data.payload.word);
                                            }
                                        }}
                                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                    >
                                        {topTraps?.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={selectedWord === entry.word ? 'var(--accent-orange)' : '#334155'}
                                                stroke={selectedWord === entry.word ? 'var(--text-primary)' : 'none'}
                                                strokeWidth={2}
                                            />
                                        ))}
                                        <LabelList
                                            dataKey="word"
                                            position="insideLeft"
                                            style={{ fill: 'var(--text-primary)', fontWeight: 'bold', fontSize: '13px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={(val: any) => ` ${val}`}
                                        />
                                        <LabelList
                                            dataKey="neighbor_count"
                                            position="right"
                                            style={{ fill: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="trap-info-footer">
                            <Info style={{ width: '16px', height: '16px' }} />
                            <span>Ranked by number of "Neighbors" (1-letter variance).</span>
                        </div>
                    </div>

                    {/* Right Column: Interaction & Detail */}
                    {selectedTrapData ? (
                        <div className="trap-detail-card">
                            <div className="trap-detail-glow"></div>

                            <div className="trap-detail-header" style={{ marginBottom: 0 }}>
                                <div>
                                    <div className="trap-detail-label">
                                        <Target style={{ width: '16px', height: '16px' }} />
                                        Analysis Target
                                    </div>
                                    <h1 className="trap-detail-word">{selectedTrapData.word}</h1>
                                </div>
                                <div className="trap-detail-date-box">
                                    <div className="trap-detail-date-label">Date</div>
                                    <div className="trap-detail-date-value">{selectedTrapData.date || 'Unknown'}</div>
                                </div>
                            </div>

                            {/* The Pattern Lock Visual */}
                            <TrapPatternLock data={selectedTrapData} />

                            {/* Insight Footer */}
                            <InsightCard title="Strategic Insight" style={{ marginTop: 0 }}>
                                <p>
                                    The common mask is <strong>{getPatternMask(selectedTrapData.word, selectedTrapData.deadly_neighbors)}</strong>.
                                    Veterans avoid 'Trap Diving' by playing a separator word (like <em>FLING</em>) to eliminate multiple consonants at once, even if it guarantees a loss of turn.
                                </p>
                            </InsightCard>
                        </div>
                    ) : (
                        <div className="card trap-empty-state" style={{ borderStyle: 'dashed' }}>
                            <GitMerge style={{ width: '48px', height: '48px' }} />
                            <span>Select a word to inspect its trap configuration</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
