import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { THEME_COLORS } from '../../../theme/colors';
import { GuessDistributionTooltip } from '../../../components/charts/ChartTooltip';
import { FilterToggle } from '../../../components/shared/FilterToggle';
import InsightCard from '../../../components/shared/InsightCard';
import { DailyChartDataItem } from '../hooks/useDailyChartData';
import { DifficultyLabel } from '../hooks/useProcessedDifficultyData';

const GUESS_COLORS = THEME_COLORS.guess;

interface DailyDistributionChartProps {
    data: DailyChartDataItem[];
    dailyFilter: 'Overall' | DifficultyLabel;
    onFilterChange: (filter: 'Overall' | DifficultyLabel) => void;
}

export function DailyDistributionChart({ data, dailyFilter, onFilterChange }: DailyDistributionChartProps) {
    return (
        <div className="card h-[450px] flex flex-col col-span-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Daily Guess Distribution (90 Days)</h3>
                <FilterToggle
                    options={['Overall', 'Easy', 'Medium', 'Hard'] as const}
                    value={dailyFilter}
                    onChange={onFilterChange}
                />
            </div>

            <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        stackOffset="expand"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickFormatter={(val: string) => {
                                const d = new Date(val);
                                return `${d.getMonth() + 1}/${d.getDate()}`;
                            }}
                        />
                        <YAxis
                            stroke="var(--text-muted)"
                            fontSize={12}
                            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                            domain={[0, 1]}
                        />
                        <Tooltip content={<GuessDistributionTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {['1/6', '2/6', '3/6', '4/6', '5/6', '6/6', 'Failed'].map((key) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                stackId="a"
                                fill={GUESS_COLORS[key as keyof typeof GUESS_COLORS]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <InsightCard title="Color Shifts Reveal Difficulty Changes">
                <p>
                    Cyan/lime bands shrinking while orange/coral grow marks difficulty transitions. Toggle filters to compare: Easy stacks bottom-heavy, Hard spreads evenly.
                </p>
            </InsightCard>
        </div>
    );
}
