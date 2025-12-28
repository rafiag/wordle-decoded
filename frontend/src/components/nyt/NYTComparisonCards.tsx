import React from 'react'
import type { NYTEffectSummary } from '@/types'

interface NYTComparisonCardsProps {
    data: NYTEffectSummary | null
}

const StatCard: React.FC<{
    title: string
    before: number
    after: number
    diff: number
    isInverse?: boolean // If true, lower is better (e.g. difficulty, guesses)
    format?: (val: number) => string
}> = ({ title, before, after, diff, isInverse = false, format = (v) => v.toFixed(2) }) => {
    const isBetter = isInverse ? diff < 0 : diff > 0
    const colorClass = isBetter ? 'text-green-600' : 'text-red-600'
    const icon = diff > 0 ? '↑' : '↓'

    // Neutral checks for small diffs could be added here, but keeping it simple.

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-sm uppercase tracking-wide text-slate-500 font-semibold mb-3">{title}</h3>

            <div className="flex items-end justify-between mb-4">
                <div>
                    <div className="text-xs text-slate-400 mb-1">Before NYT</div>
                    <div className="text-2xl font-bold text-slate-700">{format(before)}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-400 mb-1">After NYT</div>
                    <div className="text-2xl font-bold text-slate-900">{format(after)}</div>
                </div>
            </div>

            <div className={`pt-3 border-t border-slate-100 flex items-center justify-between ${colorClass}`}>
                <span className="text-sm font-medium">
                    {icon} {Math.abs(diff).toFixed(2)} change
                </span>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                    p &lt; 0.05
                </span>
            </div>
        </div>
    )
}

export const NYTComparisonCards: React.FC<NYTComparisonCardsProps> = ({ data }) => {
    if (!data) return null

    const { before, after } = data.summary

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
                title="Avg. Guesses"
                before={before.avg_guesses}
                after={after.avg_guesses}
                diff={data.summary.diff_guesses}
                isInverse={true} // Lower guesses is better (harder = worse usually)
            />

            <StatCard
                title="Word Difficulty"
                before={before.avg_difficulty}
                after={after.avg_difficulty}
                diff={data.summary.diff_difficulty}
                isInverse={false} // Higher difficulty is... harder. "Better" is subjective, but let's assume Harder = Red (User Pain)
            />

            <StatCard
                title="Success Rate"
                before={before.avg_success_rate * 100}
                after={after.avg_success_rate * 100}
                diff={(after.avg_success_rate - before.avg_success_rate) * 100}
                isInverse={false} // Higher success is better
                format={(v) => `${v.toFixed(1)}%`}
            />
        </div>
    )
}
