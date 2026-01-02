import { memo } from 'react';
import { THEME_COLORS } from '../../../theme/colors';
import { FilterToggle } from '../../../components/shared/FilterToggle';
import { SentimentTopWord } from '../../../types';

const TableRow = memo(({ item, idx }: { item: SentimentTopWord; idx: number }) => (
    <tr className="border-b border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <td className="p-3 text-[var(--accent-cyan)] font-mono">#{idx + 1}</td>
        <td className="p-3 font-bold">{item.target_word}</td>
        <td className="p-3 text-right text-[var(--text-secondary)] font-mono text-sm">{item.date}</td>
        <td className="p-3 text-right font-mono">
            <span
                className="px-2 py-1 rounded text-xs font-bold"
                style={{
                    backgroundColor: (item.difficulty || 0) >= 7 ? THEME_COLORS.sentiment.very_neg : ((item.difficulty || 0) >= 4 ? THEME_COLORS.sentiment.neg : THEME_COLORS.sentiment.pos),
                    color: THEME_COLORS.ui.black
                }}
            >
                {item.difficulty || 0} / 10
            </span>
        </td>
        <td className="p-3 text-right font-mono text-[var(--text-secondary)]">
            {(item.success_rate * 100).toFixed(2)}%
        </td>
        <td className="p-3 text-right font-bold text-[var(--accent-coral)]">
            {(item.frustration * 100).toFixed(2)}%
        </td>
        <td className="p-3 text-right font-bold text-[var(--accent-lime)]">
            {(item.sentiment).toFixed(3)}
        </td>
        <td className="p-3 text-right text-[var(--text-secondary)]">
            {(item.total_tweets).toLocaleString()}
        </td>
    </tr>
));

interface SentimentTableProps {
    words: SentimentTopWord[];
    rankingMode: 'hated' | 'loved';
    onRankingModeChange: (mode: 'hated' | 'loved') => void;
}

export function SentimentTable({ words, rankingMode, onRankingModeChange }: SentimentTableProps) {
    return (
        <div className="card overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">
                    {rankingMode === 'hated' ? 'Most Frustrating Days' : 'Most Loved Days'}
                </h3>
                <FilterToggle
                    options={['hated', 'loved'] as const}
                    value={rankingMode}
                    onChange={onRankingModeChange}
                    activeColor={rankingMode === 'hated' ? 'var(--accent-coral)' : 'var(--accent-lime)'}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Word</th>
                            <th className="p-3 text-right">Date</th>
                            <th className="p-3 text-right">Difficulty</th>
                            <th className="p-3 text-right">Success</th>
                            <th
                                className="p-3 text-right"
                                style={{
                                    color: rankingMode === 'hated' ? 'var(--accent-coral)' : 'inherit',
                                    cursor: 'pointer'
                                }}
                                onClick={() => onRankingModeChange('hated')}
                            >
                                Frustration {rankingMode === 'hated' && '↓'}
                            </th>
                            <th
                                className="p-3 text-right"
                                style={{
                                    color: rankingMode === 'loved' ? 'var(--accent-lime)' : 'inherit',
                                    cursor: 'pointer'
                                }}
                                onClick={() => onRankingModeChange('loved')}
                            >
                                Sentiment {rankingMode === 'loved' && '↓'}
                            </th>
                            <th className="p-3 text-right">Tweets</th>
                        </tr>
                    </thead>
                    <tbody>
                        {words.map((item: SentimentTopWord, idx: number) => (
                            <TableRow key={idx} item={item} idx={idx} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
