export interface ChangeInfo {
    text: string;
    significant: string;
    colorClass: string;
}

/**
 * Formats change percentage with direction and significance indicators.
 */
export function formatChange(
    value: number,
    significant: boolean,
    metricType: 'bad-up' | 'good-up'
): ChangeInfo {
    const direction = value >= 0 ? 'up' : 'down';
    const absValue = Math.abs(value).toFixed(1);

    if (!significant) {
        return {
            text: `${direction} by ${absValue}%`,
            significant: '',
            colorClass: 'change-neutral'
        };
    }

    // For 'bad-up' metrics (difficulty): up=red, down=green
    // For 'good-up' metrics (success_rate, sentiment, tweets): up=green, down=red
    let colorClass: string;
    if (metricType === 'bad-up') {
        colorClass = value >= 0 ? 'change-negative' : 'change-positive';
    } else {
        colorClass = value >= 0 ? 'change-positive' : 'change-negative';
    }

    return {
        text: `${direction} by ${absValue}%`,
        significant: '✓ statistically significant',
        colorClass
    };
}

/**
 * Formats numeric values with specified decimal places.
 */
export function formatValue(value: number | undefined, decimals: number = 1): string {
    return value !== undefined ? value.toFixed(decimals) : '0.0';
}

/**
 * Formats tweet counts with 'k' suffix.
 */
export function formatTweetCount(value: number | undefined): string {
    return value !== undefined ? `${value.toFixed(1)}k` : '0.0k';
}
