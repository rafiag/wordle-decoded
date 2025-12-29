interface StatCardProps {
    icon: string;       // Emoji
    value: string | number;
    label: string;
    variant?: 'green' | 'yellow' | 'gray' | 'red';
    isLoading?: boolean;
}

/**
 * Hero stat card with icon, value, and label.
 * Used in the hero section for overview statistics.
 */
export default function StatCard({
    icon,
    value,
    label,
    variant = 'green',
    isLoading = false,
}: StatCardProps) {
    const variantClasses = {
        green: 'stat-card-green',
        yellow: 'stat-card-yellow',
        gray: 'stat-card-gray',
        red: 'stat-card-red',
    };

    if (isLoading) {
        return (
            <div className={`stat-card ${variantClasses[variant]}`}>
                <div className="stat-icon">{icon}</div>
                <div className="stat-value skeleton" style={{ width: '80px', height: '2.5rem', margin: '0 auto' }}>&nbsp;</div>
                <div className="stat-label">{label}</div>
            </div>
        );
    }

    return (
        <div className={`stat-card ${variantClasses[variant]}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}
