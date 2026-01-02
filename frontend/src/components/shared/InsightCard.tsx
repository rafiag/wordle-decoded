interface InsightCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Reusable insight card component for key findings.
 * Features gradient background and cyan accent border.
 */
export default function InsightCard({ title, children, style, className = '' }: InsightCardProps & { style?: React.CSSProperties }) {
    return (
        <div className={`insight-card ${className}`} style={style}>
            <div className="insight-badge">💡 {title}</div>
            <div className="insight-content">{children}</div>

            <style>{`
                .insight-card {
                    background: linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
                    border-left: 3px solid var(--accent-cyan);
                    border-radius: 8px;
                    padding: 0.75rem 1rem;
                    margin-top: 1rem;
                }

                .insight-badge {
                    display: inline-block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    color: var(--accent-cyan);
                    margin-bottom: 0.5rem;
                }

                .insight-content {
                    font-size: 0.8125rem;
                    line-height: 1.5;
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
                    .insight-content {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
}
