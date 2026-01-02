import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LegendPayload } from 'recharts';
import { SENTIMENT_COLORS_ARRAY } from '../../../theme/colors';
import { SentimentDistributionItem } from '../hooks/useSentimentDistribution';
import { TooltipProps } from '../../../types';

const PIE_COLORS = SENTIMENT_COLORS_ARRAY;

const PieTooltip = ({ active, payload }: TooltipProps<SentimentDistributionItem>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const percentage = data.total ? ((data.value / data.total) * 100).toFixed(2) : '0.00';

        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded shadow-lg">
                <p className="font-bold text-[var(--text-primary)] mb-1">{data.name}</p>
                <div className="text-sm space-y-1">
                    <div className="text-[var(--text-secondary)]">
                        Count: <span className="text-[var(--text-primary)] font-mono ml-1">{data.value.toLocaleString()}</span>
                    </div>
                    <div className="text-[var(--text-secondary)]">
                        Proportion: <span className="text-[var(--accent-cyan)] font-mono ml-1">{percentage}%</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

interface SentimentPieChartProps {
    data: SentimentDistributionItem[];
}

export function SentimentPieChart({ data }: SentimentPieChartProps) {
    return (
        <div className="card !min-h-[280px] md:!min-h-[350px] lg:!min-h-[400px] flex flex-col relative">
            <h3 className="text-lg font-bold mb-4">Sentiment Distribution</h3>
            <div className="flex-grow min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 40, right: 10, bottom: 10, left: 10 }}>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-(midAngle || 0) * RADIAN);
                                const y = cy + radius * Math.sin(-(midAngle || 0) * RADIAN);

                                if ((percent || 0) < 0.05) return null;

                                return (
                                    <text
                                        x={x}
                                        y={y}
                                        fill="white"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            pointerEvents: 'none',
                                            textShadow: '0px 0px 2px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        {`${((percent || 0) * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="rgba(0,0,0,0.5)" />
                            ))}
                        </Pie>
                        <Tooltip
                            content={<PieTooltip />}
                            isAnimationActive={false}
                            wrapperStyle={{ zIndex: 1000 }}
                        />
                        <Legend
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '20px', paddingBottom: '20px' }}
                            formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>{value}</span>}
                            itemSorter={(item: LegendPayload) => {
                                const order: { [key: string]: number } = {
                                    'Very Neg': 0, 'Negative': 1, 'Neutral': 2, 'Positive': 3, 'Very Pos': 4
                                };
                                return order[String(item.value)] ?? 999;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
