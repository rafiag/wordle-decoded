import React, { useState } from 'react'

interface PatternInputProps {
    onPatternSubmit: (pattern: string) => void
    isLoading?: boolean
}

type Color = 'G' | 'Y' | 'X' // Green, Yellow, Gray (using X for Gray/Absent)

export const PatternInput: React.FC<PatternInputProps> = ({ onPatternSubmit, isLoading }) => {
    const [pattern, setPattern] = useState<Color[]>(['X', 'X', 'X', 'X', 'X'])

    const toggleColor = (index: number) => {
        const nextColor: Record<Color, Color> = {
            'X': 'Y',
            'Y': 'G',
            'G': 'X'
        }
        const newPattern = [...pattern]
        newPattern[index] = nextColor[pattern[index]]
        setPattern(newPattern)
    }

    const getEmojiPattern = () => {
        const map: Record<Color, string> = {
            'G': '🟩',
            'Y': '🟨',
            'X': '⬜'
        }
        return pattern.map(c => map[c]).join('')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onPatternSubmit(getEmojiPattern())
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Input Pattern</h3>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
                <div className="flex gap-2">
                    {pattern.map((color, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => toggleColor(index)}
                            className={`
                w-12 h-12 rounded md:w-16 md:h-16 flex items-center justify-center text-2xl
                transition-colors duration-200 border-2
                ${color === 'G' ? 'bg-green-600 border-green-700 hover:bg-green-500' : ''}
                ${color === 'Y' ? 'bg-yellow-500 border-yellow-600 hover:bg-yellow-400' : ''}
                ${color === 'X' ? 'bg-slate-200 border-slate-300 hover:bg-slate-300' : ''}
              `}
                            aria-label={`Toggle color for position ${index + 1}`}
                        >
                            {color === 'G' && '🟩'}
                            {color === 'Y' && '🟨'}
                            {color === 'X' && '⬜'}
                        </button>
                    ))}
                </div>

                <div className="text-sm text-slate-500">
                    Click squares to toggle: <span className="inline-block w-3 h-3 bg-slate-200 border border-slate-300 mx-1"></span> Gray
                    → <span className="inline-block w-3 h-3 bg-yellow-500 mx-1"></span> Yellow
                    → <span className="inline-block w-3 h-3 bg-green-600 mx-1"></span> Green
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Pattern'}
                </button>
            </form>
        </div>
    )
}
