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
    isInverse?: boolean
    format?: (val: number) => string
    testResult?: {
        p_value: number
        significant: boolean
    }
}> = ({ title, before, after, diff, isInverse = false, format = (v) => v.toFixed(2), testResult }) => {
    const isBetter = isInverse ? diff < 0 : diff > 0
    // Color logic: if significant, show green/red. If not significant, maybe show neutral?
    // Current design: Green = Improved, Red = Worsened.
    // If NOT significant, it means the change is likely noise. We should probably tint it less strongly?
    // For now keeping color logic simple but adding the specific badge.

    const colorClass = isBetter ? 'text-green-600' : 'text-red-600'
    const icon = diff > 0 ? '↑' : '↓'

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

            <div className={`pt-3 border-t border-slate-100 flex items-center justify-between`}>
                <span className={`text-sm font-medium ${colorClass}`}>
                    {icon} {Math.abs(diff).toFixed(2)} change
                </span>

                {testResult && (
                    <span className={`text-xs px-2 py-1 rounded ${testResult.significant ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`} title={`p = ${testResult.p_value}`}>
                        {testResult.significant ? 'Significant' : 'Not Sig.'}
                    </span>
                )}
            </div>
        </div>
    )
}

export const NYTComparisonCards: React.FC<NYTComparisonCardsProps> = ({ data }) => {
    if (!data) return null

    const { before, after } = data.summary
    const { tests } = data

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
                title="Avg. Guesses"
                before={before.avg_guesses}
                after={after.avg_guesses}
                diff={data.summary.diff_guesses}
                isInverse={true}
                testResult={tests?.t_test_means}
            />

            <StatCard
                title="Word Difficulty"
                before={before.avg_difficulty}
                after={after.avg_difficulty}
                diff={data.summary.diff_difficulty}
                isInverse={false}
                testResult={tests?.mann_whitney}
            />

            <StatCard
                title="Success Rate"
                before={before.avg_success_rate * 100}
                after={after.avg_success_rate * 100}
                diff={(after.avg_success_rate - before.avg_success_rate) * 100}
                isInverse={false}
                format={(v) => `${v.toFixed(1)}%`}
                testResult={tests?.levene_variance}
            />
        </div>
    )
}
