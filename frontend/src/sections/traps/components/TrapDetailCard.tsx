import { useEffect, useRef } from 'react';
import { Target } from 'lucide-react';
import InsightCard from '../../../components/shared/InsightCard';
import { Trap } from '../../../types';
import { TrapPatternLock } from './TrapPatternLock';
import { getPatternMask } from '../utils/patternUtils';
import { trackViewTrapDetail } from '../../../analytics/events';

interface TrapDetailCardProps {
    trap: Trap;
    shouldTrack?: boolean;
}

export function TrapDetailCard({ trap, shouldTrack = false }: TrapDetailCardProps) {
    const lastTrackedWordRef = useRef<string | null>(null);

    useEffect(() => {
        // Track trap detail view only if caused by user interaction
        if (!shouldTrack) return;

        // Prevent double tracking/re-tracking of the same word (handles Strict Mode and re-renders)
        if (lastTrackedWordRef.current === trap.word) return;

        const deadlyNeighborsShown = trap.deadly_neighbors?.length || 0;
        const hasPatternLock = deadlyNeighborsShown > 0;

        trackViewTrapDetail({
            word: trap.word,
            date: trap.date || 'Unknown',
            deadly_neighbors_shown: Math.min(deadlyNeighborsShown, 10), // Max 10 shown
            has_pattern_lock: hasPatternLock,
        });

        lastTrackedWordRef.current = trap.word;
    }, [trap.word, trap.date, trap.deadly_neighbors, shouldTrack]);

    return (
        <div className="trap-detail-card">


            <div className="trap-detail-header mb-0">
                <div>
                    <div className="trap-detail-label">
                        <Target className="w-4 h-4" />
                        Analysis Target
                    </div>
                    <h1 className="trap-detail-word">{trap.word}</h1>
                </div>
                <div className="trap-detail-date-box">
                    <div className="trap-detail-date-label">Date</div>
                    <div className="trap-detail-date-value">{trap.date || 'Unknown'}</div>
                </div>
            </div>

            <TrapPatternLock data={trap} />

            <InsightCard title="Strategic Insight" className="mt-0">
                <p>
                    The common mask is <strong>{getPatternMask(trap.word, trap.deadly_neighbors)}</strong>.
                    Veterans avoid 'Trap Diving' by playing a separator word (like <em>FLING</em>) to eliminate multiple consonants at once, even if it guarantees a loss of turn.
                </p>
            </InsightCard>
        </div>
    );
}
