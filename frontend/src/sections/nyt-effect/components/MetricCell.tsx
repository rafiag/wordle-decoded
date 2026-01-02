import { formatChange, formatValue } from '../utils/formatters';

interface MetricCellProps {
    value: number;
    changePct: number;
    significant: boolean;
    metricType: 'bad-up' | 'good-up';
    decimals?: number;
    suffix?: string;
}

export function MetricCell({
    value,
    changePct,
    significant,
    metricType,
    decimals = 1,
    suffix = ''
}: MetricCellProps) {
    const change = formatChange(changePct, significant, metricType);

    return (
        <td className="metric-value metric-highlight">
            {formatValue(value, decimals)}{suffix}
            <br />
            <span className={`metric-change ${change.colorClass}`}>
                {change.text}
                {change.significant && (
                    <>
                        <br />
                        {change.significant}
                    </>
                )}
            </span>
        </td>
    );
}
