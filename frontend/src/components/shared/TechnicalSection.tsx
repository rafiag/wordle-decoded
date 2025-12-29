import Accordion from './Accordion';

interface TechnicalContent {
    subtitle: string;
    description: string;
}

interface TechnicalSectionProps {
    title: string;
    content: TechnicalContent[];
    defaultOpen?: boolean;
}

/**
 * Template for technical content sections using the Accordion component.
 * Displays methodology and technical details in a collapsible format.
 */
export default function TechnicalSection({ title, content, defaultOpen = false }: TechnicalSectionProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <Accordion title={title} defaultOpen={defaultOpen}>
                <div className="space-y-6">
                    {content.map((item, index) => (
                        <div key={index}>
                            <h4 className="text-md font-bold text-gray-900 mb-2">{item.subtitle}</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </Accordion>
        </div>
    );
}
