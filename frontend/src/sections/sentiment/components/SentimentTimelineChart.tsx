import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LegendPayload } from 'recharts';
import { THEME_COLORS } from '../../../theme/colors';
import { SentimentTooltip } from '../../../components/charts/ChartTooltip';
import InsightCard from '../../../components/shared/InsightCard';
import { SentimentTimelinePoint } from '../../../types';

const V2_COLORS = THEME_COLORS.sentiment;

interface SentimentTimelineChartProps {
    data: SentimentTimelinePoint[];
}

export function SentimentTimelineChart({ data }: SentimentTimelineChartProps) {
    return (
        <div className="card flex flex-col relative !min-h-[280px] md:!min-h-[350px] lg:!min-h-[400px]">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold">Daily Sentiment Trend (Last 90 Days)</h3>
                </div>
            </div>

            <div className="flex-grow relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        stackOffset="expand"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} vertical={false} />
                        <XAxis dataKey="date" hide />
                        <YAxis
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                            domain={[0, 1]}
                        />
                        <Tooltip
                            content={<SentimentTooltip />}
                            isAnimationActive={false}
                            wrapperStyle={{ zIndex: 1000 }}
                        />
                        <Legend
                            iconType="square"
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>{value}</span>}
                            itemSorter={(item: LegendPayload) => {
                                const key = String(item.dataKey || '');
                                const order: { [key: string]: number } = {
                                    'very_neg_count': 0, 'neg_count': 1, 'neu_count': 2, 'pos_count': 3, 'very_pos_count': 4
                                };
                                return order[key] ?? 999;
                            }}
                        />
                        <Bar name="Very Neg" dataKey="very_neg_count" stackId="a" fill={V2_COLORS.very_neg} />
                        <Bar name="Negative" dataKey="neg_count" stackId="a" fill={V2_COLORS.neg} />
                        <Bar name="Neutral" dataKey="neu_count" stackId="a" fill={V2_COLORS.neu} />
                        <Bar name="Positive" dataKey="pos_count" stackId="a" fill={V2_COLORS.pos} />
                        <Bar name="Very Pos" dataKey="very_pos_count" stackId="a" fill={V2_COLORS.very_pos} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <InsightCard title="Pink Spikes Mark Frustrating Days">
                <p>
                    Pink segments spiking above the green-gray baseline mark trap words. The 90-day view shows sentiment trends: greener = positive, more pink/orange = negative.
                </p>
            </InsightCard>
        </div>
    );
}
