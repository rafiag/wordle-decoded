import { Target } from 'lucide-react';
import InsightCard from '../../../components/shared/InsightCard';
import { Trap } from '../../../types';
import { TrapPatternLock } from './TrapPatternLock';
import { getPatternMask } from '../utils/patternUtils';

interface TrapDetailCardProps {
    trap: Trap;
}

export function TrapDetailCard({ trap }: TrapDetailCardProps) {
    return (
        <div className="trap-detail-card">
            <div className="trap-detail-glow"></div>

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
