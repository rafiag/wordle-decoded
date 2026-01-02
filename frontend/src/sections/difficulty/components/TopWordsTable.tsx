import { THEME_COLORS } from '../../../theme/colors';
import { FilterToggle } from '../../../components/shared/FilterToggle';
import type { WordRanking } from '../../../types';

interface TopWordsTableProps {
    words: WordRanking[];
    rankingMode: 'easiest' | 'hardest';
    onRankingModeChange: (mode: 'easiest' | 'hardest') => void;
}

export function TopWordsTable({ words, rankingMode, onRankingModeChange }: TopWordsTableProps) {
    return (
        <div className="card overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">
                    {rankingMode === 'hardest' ? 'Top 5 Hardest Words' : 'Top 5 Easiest Words'}
                </h3>
                <FilterToggle
                    options={['hardest', 'easiest'] as const}
                    value={rankingMode}
                    onChange={onRankingModeChange}
                    activeColor={rankingMode === 'hardest' ? 'var(--accent-cyan)' : 'var(--accent-lime)'}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Word</th>
                            <th className="p-3 text-right">Date</th>
                            <th className="p-3 text-right">Avg Guesses</th>
                            <th className="p-3 text-right transition-colors" style={{ color: rankingMode === 'hardest' ? 'var(--accent-coral)' : (rankingMode === 'easiest' ? 'var(--accent-lime)' : 'inherit') }}>
                                Difficulty {rankingMode === 'hardest' ? '↓' : (rankingMode === 'easiest' && '↑')}
                            </th>
                            <th className="p-3 text-right">Success</th>
                        </tr>
                    </thead>
                    <tbody>
                        {words.slice(0, 5).map((word: WordRanking, idx: number) => (
                            <tr key={idx} className="border-b border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                <td className="p-3 text-[var(--accent-cyan)] font-mono">#{idx + 1}</td>
                                <td className="p-3 font-bold">{word.word}</td>
                                <td className="p-3 text-right text-[var(--text-secondary)] font-mono text-sm">{word.date}</td>
                                <td className="p-3 text-right font-mono text-[var(--accent-cyan)] font-bold">
                                    {word.avg_guess_count?.toFixed(2)}
                                </td>
                                <td className="p-3 text-right font-mono">
                                    <span
                                        className="px-2 py-1 rounded text-xs font-bold"
                                        style={{
                                            backgroundColor: word.difficulty_rating >= 7 ? THEME_COLORS.guess.Failed : (word.difficulty_rating >= 4 ? THEME_COLORS.guess['5/6'] : THEME_COLORS.guess['2/6']),
                                            color: THEME_COLORS.ui.black
                                        }}
                                    >
                                        {word.difficulty_rating} / 10
                                    </span>
                                </td>
                                <td className="p-3 text-right font-mono text-[var(--text-secondary)]">
                                    {(word.success_rate * 100).toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
