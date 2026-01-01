import { useState, useEffect } from 'react';

// Sections definition matches the migration plan
const SECTIONS = [
    { id: 'at-a-glance', label: 'At a Glance' },
    { id: 'difficulty', label: 'Difficulty' },
    { id: 'sentiment', label: 'Sentiment' },
    { id: 'nyt-effect', label: 'NYT Effect' },
    { id: 'word-highlights', label: 'Word Highlights' },
    { id: 'pattern', label: 'Pattern' },
];

export default function ScrollNav({ containerId }: { containerId?: string }) {
    const [activeSection, setActiveSection] = useState<string>('');

    // Track active section based on scroll position
    useEffect(() => {
        const getContainer = () => containerId ? document.getElementById(containerId) : window;
        const container = getContainer();

        const handleScroll = () => {
            const isWindow = !containerId;
            const scrollY = isWindow ? window.scrollY : (container as HTMLElement).scrollTop;
            const height = isWindow ? window.innerHeight : (container as HTMLElement).clientHeight;

            // Find the section that is currently most visible in the viewport
            // Match logic from mockup: scrollPosition = scrollY + height / 2 (center of viewport)
            const scrollPosition = scrollY + height / 2;
            const sections = SECTIONS.map(s => ({
                id: s.id,
                element: document.getElementById(s.id)
            }));

            let current = '';

            for (const { id, element } of sections) {
                if (element) {
                    const top = element.offsetTop;
                    const elHeight = element.offsetHeight;

                    if (scrollPosition >= top && scrollPosition < top + elHeight) {
                        current = id;
                        break; // Found the active section
                    }
                }
            }

            // If no section matched but we are near bottom, maybe select last? 
            // Or if we are near top? For now stick to mockup logic.

            if (current) setActiveSection(current);
        };

        if (container) {
            container.addEventListener('scroll', handleScroll);
            handleScroll(); // Check on mount
        }

        return () => container?.removeEventListener('scroll', handleScroll);
    }, [containerId]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        const container = containerId ? document.getElementById(containerId) : window;

        if (element && container) {
            if (containerId) {
                // Element scrolling
                const containerEl = container as HTMLElement;
                const top = element.offsetTop - 80; // 80px buffer
                containerEl.scrollTo({ top, behavior: 'smooth' });
            } else {
                // Window scrolling
                const y = element.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

    // Calculate progress for the line fill
    const activeIndex = SECTIONS.findIndex(s => s.id === activeSection);
    const progressScale = activeIndex === -1 ? 0 : activeIndex / (SECTIONS.length - 1);

    return (
        <nav
            className="scroll-nav"
            style={{
                '--progress-scale': progressScale
            } as React.CSSProperties}
        >
            {SECTIONS.map((section, index) => {
                const isActive = activeSection === section.id;
                const isViewed = activeSection && SECTIONS.findIndex(s => s.id === activeSection) > index;

                return (
                    <div
                        key={section.id}
                        className={`scroll-nav-item ${isActive ? 'active' : ''} ${isViewed ? 'viewed' : ''}`}
                        onClick={() => scrollToSection(section.id)}
                    >
                        {/* Dot */}
                        <div className="nav-dot" />

                        {/* Label (Always visible now) */}
                        <div className="nav-label">
                            {section.label}
                        </div>
                    </div>
                );
            })}
        </nav>
    );
}
