interface PageHeaderProps {
    title: string;
    description: string;
    icon?: string;
}

/**
 * Reusable page header component for consistent page titles and descriptions.
 */
export default function PageHeader({ title, description, icon }: PageHeaderProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                {icon && <span className="text-5xl">{icon}</span>}
                {title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl">
                {description}
            </p>
        </div>
    );
}
