import { memo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { THEME_COLORS } from '../../../theme/colors';
import { GuessDistributionTooltip } from '../../../components/charts/ChartTooltip';
import { FilterToggle } from '../../../components/shared/FilterToggle';
import InsightCard from '../../../components/shared/InsightCard';
import { DailyChartDataItem } from '../hooks/useDailyChartData';
import { DifficultyLabel } from '../../../types';
import { trackFilterDifficulty } from '../../../analytics/events';

const GUESS_COLORS = THEME_COLORS.guess;

interface DailyDistributionChartProps {
    data: DailyChartDataItem[];
    dailyFilter: 'Overall' | DifficultyLabel;
    onFilterChange: (filter: 'Overall' | DifficultyLabel) => void;
}

export const DailyDistributionChart = memo(function DailyDistributionChart({ data, dailyFilter, onFilterChange }: DailyDistributionChartProps) {
    const previousFilterRef = useRef<'Overall' | DifficultyLabel>(dailyFilter);

    const handleFilterChange = (newFilter: 'Overall' | DifficultyLabel) => {
        const previousValue = previousFilterRef.current;

        // Track the filter change
        trackFilterDifficulty({
            chart_name: 'daily_distribution',
            filter_value: newFilter.toLowerCase() as 'easy' | 'medium' | 'hard' | 'expert' | 'overall',
            previous_value: previousValue.toLowerCase() as 'easy' | 'medium' | 'hard' | 'expert' | 'overall',
        });

        previousFilterRef.current = newFilter;
        onFilterChange(newFilter);
    };

    return (
        <div className="card !min-h-[500px] md:!min-h-[450px] lg:!min-h-[400px] flex flex-col col-span-2 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h3 className="text-lg font-bold">Daily Guess Distribution <br className="sm:hidden"></br>(Last 90 Days)</h3>
                <div className="w-full sm:w-auto overflow-x-auto">
                    <FilterToggle
                        options={['Overall', 'Easy', 'Medium', 'Hard', 'Expert'] as const}
                        value={dailyFilter}
                        onChange={handleFilterChange}
                        className="min-w-max"
                    />
                </div>
            </div>

            <div className="flex-grow relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        stackOffset="expand"
                        className="md:margin-default"
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
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                            domain={[0, 1]}
                        />
                        <Tooltip
                            content={<GuessDistributionTooltip />}
                            isAnimationActive={false}
                            wrapperStyle={{ zIndex: 1000 }}
                        />
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
});
