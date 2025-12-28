import React from 'react'
import type { NYTTimelinePoint } from '@/types'
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine
} from 'recharts'

interface NYTTimelineProps {
    data: NYTTimelinePoint[] | null
}

export const NYTTimeline: React.FC<NYTTimelineProps> = ({ data }) => {
    if (!data || data.length === 0) return null

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">Performance Timeline</h3>
                <p className="text-sm text-slate-500">
                    Average guess count over time. Vertical line marks the NYT acquisition.
                </p>
            </div>

            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            minTickGap={50}
                        />
                        <YAxis
                            yAxisId="left"
                            domain={[3, 5]}
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Avg Guesses', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="top" />

                        <ReferenceLine x="2022-02-10" stroke="red" strokeDasharray="3 3" label="NYT Acquisition" />

                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="avg_guesses"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={false}
                            name="Avg Guesses"
                            activeDot={{ r: 6 }}
                        />

                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="difficulty"
                            stroke="#fbbf24"
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Difficulty Score"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
