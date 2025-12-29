import { useState, ReactNode } from 'react';

interface AccordionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

/**
 * Reusable accordion component for collapsible content.
 * Used primarily for technical sections on each page.
 */
export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="wordle-card border border-gray-200">
            <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <span
                    className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                >
                    ▼
                </span>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-4 pt-0 border-t border-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
