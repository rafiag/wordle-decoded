import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import { statsApi } from '../services/api';

// Type Definitions
interface DifficultyStat {
    date: string;
    difficulty: number;
}

interface DistributionStat {
    date: string;
    guess_1: number;
    guess_2: number;
    guess_3: number;
    guess_4: number;
    guess_5: number;
    guess_6: number;
    failed: number;
    word_solution: string;
}

type DifficultyLabel = 'Easy' | 'Medium' | 'Hard' | 'Unknown';

interface ProcessedDay extends DistributionStat {
    difficulty: number;
    difficultyLabel: DifficultyLabel;
}

interface AggregateBucket {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    fail: number;
    total: number;
}

interface AggregateChartData {
    name: string;
    '1/6': number;
    '2/6': number;
    '3/6': number;
    '4/6': number;
    '5/6': number;
    '6/6': number;
    'Failed': number;
    'pct_1/6': string;
    'pct_2/6': string;
    'pct_3/6': string;
    'pct_4/6': string;
    'pct_5/6': string;
    'pct_6/6': string;
    'pct_Failed': string;
}

interface DailyChartDataItem {
    date: string;
    '1/6': number;
    '2/6': number;
    '3/6': number;
    '4/6': number;
    '5/6': number;
    '6/6': number;
    'Failed': number;
    difficultyLabel: DifficultyLabel;
    word_solution: string;
}

interface StreakChartDataItem {
    date: string;
    easyStreak: number | null;
    hardStreak: number | null;
    difficultyLabel: DifficultyLabel;
}

interface WordRanking {
    word: string;
    date: string;
    avg_guess_count: number;
    difficulty_rating: number;
    success_rate: number;
}

// Recharts Tooltip Payload Type
interface TooltipPayloadEntry {
    value: number;
    name: string;
    color: string;
    payload: {
        word_solution?: string;
        [key: string]: unknown; // For other properties like guess counts
    };
}

// Guess Colors

