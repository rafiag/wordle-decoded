import React, { useEffect, useState } from 'react'
import ChartContainer from '@/components/shared/ChartContainer'
import { statsApi } from '@/services/api'
import type { Trap } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TrapsPage: React.FC = () => {
    const [traps, setTraps] = useState<Trap[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchTraps()
    }, [])

    const fetchTraps = async () => {
        try {
            const data = await statsApi.getTopTraps()
            setTraps(data)
        } catch (err) {
            setError('Failed to load trap analysis data')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading trap analysis...</div>
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Trap Pattern Analysis</h1>
                <p className="text-lg text-gray-600">
                    Identify words that look simple but are deadly because of their many similar neighbors (e.g., _IGHT words).
                </p>
            </div>

            <ChartContainer
                title="Top 20 Trap Words"
                description="Words with the highest 'Trap Score' (high neighbor count + low frequency)."
            >
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={traps} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="word"
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                height={60}
                            />
                            <YAxis label={{ value: 'Trap Score', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f3f4f6' }}
                            />
                            <Bar dataKey="trap_score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </ChartContainer>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {traps.map((trap, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-bold text-gray-900">{trap.word}</h3>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-amber-500">{trap.trap_score.toFixed(1)}</span>
                                <span className="text-xs text-gray-500 uppercase font-semibold">Trap Score</span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <span className="font-semibold">{trap.neighbor_count} Deadly Neighbors</span> (differ by 1 letter):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {trap.deadly_neighbors.map((neighbor) => (
                                    <span
                                        key={neighbor}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                                    >
                                        {neighbor}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {trap.date && (
                            <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                                Appeared on: {trap.date}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrapsPage
