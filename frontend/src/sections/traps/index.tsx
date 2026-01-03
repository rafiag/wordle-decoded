import { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitMerge } from 'lucide-react';
import { statsApi } from '../../services/api';
import { TrapDetailCard } from './components/TrapDetailCard';
import { TooltipTerm } from '../../components/shared/Tooltip';

// Lazy load TrapLeaderboard (contains Recharts)
const TrapLeaderboard = lazy(() => import('./components/TrapLeaderboard').then(m => ({ default: m.TrapLeaderboard })));

export default function BoldTrapsSection() {
    const [selectedWord, setSelectedWord] = useState<string | null>(null);

    // Fetch Top Traps for Leaderboard
    const { data: topTraps, isLoading: isLoadingTop, isError: isErrorTop, error: errorTop } = useQuery({
        queryKey: ['topTraps'],
        queryFn: async () => {
            const data = await statsApi.getTopTraps(10);
            return data.sort((a, b) => b.neighbor_count - a.neighbor_count);
        }
    });

    // Fetch Details for Selected Word
    const { data: selectedTrapData } = useQuery({
        queryKey: ['trapDetail', selectedWord],
        queryFn: async () => {
            if (!selectedWord) return null;
            return await statsApi.getTrapByWord(selectedWord);
        },
        enabled: !!selectedWord,
        refetchOnMount: true,
        refetchOnWindowFocus: false
    });

    // Auto-select the first trap when topTraps loads
    useEffect(() => {
        if (topTraps && topTraps.length > 0 && !selectedWord) {
            const timer = setTimeout(() => {
                setSelectedWord(topTraps[0].word);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [topTraps, selectedWord]);

    if (isLoadingTop) return <div className="p-12 text-center text-[var(--text-secondary)]">Loading Trap Data...</div>;
    if (isErrorTop) return <div className="p-12 text-center text-[var(--accent-coral)]">Error loading traps: {(errorTop as Error).message}</div>;

    return (
        <section id="trap-words" className="section-container py-24">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="background-glow background-glow--coral absolute top-[20%] right-[10%] w-[500px] h-[500px]" />
                <div className="background-glow background-glow--orange absolute bottom-[10%] left-[5%] w-[400px] h-[400px]" />
            </div>

            <div className="section-inner">
                <div className="section-header">
                    <h2 className="section-title">The <TooltipTerm termKey="trapWord">Trap</TooltipTerm> Zone</h2>
                    <p className="section-description">
                        A trap word isn't just obscure—it's a minefield. With 8+ neighbors sharing the same pattern, guessing becomes a dangerous game of chance.
                    </p>
                </div>

                <div className="trap-section-grid">
                    <Suspense fallback={<div className="card animate-pulse bg-[var(--card-bg)]" style={{ minHeight: '350px' }} />}>
                        <TrapLeaderboard
                            traps={topTraps || []}
                            selectedWord={selectedWord}
                            onSelectWord={setSelectedWord}
                        />
                    </Suspense>

                    {selectedTrapData ? (
                        <TrapDetailCard trap={selectedTrapData} />
                    ) : (
                        <div className="card trap-empty-state border-dashed">
                            <GitMerge className="w-12 h-12" />
                            <span>Select a word to inspect its trap configuration</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
