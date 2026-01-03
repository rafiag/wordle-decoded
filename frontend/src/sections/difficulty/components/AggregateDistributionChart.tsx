import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { THEME_COLORS } from '../../../theme/colors';
import { GuessDistributionTooltip } from '../../../components/charts/ChartTooltip';
import { AggregateChartData } from '../hooks/useAggregateData';

const GUESS_COLORS = THEME_COLORS.guess;
const LEGEND_ORDER = ['1/6', '2/6', '3/6', '4/6', '5/6', '6/6', 'Failed'];

interface AggregateDistributionChartProps {
    data: AggregateChartData[];
}

export const AggregateDistributionChart = memo(function AggregateDistributionChart({ data }: AggregateDistributionChartProps) {
    const percentageFormatter = (val: number) => `${(val * 100).toFixed(0)}%`;

    return (
        <div className="card !min-h-[280px] md:!min-h-[350px] lg:!min-h-[400px] flex flex-col relative">
            <h3 className="text-lg font-bold mb-4">Overall Distribution</h3>
            <div className="flex-grow relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        stackOffset="expand"
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" opacity={0.3} />
                        <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickFormatter={percentageFormatter} domain={[0, 1]} />
                        <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} width={60} />
                        <Tooltip
                            content={<GuessDistributionTooltip />}
                            isAnimationActive={false}
                            wrapperStyle={{ zIndex: 1000 }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} iconSize={10} />
                        {LEGEND_ORDER.map((key) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                stackId="a"
                                fill={GUESS_COLORS[key as keyof typeof GUESS_COLORS]}
                            >
                                <LabelList
                                    dataKey={`pct_${key}`}
                                    position="center"
                                    style={{
                                        fill: THEME_COLORS.ui.white,
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        opacity: 0.9,
                                        textShadow: '0px 1px 2px rgba(0,0,0,0.5)'
                                    }}
                                />
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
