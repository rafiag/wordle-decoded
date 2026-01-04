import { useEffect, useRef } from 'react';
import { trackViewSection } from '../events';
import type { SectionName } from '../types';

interface UseSectionTrackingOptions {
  sectionName: SectionName;
  sectionId?: string; // Optional: defaults to using sectionName as ID
  threshold?: number; // Percentage of section that must be visible (0-1)
}

/**
 * Hook to track when a section enters the viewport
 * Uses Intersection Observer with existing section IDs
 * No need for refs - automatically finds sections by ID
 */
export const useSectionTracking = ({
  sectionName,
  sectionId,
  threshold = 0.5, // Default: 50% visible
}: UseSectionTrackingOptions) => {
  const hasTracked = useRef(false);
  const pageLoadTime = useRef(Date.now());

  useEffect(() => {
    // sectionName now directly matches HTML element IDs
    const elementId = sectionId || sectionName;
    const element = document.getElementById(elementId);

    if (!element || hasTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            hasTracked.current = true;

            const timeToView = Math.round((Date.now() - pageLoadTime.current) / 1000);
            const scrollDepth = Math.round(
              (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            trackViewSection({
              section_name: sectionName,
              scroll_depth: scrollDepth,
              time_to_view: timeToView,
            });
          }
        });
      },
      {
        threshold,
        rootMargin: '0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [sectionName, sectionId, threshold]);
};
