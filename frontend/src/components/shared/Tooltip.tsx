import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TOOLTIPS } from '../../constants/tooltips';

interface TooltipProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export function Tooltip({ title, description, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; arrowOffset: number }>({ top: 0, left: 0, arrowOffset: 0 });
    const [position, setPosition] = useState<'top' | 'bottom'>('top');
    const triggerRef = useRef<HTMLDivElement>(null);

    // Calculate position on hover
    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const TOOLTIP_WIDTH = 288; // w-72 = 18rem = 288px
            const GAP = 4; // Reduced gap to 4px compact view

            // Calculate center point
            const center = rect.left + rect.width / 2;

            // Calculate theoretical left position (centered)
            let left = center - TOOLTIP_WIDTH / 2;

            // Clamp to viewport edges (with 16px padding)
            const maxLeft = window.innerWidth - TOOLTIP_WIDTH - 16;
            left = Math.max(16, Math.min(left, maxLeft));

            // Check vertical space (150px threshold for top)
            let top: number;
            let pos: 'top' | 'bottom';
            let arrowOffset = 0; // Arrow needs to track the trigger center relative to the tooltip

            if (rect.top < 150) {
                // Show below
                pos = 'bottom';
                top = rect.bottom + GAP;
            } else {
                // Show above
                pos = 'top';
                top = rect.top - GAP;
            }

            // Calculate arrow offset relative to the tooltip container
            // center (trigger center) - left (tooltip left edge) gives the x-coordinate of the center within the tooltip
            arrowOffset = center - left;

            setCoords({ top, left, arrowOffset });
            setPosition(pos);
        }
    }, [isVisible]);

    const tooltipContent = (
        <div
            className={`
                fixed p-3 w-72
                bg-[#18181b] border border-[var(--border-color)] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)]
                transition-all duration-200 pointer-events-none z-[9999]
                ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
            `}
            style={{
                top: coords.top,
                left: coords.left,
                // Only vertical translation for animation
                transform: `translateY(${isVisible
                    ? '0'
                    : position === 'top' ? '4px' : '-4px'
                    }) ${position === 'top' ? 'translateY(-100%)' : ''}`
            }}
        >
            {/* Arrow */}
            <div
                className={`
                    absolute w-3 h-3
                    bg-[#18181b] border-r border-b border-[var(--border-color)]
                    rotate-45
                    z-10
                    ${position === 'top' ? '-bottom-[7px] border-l-0 border-t-0' : '-top-[7px] border-r-0 border-b-0'}
                `}
                style={{
                    left: coords.arrowOffset, // Dynamic arrow positioning
                    borderColor: 'var(--border-color)',
                    transform: 'translateX(-50%) rotate(45deg)' // Re-apply rotate and center arrow on its point
                }}
            />

            <div className="relative z-20">
                <h4 className="text-sm font-bold text-[var(--accent-gold)] mb-1 uppercase tracking-wider">
                    {title}
                </h4>
                <p className="text-sm text-gray-100 leading-relaxed font-medium">
                    {description}
                </p>
            </div>
        </div>
    );

    return (
        <>
            <div
                className="relative inline-block"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                ref={triggerRef}
            >
                {children}
            </div>
            {createPortal(tooltipContent, document.body)}
        </>
    );
}

interface TooltipTermProps {
    termKey: keyof typeof TOOLTIPS;
    children?: React.ReactNode;
    className?: string;
}

export function TooltipTerm({ termKey, children, className = '' }: TooltipTermProps) {
    const info = TOOLTIPS[termKey];

    if (!info) return <>{children}</>;

    return (
        <Tooltip title={info.title} description={info.description}>
            <span className={`cursor-help border-b-2 border-dotted border-white/50 hover:border-[var(--accent-gold)] transition-colors ${className}`}>
                {children || info.title}
            </span>
        </Tooltip>
    );
}
