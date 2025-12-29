/**
 * Formats a number to a specified number of decimal places with thousand separators.
 * Uses en-US locale for consistent comma (thousands) and dot (decimal) separators.
 */
export const formatDecimal = (value: number | undefined | null, precision: number = 2): string => {
    if (value === undefined || value === null || isNaN(value)) {
        return '---';
    }

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
    }).format(value);
};

/**
 * Formats an integer with thousand separators.
 */
export const formatInteger = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) {
        return '---';
    }

    return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0
    }).format(value);
};

/**
 * Formats a percentage value (0.123 -> "12.30%")
 */
export const formatPercent = (value: number | undefined | null, precision: number = 2): string => {
    if (value === undefined || value === null || isNaN(value)) {
        return '---%';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision
    }).format(value);
};

/**
 * Formats large numbers with M/K suffixes (e.g., 1.2M, 45K)
 * only if they are significantly large, otherwise uses full format with commas.
 */
export const formatCompact = (num: number | undefined | null, threshold: number = 10000000): string => {
    if (num === undefined || num === null || isNaN(num)) {
        return '---';
    }

    if (num >= threshold) {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 1
        }).format(num);
    }

    if (num % 1 !== 0) return formatDecimal(num, 2);
    return formatInteger(num);
};
