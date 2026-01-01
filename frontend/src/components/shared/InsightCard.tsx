interface InsightCardProps {
    title: string;
    children: React.ReactNode;
}

/**
 * Reusable insight card component for key findings.
 * Features gradient background and cyan accent border.
 */
export default function InsightCard({ title, children, style }: InsightCardProps & { style?: React.CSSProperties }) {
    return (
        <div className="insight-card" style={style}>
            <div className="insight-badge">💡 Key Finding</div>
            <h4 className="insight-title">{title}</h4>
            <div className="insight-content">{children}</div>

            <style>{`
                .insight-card {
                    background: linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
                    border-left: 4px solid var(--accent-cyan);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-top: 2rem;
                }
// ... rest of the file ...

                .insight-badge {
                    display: inline-block;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: var(--accent-cyan);
                    margin-bottom: 0.5rem;
                }

                .insight-title {
                    font-family: 'Space Grotesk', sans-serif;
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.75rem;
                }

                .insight-content {
                    font-size: 0.9375rem;
                    line-height: 1.6;
                    color: var(--text-secondary);
                }

                .insight-content strong {
                    color: var(--accent-cyan);
                    font-weight: 700;
                }

                .insight-content p {
                    margin: 0;
                }

                .insight-content ul {
                    margin: 0;
                    padding-left: 1.5rem;
                }

                .insight-content li {
                    margin-bottom: 0.5rem;
                }

                .insight-content li:last-child {
                    margin-bottom: 0;
                }

                @media (max-width: 768px) {
                    .insight-title {
                        font-size: 1.125rem;
                    }

                    .insight-content {
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </div>
    );
}
