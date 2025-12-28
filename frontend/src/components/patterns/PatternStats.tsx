import React from 'react'
import type { PatternStats as PatternStatsType } from '@/types'

interface PatternStatsProps {
    stats: PatternStatsType | null
}

export const PatternStats: React.FC<PatternStatsProps> = ({ stats }) => {
    if (!stats) return null

    // Transform data for simple visualization if needed
    // For now, we'll just display metrics cards and maybe a gauge later

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Success Rate</div>
                <div className="text-3xl font-bold text-green-600">
                    {(stats.success_rate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400 mt-2">
                    Rank #{stats.rank}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Avg. Guesses</div>
                <div className="text-3xl font-bold text-blue-600">
                    {stats.avg_guesses.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                    Expected completion
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Occurrences</div>
                <div className="text-3xl font-bold text-slate-700">
                    {stats.count.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                    Times seen in analysis
                </div>
            </div>
        </div>
    )
}