const GUESS_COLORS = {
    '1/6': '#00d9ff', // Cyan (Very Pos)
    '2/6': '#00ff88', // Lime (Pos)
    '3/6': '#33B277', // Muted Green (Pos -> Neu)
    '4/6': '#666666', // Muted Grey (Neu) - Pivot
    '5/6': '#ffa500', // Orange (Neg)
    '6/6': '#FF884E', // Coral Orange (Neg -> Very Neg)
    'Failed': '#ff6b9d' // Coral (Very Neg)
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) => {
    if (active && payload && payload.length) {
        // Calculate total for percentage display
        const total = payload.reduce((sum: number, entry: TooltipPayloadEntry) => sum + (entry.value || 0), 0);

        const data = payload[0].payload;
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded shadow-lg min-w-[200px]">
                <p className="font-bold text-[var(--text-primary)] mb-1">{label}</p>

                {/* Extra Info */}
                <div className="mb-3 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-2">
                    <div className="flex justify-between">
                        <span>Solution:</span>
                        <span className="font-bold text-[var(--text-primary)] uppercase">{data.word_solution || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span>Total data:</span>
                        <span className="font-mono text-[var(--text-primary)]">{total.toLocaleString()}</span>
                    </div>
                </div>

                {payload.map((entry: TooltipPayloadEntry, index: number) => {
                    const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
                    return (
                        <div key={index} className="text-sm flex justify-between gap-4">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-mono text-[var(--text-primary)]">
                                {percentage}%
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

// Fixed legend order for charts
const LEGEND_ORDER = ['1/6', '2/6', '3/6', '4/6', '5/6', '6/6', 'Failed'];

export default function BoldDifficultySection() {
    // 1. Fetch Data
    const { data: difficultyStats, isLoading: statsLoading } = useQuery<DifficultyStat[]>({
        queryKey: ['difficultyStats'],
        queryFn: statsApi.getDifficultyStats,
    });

    const { data: distributions, isLoading: distLoading } = useQuery<DistributionStat[]>({
        queryKey: ['distributions', 2000],
        queryFn: () => statsApi.getDistributions(2000),
    });

    // State
    const [dailyFilter, setDailyFilter] = useState<'Overall' | DifficultyLabel>('Overall'); // Overall, Easy, Medium, Hard
    const [rankingMode, setRankingMode] = useState<'easiest' | 'hardest'>('hardest');

    // 2. Process Data
    const processedData = useMemo<ProcessedDay[] | null>(() => {
        if (!difficultyStats || !distributions) return null;

        // Create a map of date -> difficulty
        const difficultyMap = new Map<string, number>();
        difficultyStats.forEach((p: DifficultyStat) => {
            difficultyMap.set(p.date, p.difficulty);
        });

        // Join data
        const joined = distributions.map((d: DistributionStat) => {
            const diff = difficultyMap.get(d.date);
            let difficultyLabel: DifficultyLabel = 'Unknown';
            if (diff !== undefined) {
                if (diff <= 3) difficultyLabel = 'Easy';
                else if (diff <= 6) difficultyLabel = 'Medium';
                else if (diff > 6) difficultyLabel = 'Hard';
            }

            return {
                ...d,
                difficulty: diff || 0, // Default to 0 if not found, though it should be
                difficultyLabel
            };
        });

        // Sort by date desc for recent checks, asc for charts usually
        const sortedByDate = [...joined].sort((a: ProcessedDay, b: ProcessedDay) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sortedByDate;
    }, [difficultyStats, distributions]);

    // Chart 1 Data: Aggregate Guess Distribution breakdown (Horizontal Stacked Bar)
    const aggregateData = useMemo<AggregateChartData[]>(() => {
        if (!processedData) return [];

        const buckets: { [key in 'Overall' | DifficultyLabel]: AggregateBucket } = {
            Overall: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
            Easy: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
            Medium: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
            Hard: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 },
            Unknown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0, total: 0 }, // Include Unknown for completeness
        };

        processedData.forEach((day: ProcessedDay) => {
            const addStats = (bucket: AggregateBucket) => {
                bucket[1] += day.guess_1;
                bucket[2] += day.guess_2;
                bucket[3] += day.guess_3;
                bucket[4] += day.guess_4;
                bucket[5] += day.guess_5;
                bucket[6] += day.guess_6;
                bucket.fail += day.failed;
                // Calculate total for this bucket
                bucket.total += (day.guess_1 + day.guess_2 + day.guess_3 + day.guess_4 + day.guess_5 + day.guess_6 + day.failed);
            };

            addStats(buckets.Overall);
            if (day.difficultyLabel === 'Easy') addStats(buckets.Easy);
            else if (day.difficultyLabel === 'Medium') addStats(buckets.Medium);
            else if (day.difficultyLabel === 'Hard') addStats(buckets.Hard);
            else addStats(buckets.Unknown);
        });

        // Transform for Recharts (Y-Axis: Difficulty, X-Axis: Guess Counts Stacked)
        const categories: ('Overall' | DifficultyLabel)[] = ['Overall', 'Easy', 'Medium', 'Hard'];

        // Use raw counts with stackOffset="expand" for proper 100% stacking
        const result: AggregateChartData[] = categories.map(cat => {
            const bucket = buckets[cat];

            // Create object with properties in fixed order to ensure Legend displays correctly
            const row: Record<string, string | number> = { name: cat };
            LEGEND_ORDER.forEach(key => {
                const numKey = key === 'Failed' ? 'fail' : parseInt(key.split('/')[0]) as 1 | 2 | 3 | 4 | 5 | 6;
                const count = key === 'Failed' ? bucket.fail : bucket[numKey];
                row[key] = count; // Use raw counts, not percentages

                // Calculate percentage for label
                const pct = bucket.total > 0 ? (count / bucket.total * 100) : 0;
                // Only show label if percentage > 10% to avoid clutter
                row[`pct_${key}`] = pct > 10 ? `${pct.toFixed(0)}%` : '';
            });

            return row as unknown as AggregateChartData;
        });

        return result;
    }, [processedData]);

    // Chart 2 Data: Daily Stacked Bar (Last 90 days)
    const dailyChartData = useMemo<DailyChartDataItem[]>(() => {
        if (!processedData || processedData.length === 0) return [];

        // Filter last 90 days relative to the latest data point
        // processedData is already sorted ASC by date
        const lastDate = new Date(processedData[processedData.length - 1].date);

        const cutoff = new Date(lastDate);
        cutoff.setDate(cutoff.getDate() - 90);

        const recent = processedData.filter((d: ProcessedDay) => new Date(d.date) >= cutoff);

        // Filter by toggle
        const filtered = dailyFilter === 'Overall'
            ? recent
            : recent.filter((d: ProcessedDay) => d.difficultyLabel === dailyFilter);

        return filtered.map((d: ProcessedDay) => ({
            date: d.date,
            '1/6': d.guess_1,
            '2/6': d.guess_2,
            '3/6': d.guess_3,
            '4/6': d.guess_4,
            '5/6': d.guess_5,
            '6/6': d.guess_6,
            'Failed': d.failed,
            difficultyLabel: d.difficultyLabel,
            word_solution: d.word_solution
        }));
    }, [processedData, dailyFilter]);

    // Chart 3: Streak Data (Last 90 Days)
    const { streakChartData, maxEasyStreak, maxHardStreak } = useMemo(() => {
        if (!processedData || processedData.length === 0) return { streakChartData: [], maxEasyStreak: 0, maxHardStreak: 0 };

        // Filter last 90 days relative to the latest data point
        const lastDate = new Date(processedData[processedData.length - 1].date);
        const cutoff = new Date(lastDate);
        cutoff.setDate(cutoff.getDate() - 90);

        const recent = processedData.filter((d: ProcessedDay) => new Date(d.date) >= cutoff);

        let currentEasy = 0;
        let currentHard = 0;
        let maxEasy = 0;
        let maxHard = 0;

        const data: StreakChartDataItem[] = recent.map((d: ProcessedDay) => {
            const isEasy = d.difficultyLabel === 'Easy';
            const isHard = d.difficultyLabel === 'Hard';

            if (isEasy) {
                currentEasy++;
                currentHard = 0;
            } else if (isHard) {
                currentHard++;
                currentEasy = 0;
            } else {
                currentEasy = 0;
                currentHard = 0;
            }

            maxEasy = Math.max(maxEasy, currentEasy);
            maxHard = Math.max(maxHard, currentHard);

            return {
                date: d.date,
                easyStreak: currentEasy > 0 ? currentEasy : null, // Use null to hide 0 bars
                hardStreak: currentHard > 0 ? currentHard : null,
                difficultyLabel: d.difficultyLabel
            };
        });

        return { streakChartData: data, maxEasyStreak: maxEasy, maxHardStreak: maxHard };
    }, [processedData]);

    // Fetch lists for rankings separately to ensure we have Words
    const { data: topHardest } = useQuery<WordRanking[]>({
        queryKey: ['hardestWords'],
        queryFn: () => statsApi.getHardestWords(10),
    });

    const { data: topEasiest } = useQuery<WordRanking[]>({
        queryKey: ['easiestWords'],
        queryFn: () => statsApi.getEasiestWords(10),
    });

    // Chart 3: Top Words Data
    const topWords = useMemo<WordRanking[]>(() => {
        if (rankingMode === 'hardest') return topHardest || [];
        return topEasiest || [];
    }, [rankingMode, topHardest, topEasiest]);

    if (statsLoading || distLoading) {
        return <div className="p-8 text-center text-[var(--text-secondary)]">Loading difficulty data...</div>;
    }

    // Helper for X-Axis tick formatting (stackOffset="expand" uses 0-1 scale)
    const percentageFormatter = (val: number) => `${(val * 100).toFixed(0)}% `;

    return (
        <section id="difficulty" className="mb-20 pt-10">
            <div className="section-header">
                <h2 className="section-title">Difficulty & Distribution</h2>
                <p className="section-description">
                    Analyze how difficulty affects guess distribution and global performance.
                </p>
            </div>

            {/* Row 1: Charts (1/3 and 2/3 split) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                {/* Chart 1: Aggregate Distribution */}
                <div style={{ gridColumn: 'span 1' }} className="card h-[450px] flex flex-col">
                    <h3 className="text-lg font-bold mb-4">Overall Distribution</h3>
                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={aggregateData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                stackOffset="expand"
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" opacity={0.3} />
                                <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickFormatter={percentageFormatter} domain={[0, 1]} />
                                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={60} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} iconSize={10} />
                                {LEGEND_ORDER.map((key) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        stackId="a"
                                        fill={GUESS_COLORS[key as keyof typeof GUESS_COLORS]}
                                    >
                                        <LabelList
                                            dataKey={`pct_${key} `}
                                            position="center"
                                            style={{
                                                fill: '#FFFFFF', // White text for adherence to design system
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                opacity: 0.9,
                                                textShadow: '0px 1px 2px rgba(0,0,0,0.5)' // Add shadow for legibility on light bars
                                            }}
                                        />
                                    </Bar>
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Daily Distribution */}
                <div style={{ gridColumn: 'span 2' }} className="card h-[450px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Daily Guess Distribution (90 Days)</h3>
                        <div className="flex bg-[var(--bg-primary)] rounded-lg p-1 gap-1">
                            {['Overall', 'Easy', 'Medium', 'Hard'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setDailyFilter(filter as 'Overall' | DifficultyLabel)}
                                    className={`px-3 py-1 text-xs font-bold rounded transition-colors ${dailyFilter === filter
                                        ? 'bg-[var(--accent-cyan)] text-black'
                                        : 'text-[var(--text-secondary)] hover:text-white'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-grow">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dailyChartData}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                stackOffset="expand"
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--text-secondary)"
                                    fontSize={12}
                                    tickFormatter={(val: string) => {
                                        const d = new Date(val);
                                        return `${d.getMonth() + 1}/${d.getDate()}`;
                                    }}
                                />
                                < YAxis
                                    stroke="var(--text-muted)"
                                    fontSize={12}
                                    tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                                    domain={[0, 1]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                {
                                    ['1/6', '2/6', '3/6', '4/6', '5/6', '6/6', 'Failed'].map((key) => (
                                        <Bar
                                            key={key}
                                            dataKey={key}
                                            stackId="a"
                                            fill={GUESS_COLORS[key as keyof typeof GUESS_COLORS]}
                                        />
                                    ))
                                }
                            </BarChart >
                        </ResponsiveContainer >
                    </div >
                </div >
            </div >

            {/* Row 2: Streak Chart (Full width) */}
            < div className="card mb-8 h-[450px] flex flex-col" >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold">Difficulty Streaks (Last 90 Days)</h3>
                        <p className="text-sm text-[var(--text-secondary)]">Visualize the momentum of consecutive Easy vs. Hard days.</p>
                    </div>
                    <div className="flex gap-6 mt-1">
                        <div className="text-right">
                            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Longest Hard Streak</div>
                            <div className="text-2xl font-bold" style={{ color: '#FF6B9D' }}>{maxHardStreak} Days</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Longest Easy Streak</div>
                            <div className="text-2xl font-bold" style={{ color: '#00FF88' }}>{maxEasyStreak} Days</div>
                        </div>
                    </div>
                </div>

                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={streakChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                stroke="var(--text-secondary)"
                                fontSize={12}
                                tickFormatter={(val) => {
                                    const d = new Date(val);
                                    return `${d.getMonth() + 1}/${d.getDate()}`;
                                }}
                            />
                            <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const isHard = data.hardStreak !== null;
                                        const streakCount = isHard ? data.hardStreak : data.easyStreak;
                                        const type = isHard ? 'Hard' : (data.easyStreak !== null ? 'Easy' : 'Medium');

                                        if (type === 'Medium') return null;

                                        return (
                                            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded shadow-lg">
                                                <p className="font-bold text-[var(--text-primary)] mb-1">{label}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }}></span>
                                                    <span className="text-sm">
                                                        {type} Streak: <span className="font-bold text-white">{streakCount} Days</span>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Bar
                                name="Hard Streak"
                                dataKey="hardStreak"
                                fill="#FF6B9D"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                            <Bar
                                name="Easy Streak"
                                dataKey="easyStreak"
                                fill="#00FF88"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div >

            {/* Row 2: Top Words Table (Full width) */}
            < div className="card overflow-hidden" >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">
                        {rankingMode === 'hardest' ? 'Top 5 Hardest Words' : 'Top 5 Easiest Words'}
                    </h3>
                    <div className="flex gap-2 bg-[var(--bg-primary)] p-1 rounded-lg">
                        <button
                            onClick={() => setRankingMode('hardest')}
                            className={`px-4 py-1 rounded text-sm font-bold transition-all ${rankingMode === 'hardest'
                                ? 'bg-[var(--accent-cyan)] text-black'
                                : 'text-[var(--text-secondary)] hover:text-white'
                                }`}
                        >
                            Hardest
                        </button>
                        <button
                            onClick={() => setRankingMode('easiest')}
                            className={`px-4 py-1 rounded text-sm font-bold transition-all ${rankingMode === 'easiest'
                                ? 'bg-[var(--accent-lime)] text-black'
                                : 'text-[var(--text-secondary)] hover:text-white'
                                }`}
                        >
                            Easiest
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                                <th className="p-3 text-left">Word</th>
                                <th className="p-3 text-right">Date</th>
                                <th className="p-3 text-right">Avg Guesses</th>
                                <th className="p-3 text-right transition-colors" style={{ color: rankingMode === 'hardest' ? 'var(--accent-coral)' : (rankingMode === 'easiest' ? 'var(--accent-lime)' : 'inherit') }}>
                                    Difficulty {rankingMode === 'hardest' ? '↓' : (rankingMode === 'easiest' && '↑')}
                                </th>
                                <th className="p-3 text-right">Success Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topWords.slice(0, 5).map((word: WordRanking, idx: number) => (
                                <tr key={idx} className="border-b border-[var(--border-color)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <td className="p-3 font-bold text-lg">{word.word}</td>
                                    <td className="p-3 text-right text-[var(--text-secondary)] font-mono">{word.date}</td>
                                    <td className="p-3 text-right font-mono text-[var(--accent-cyan)] font-bold">
                                        {word.avg_guess_count?.toFixed(2)}
                                    </td>
                                    <td className="p-3 text-right font-mono">
                                        <span
                                            className="px-2 py-1 rounded text-xs font-bold"
                                            style={{
                                                backgroundColor: word.difficulty_rating >= 7 ? '#FF6B9D' : (word.difficulty_rating >= 4 ? '#FFA500' : '#00FF88'),
                                                color: '#000'
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
            </div >
        </section >
    );
}
