import { type ReactNode } from 'react';

interface ContentCardProps {
    header?: ReactNode;
    subheader?: string;
    tooltip?: string;
    children: ReactNode;
    variant?: 'default' | 'interactive' | 'comparison';
    filterButtons?: ReactNode;
    className?: string;
}

/**
 * Unified card component with consistent styling.
 * Supports header, tooltip trigger, and different variants.
 */
export default function ContentCard({
    header,
    subheader,
    tooltip,
    children,
    variant = 'default',
    filterButtons,
    className = '',
}: ContentCardProps) {
    const variantClasses = {
        default: 'content-card',
        interactive: 'content-card interactive-card',
        comparison: 'content-card comparison-card',
    };

    return (
        <div className={`${variantClasses[variant]} ${className}`}>
            {(header || filterButtons) && (
                <div className="card-header">
                    <div>
                        {header && (typeof header === 'string' ? <h3>{header}</h3> : header)}
                        {subheader && <p className="card-description">{subheader}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {filterButtons}
                        {tooltip && <div className="tooltip-trigger">{tooltip}</div>}
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}
