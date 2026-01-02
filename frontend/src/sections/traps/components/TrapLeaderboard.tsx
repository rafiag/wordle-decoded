import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Info } from 'lucide-react';
import { THEME_COLORS } from '../../../theme/colors';
import { TrapTooltip } from '../../../components/charts/ChartTooltip';
import { Trap } from '../../../types';

interface TrapLeaderboardProps {
    traps: Trap[];
    selectedWord: string | null;
    onSelectWord: (word: string) => void;
}

export function TrapLeaderboard({ traps, selectedWord, onSelectWord }: TrapLeaderboardProps) {
    return (
        <div className="card trap-leaderboard">
            <div className="trap-leaderboard-header">
                <h3 className="trap-leaderboard-title">
                    Deadly Leaderboard
                </h3>
            </div>

            <div className="trap-chart-container relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={traps}
                        margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                        barSize={28}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="word"
                            type="category"
                            hide
                        />
                        <Tooltip
                            content={<TrapTooltip />}
                            isAnimationActive={false}
                            wrapperStyle={{ zIndex: 1000 }}
                            cursor={false}
                        />
                        <Bar
                            dataKey="neighbor_count"
                            radius={[0, 6, 6, 0]}
                            activeBar={false}
                            onClick={(data: any) => {
                                if (data && data.payload) {
                                    onSelectWord(data.payload.word);
                                }
                            }}
                            className="cursor-pointer transition-all duration-300"
                        >
                            {traps.map((entry: Trap, index: number) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={selectedWord === entry.word ? 'var(--accent-orange)' : THEME_COLORS.ui.slate}
                                    stroke={selectedWord === entry.word ? 'var(--text-primary)' : 'none'}
                                    strokeWidth={2}
                                />
                            ))}
                            <LabelList
                                dataKey="word"
                                position="insideLeft"
                                style={{ fill: 'var(--text-primary)', fontWeight: 'bold', fontSize: '13px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
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
                <Info className="w-4 h-4" />
                <span>Ranked by number of "Neighbors" (1-letter variance).</span>
            </div>
        </div>
    );
}
