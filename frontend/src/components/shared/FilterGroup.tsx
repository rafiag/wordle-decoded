interface FilterGroupProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

/**
 * Reusable filter button group (pill style).
 * Used for filtering chart data across sections.
 */
export default function FilterGroup({ options, value, onChange }: FilterGroupProps) {
    return (
        <div className="filter-group">
            {options.map((option) => (
                <button
                    key={option}
                    className={`filter-btn ${value === option ? 'active' : ''}`}
                    onClick={() => onChange(option)}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
