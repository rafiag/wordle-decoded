import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { THEME_COLORS } from '../../../theme/colors';
import InsightCard from '../../../components/shared/InsightCard';
import { StreakChartDataItem } from '../hooks/useStreakData';
import { TooltipProps } from '../../../types';

interface StreakChartProps {
    data: StreakChartDataItem[];
    maxEasyStreak: number;
    maxHardStreak: number;
}

// Extract tooltip to prevent re-creation on each render
function StreakTooltip({ active, payload, label }: TooltipProps<StreakChartDataItem>) {
    if (!active || !payload || !payload.length || !payload[0].payload) return null;

    const data = payload[0].payload;
    const isHard = data.hardStreak !== null;
    const streakCount = isHard ? data.hardStreak : data.easyStreak;
    const type = isHard ? 'Hard' : (data.easyStreak !== null ? 'Easy' : 'Medium');

    if (type === 'Medium') return null;

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded shadow-lg">
            <p className="font-bold text-[var(--text-primary)] mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || 'transparent' }}></span>
                <span className="text-sm">
                    {type} Streak: <span className="font-bold text-white">{streakCount} Days</span>
                </span>
            </div>
        </div>
    );
}

export function StreakChart({ data, maxEasyStreak, maxHardStreak }: StreakChartProps) {
    return (
        <div className="card mb-8 flex flex-col !h-[280px] md:!h-[350px] lg:!h-[400px] relative">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold">Difficulty Streaks (Last 90 Days)</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Visualize the momentum of consecutive Easy vs. Hard days.</p>
                </div>
                <div className="flex gap-6 mt-1">
                    <div className="text-right">
                        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Longest Hard Streak</div>
                        <div className="text-2xl font-bold text-[var(--accent-coral)]">{maxHardStreak} Days</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Longest Easy Streak</div>
                        <div className="text-2xl font-bold text-[var(--accent-lime)]">{maxEasyStreak} Days</div>
                    </div>
                </div>
            </div>

            <div className="flex-grow relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                            }}
                        />
                        <YAxis stroke="var(--text-secondary)" fontSize={12} allowDecimals={false} />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            content={<StreakTooltip />}
                            isAnimationActive={false}
                            wrapperStyle={{ zIndex: 1000 }}
                        />
                        <Legend />
                        <Bar
                            name="Hard Streak"
                            dataKey="hardStreak"
                            fill={THEME_COLORS.guess.Failed}
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                        <Bar
                            name="Easy Streak"
                            dataKey="easyStreak"
                            fill={THEME_COLORS.guess['2/6']}
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <InsightCard title="Extremes are Rare: Expert vs. Easy">
                <p>
                    Data reveals that "Expert" challenges (~6%) and "Easy" relief (~5%) are equally rare. The vast majority of gameplay (88%) resides in the Medium-to-Hard spectrum, indicating that Wordle maintains a high skill floor with only occasional spikes of extreme intensity.
                </p>
            </InsightCard>
        </div>
    );
}
