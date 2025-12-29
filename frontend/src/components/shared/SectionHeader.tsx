interface SectionHeaderProps {
    badge: string;      // e.g., "🎯 Analysis"
    title: string;
    description: string;
}

/**
 * Reusable section header with badge, title, and description.
 * Used across all dashboard sections for consistent styling.
 */
export default function SectionHeader({ badge, title, description }: SectionHeaderProps) {
    return (
        <div className="section-header">
            <div className="section-badge">{badge}</div>
            <h2 className="section-title">{title}</h2>
            <p className="section-description">{description}</p>
        </div>
    );
}
