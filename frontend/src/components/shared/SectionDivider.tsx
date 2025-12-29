interface SectionDividerProps {
    icon: string;
    title: string;
    id?: string;
}

/**
 * Visual divider between section groups.
 * Shows an icon, title, and decorative line.
 */
export default function SectionDivider({ icon, title, id }: SectionDividerProps) {
    return (
        <div className="section-divider" id={id}>
            <div className="section-divider-line"></div>
            <div className="section-divider-content">
                <span className="section-divider-icon">{icon}</span>
                <h2 className="section-divider-title">{title}</h2>
            </div>
            <div className="section-divider-line"></div>
        </div>
    );
}
