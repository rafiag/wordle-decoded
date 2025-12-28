import React from 'react'
import type { PatternFlow as PatternFlowType } from '@/types'

interface PatternFlowProps {
    flowData: PatternFlowType[] | null
}

export const PatternFlow: React.FC<PatternFlowProps> = ({ flowData }) => {
    if (!flowData || flowData.length === 0) return null

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Most Likely Next Steps</h3>

            <div className="space-y-4">
                {flowData.map((item, index) => (
                    <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-lg">{item.next_pattern}</span>
                            <span className="text-sm font-medium text-slate-600">
                                {(item.probability * 100).toFixed(1)}%
                            </span>
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${item.probability * 100}%` }}
                            ></div>
                        </div>

                        <div className="text-xs text-slate-400 mt-1">
                            {item.count} games followed this path
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
