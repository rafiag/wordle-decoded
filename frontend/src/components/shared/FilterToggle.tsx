/**
 * Reusable filter toggle button group component
 * Used across sections for consistent filtering UI
 */

interface FilterToggleProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  activeColor?: string;
  className?: string;
}

export function FilterToggle<T extends string>({
  options,
  value,
  onChange,
  activeColor = 'var(--accent-cyan)',
  className = '',
}: FilterToggleProps<T>) {
  return (
    <div className={`flex bg-[var(--bg-primary)] rounded p-1 gap-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-3 py-1 text-xs font-bold rounded transition-colors ${value === option
              ? 'text-black'
              : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          style={value === option ? { backgroundColor: activeColor } : undefined}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
