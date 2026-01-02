import { TooltipTerm } from '../../../components/shared/Tooltip';



interface FrustrationMeterProps {
    avgFrustration: number;
    frustrationBreakdown: {
        Easy: number;
        Medium: number;
        Hard: number;
        Expert: number;
    };
}

export function FrustrationMeter({ avgFrustration, frustrationBreakdown }: FrustrationMeterProps) {
    return (
        <div className="card text-center flex flex-col justify-center py-10">
            <h3 className="text-lg font-bold mb-[14px]">
                <TooltipTerm termKey="frustrationIndex">Frustration Index</TooltipTerm>
            </h3>
            <div className="text-6xl font-bold font-mono text-[var(--accent-coral)] mb-6">
                {avgFrustration}%
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto mb-8">
                Percentage of tweets expressing significant annoyance or failure.
            </p>

            <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">Breakdown by Difficulty</div>
                <div className="flex justify-around gap-6 px-2 pt-8">
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] mb-1">Easy</div>
                        <div className="text-xl font-mono font-bold text-[var(--accent-lime)]">{frustrationBreakdown.Easy}%</div>
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] mb-1">Medium</div>
                        <div className="text-xl font-mono font-bold text-[var(--accent-orange)]">{frustrationBreakdown.Medium}%</div>
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] mb-1">Hard</div>
                        <div className="text-xl font-mono font-bold text-[var(--accent-coral)]">{frustrationBreakdown.Hard}%</div>
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] mb-1">Expert</div>
                        <div className="text-xl font-mono font-bold text-[var(--accent-purple)]">{frustrationBreakdown.Expert}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
