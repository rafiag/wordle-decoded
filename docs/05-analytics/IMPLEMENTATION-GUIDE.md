# Google Analytics Implementation Guide

Step-by-step guide to implement Google Analytics 4 tracking in the Wordle Data Explorer project.

**Measurement ID**: `G-LFM66P2GH9`
**Last Updated**: 2026-01-04

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Basic Setup](#phase-1-basic-setup)
3. [Phase 2: Navigation & Section Tracking](#phase-2-navigation--section-tracking)
4. [Phase 3: Pattern Detective Events](#phase-3-pattern-detective-events)
5. [Phase 4: Word Explorer Events](#phase-4-word-explorer-events)
6. [Phase 5: Filter & Interaction Events](#phase-5-filter--interaction-events)
7. [Phase 6: Footer & Outbound Links](#phase-6-footer--outbound-links)
8. [Phase 7: Performance & Error Tracking](#phase-7-performance--error-tracking)
9. [Phase 8: Testing & Validation](#phase-8-testing--validation)

---

## Prerequisites

- **GA4 Property**: Already created
- **Measurement ID**: `G-LFM66P2GH9`
- **Environment**: Docker Compose development setup
- **Frontend**: React + TypeScript + TanStack React Query

---

## Phase 1: Basic Setup

### Step 1.1: Install react-ga4

```bash
# From host machine (not inside container)
cd "d:\Project\Wordle Exploration"

# Add react-ga4 to frontend dependencies
docker compose exec frontend npm install react-ga4
```

### Step 1.2: Create Environment Variables

Create `.env` files in `frontend/` directory:

**frontend/.env.development**
```bash
# Development - tracking disabled by default
REACT_APP_GA_MEASUREMENT_ID=
```

**frontend/.env.production**
```bash
# Production - tracking enabled
REACT_APP_GA_MEASUREMENT_ID=G-LFM66P2GH9
```

**Add to .gitignore** (if not already there):
```
# Environment files
.env.local
.env.production.local
```

### Step 1.3: Create Analytics Module Structure

```bash
# Create analytics directory structure
docker compose exec frontend mkdir -p src/analytics/hooks
```

### Step 1.4: Create TypeScript Types

**File**: `frontend/src/analytics/types.ts`

```typescript
// Event property types
export interface BaseEventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

// Section names
export type SectionName =
  | 'hero'
  | 'at_a_glance'
  | 'difficulty'
  | 'trap_words'
  | 'sentiment'
  | 'nyt_effect'
  | 'word_highlights'
  | 'pattern_detective';

// Chart names
export type ChartName =
  | 'aggregate_distribution'
  | 'daily_distribution'
  | 'streak'
  | 'sentiment_pie'
  | 'sentiment_timeline'
  | 'trap_leaderboard';

// Event property interfaces
export interface ViewSectionProperties {
  section_name: SectionName;
  scroll_depth: number;
  time_to_view: number;
}

export interface ClickScrollNavProperties {
  target_section: SectionName;
  current_section: SectionName;
  navigation_method: 'scroll_nav';
}

export interface ClickPatternBlockProperties {
  block_position: number;
  old_state: 'wrong' | 'wrong_position' | 'correct';
  new_state: 'wrong' | 'wrong_position' | 'correct';
  total_clicks: number;
}

export interface AnalyzePatternProperties {
  pattern: string;
  num_correct: number;
  num_wrong_position: number;
  num_wrong: number;
  is_default_pattern: boolean;
}

export interface ViewPatternResultsProperties {
  success_rate: number;
  sample_size: number;
  avg_guesses: number;
  has_next_steps: boolean;
  time_to_results: number;
}

export interface PatternAnalysisErrorProperties {
  error_type: 'api_error' | 'no_results' | 'network_error';
  pattern: string;
  error_message: string;
}

export interface StartWordSearchProperties {
  interaction_method: 'click' | 'tab';
}

export interface SearchWordProperties {
  word_length: number;
  search_method: 'enter_key' | 'button_click';
  is_uppercase: boolean;
}

export interface ViewWordResultsProperties {
  word: string;
  difficulty_rating: number;
  success_rate: number;
  avg_guesses: number;
  is_trap_word: boolean;
  trap_score: number | null;
  time_to_results: number;
}

export interface WordSearchErrorProperties {
  error_type: 'invalid_length' | 'invalid_characters' | 'not_found' | 'api_error';
  input_value: string;
  error_message: string;
}

export interface FilterDifficultyProperties {
  chart_name: 'daily_distribution';
  filter_value: 'easy' | 'medium' | 'hard' | 'expert' | 'overall';
  previous_value: 'easy' | 'medium' | 'hard' | 'expert' | 'overall';
}

export interface ToggleRankingProperties {
  table_name: 'top_words' | 'sentiment_words';
  toggle_value: 'hardest' | 'easiest' | 'hated' | 'loved';
  previous_value: 'hardest' | 'easiest' | 'hated' | 'loved';
}

export interface ClickTrapWordProperties {
  word: string;
  trap_score: number;
  neighbor_count: number;
  selection_rank: number;
}

export interface ViewTrapDetailProperties {
  word: string;
  date: string;
  deadly_neighbors_shown: number;
  has_pattern_lock: boolean;
}

export interface ClickFooterLinkProperties {
  link_category: 'data_source' | 'github' | 'license' | 'built_with';
  link_text: string;
  link_url: string;
  is_external: boolean;
}

export interface PageLoadPerformanceProperties {
  load_time_ms: number;
  dom_content_loaded_ms: number;
  performance_rating: 'fast' | 'moderate' | 'slow';
  sections_lazy_loaded: number;
}

export interface ApiErrorProperties {
  endpoint: string;
  error_code: number;
  error_type: 'timeout' | 'network' | 'server_error' | 'not_found';
  retry_count: number;
}

export interface ClientErrorProperties {
  error_message: string;
  error_location: string;
  error_stack_hash: string;
  user_action: string;
}

// User property types
export type EngagementLevel = 'casual' | 'moderate' | 'power_user';
export type PrimaryFeature = 'pattern_detective' | 'word_explorer' | 'chart_browsing' | 'passive_viewer';
export type UserType = 'new' | 'returning' | 'loyal';
```

### Step 1.5: Create GA Initialization Module

**File**: `frontend/src/analytics/ga.ts`

```typescript
import ReactGA from 'react-ga4';
import { BaseEventProperties } from './types';

const isDevelopment = import.meta.env.MODE === 'development';
const measurementId = import.meta.env.REACT_APP_GA_MEASUREMENT_ID;

let isInitialized = false;

/**
 * Initialize Google Analytics
 * Respects Do Not Track headers and only initializes if measurement ID is provided
 */
export const initGA = (): void => {
  // Check if measurement ID is provided
  if (!measurementId) {
    console.log('[GA] No measurement ID provided - tracking disabled');
    return;
  }

  // Respect Do Not Track
  const dntEnabled = navigator.doNotTrack === '1' || (window as any).doNotTrack === '1';

  if (dntEnabled) {
    console.log('[GA] Tracking disabled: Do Not Track enabled');
    return;
  }

  try {
    ReactGA.initialize(measurementId, {
      testMode: isDevelopment,
      gaOptions: {
        anonymizeIp: true,
      },
    });

    isInitialized = true;

    if (isDevelopment) {
      console.log('[GA] Initialized in test mode with ID:', measurementId);
    }
  } catch (error) {
    console.error('[GA] Initialization failed:', error);
  }
};

/**
 * Check if GA is initialized
 */
export const isGAInitialized = (): boolean => {
  return isInitialized;
};

/**
 * Track a custom event
 */
export const trackEvent = (eventName: string, properties?: BaseEventProperties): void => {
  if (isDevelopment) {
    console.log('[GA Event]', eventName, properties);
  }

  if (!isGAInitialized()) {
    if (isDevelopment) {
      console.warn('[GA] Not initialized - event not sent:', eventName);
    }
    return;
  }

  try {
    ReactGA.event(eventName, properties);
  } catch (error) {
    console.error('[GA] Event tracking failed:', error);
  }
};

/**
 * Track a page view
 */
export const trackPageView = (path: string, title?: string): void => {
  if (isDevelopment) {
    console.log('[GA PageView]', path, title);
  }

  if (!isGAInitialized()) {
    return;
  }

  try {
    ReactGA.send({ hitType: 'pageview', page: path, title });
  } catch (error) {
    console.error('[GA] Page view tracking failed:', error);
  }
};

/**
 * Set a user property
 */
export const setUserProperty = (propertyName: string, value: string): void => {
  if (isDevelopment) {
    console.log('[GA User Property]', propertyName, value);
  }

  if (!isGAInitialized()) {
    return;
  }

  try {
    ReactGA.set({ [propertyName]: value });
  } catch (error) {
    console.error('[GA] User property setting failed:', error);
  }
};
```

### Step 1.6: Create Event Tracking Functions

**File**: `frontend/src/analytics/events.ts`

```typescript
import { trackEvent } from './ga';
import type {
  ViewSectionProperties,
  ClickScrollNavProperties,
  ClickPatternBlockProperties,
  AnalyzePatternProperties,
  ViewPatternResultsProperties,
  PatternAnalysisErrorProperties,
  StartWordSearchProperties,
  SearchWordProperties,
  ViewWordResultsProperties,
  WordSearchErrorProperties,
  FilterDifficultyProperties,
  ToggleRankingProperties,
  ClickTrapWordProperties,
  ViewTrapDetailProperties,
  ClickFooterLinkProperties,
  PageLoadPerformanceProperties,
  ApiErrorProperties,
  ClientErrorProperties,
} from './types';

// Navigation & Section Events
export const trackViewSection = (props: ViewSectionProperties) => {
  trackEvent('view_section', props);
};

export const trackClickScrollNav = (props: ClickScrollNavProperties) => {
  trackEvent('click_scroll_nav', props);
};

// Pattern Detective Events
export const trackClickPatternBlock = (props: ClickPatternBlockProperties) => {
  trackEvent('click_pattern_block', props);
};

export const trackAnalyzePattern = (props: AnalyzePatternProperties) => {
  trackEvent('analyze_pattern', props);
};

export const trackViewPatternResults = (props: ViewPatternResultsProperties) => {
  trackEvent('view_pattern_results', props);
};

export const trackPatternAnalysisError = (props: PatternAnalysisErrorProperties) => {
  trackEvent('pattern_analysis_error', props);
};

// Word Explorer Events
export const trackStartWordSearch = (props: StartWordSearchProperties) => {
  trackEvent('start_word_search', props);
};

export const trackSearchWord = (props: SearchWordProperties) => {
  trackEvent('search_word', props);
};

export const trackViewWordResults = (props: ViewWordResultsProperties) => {
  trackEvent('view_word_results', props);
};

export const trackWordSearchError = (props: WordSearchErrorProperties) => {
  trackEvent('word_search_error', props);
};

// Filter & Toggle Events
export const trackFilterDifficulty = (props: FilterDifficultyProperties) => {
  trackEvent('filter_difficulty', props);
};

export const trackToggleRanking = (props: ToggleRankingProperties) => {
  trackEvent('toggle_ranking', props);
};

// Trap Words Events
export const trackClickTrapWord = (props: ClickTrapWordProperties) => {
  trackEvent('click_trap_word', props);
};

export const trackViewTrapDetail = (props: ViewTrapDetailProperties) => {
  trackEvent('view_trap_detail', props);
};

// Outbound Link Events
export const trackClickFooterLink = (props: ClickFooterLinkProperties) => {
  trackEvent('click_footer_link', props);
};

// Performance & Error Events
export const trackPageLoadPerformance = (props: PageLoadPerformanceProperties) => {
  trackEvent('page_load_performance', props);
};

export const trackApiError = (props: ApiErrorProperties) => {
  trackEvent('api_error', props);
};

export const trackClientError = (props: ClientErrorProperties) => {
  trackEvent('client_error', props);
};
```

### Step 1.7: Initialize GA in App

**File**: `frontend/src/App.tsx` (or `main.tsx`)

Add the following at the top of your app initialization:

```typescript
import { useEffect } from 'react';
import { initGA } from './analytics/ga';

function App() {
  useEffect(() => {
    // Initialize Google Analytics on app mount
    initGA();
  }, []);

  // ... rest of your app
}
```

### Step 1.8: Test Basic Setup

```bash
# Rebuild frontend with new dependency
docker compose up --build frontend

# Check browser console for GA initialization message
# Should see: [GA] Initialized in test mode with ID: G-LFM66P2GH9
```

---

## Phase 2: Navigation & Section Tracking

### Step 2.1: Create Section Tracking Hook

**File**: `frontend/src/analytics/hooks/useSectionTracking.ts`

```typescript
import { useEffect, useRef } from 'react';
import { trackViewSection } from '../events';
import type { SectionName } from '../types';

interface UseSectionTrackingOptions {
  sectionName: SectionName;
  threshold?: number; // Percentage of section that must be visible (0-1)
}

/**
 * Hook to track when a section enters the viewport
 * Uses Intersection Observer with configurable threshold
 */
export const useSectionTracking = ({
  sectionName,
  threshold = 0.5, // Default: 50% visible
}: UseSectionTrackingOptions) => {
  const sectionRef = useRef<HTMLElement>(null);
  const hasTracked = useRef(false);
  const pageLoadTime = useRef(Date.now());

  useEffect(() => {
    const element = sectionRef.current;
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
  }, [sectionName, threshold]);

  return sectionRef;
};
```

### Step 2.2: Add Section Tracking to Components

Example for **BoldHeroSection.tsx**:

```typescript
import { useSectionTracking } from '../../analytics/hooks/useSectionTracking';

export const BoldHeroSection = () => {
  const sectionRef = useSectionTracking({ sectionName: 'hero' });

  return (
    <section ref={sectionRef} className="hero-section">
      {/* Your existing hero content */}
    </section>
  );
};
```

Apply to all sections:
- `BoldHeroSection` → `'hero'`
- `BoldAtAGlanceSection` → `'at_a_glance'`
- `DifficultySection` → `'difficulty'`
- `TrapWordsSection` → `'trap_words'`
- `SentimentSection` → `'sentiment'`
- `NYTEffectSection` → `'nyt_effect'`
- `BoldWordHighlightsSection` → `'word_highlights'`
- `BoldPatternsSection` → `'pattern_detective'`

### Step 2.3: Add Scroll Navigation Tracking

**File**: `frontend/src/components/ScrollNav.tsx`

Add tracking to existing click handlers:

```typescript
import { trackClickScrollNav } from '../analytics/events';
import type { SectionName } from '../analytics/types';

// In your ScrollNav component
const handleSectionClick = (targetSection: SectionName) => {
  // Track the navigation event
  trackClickScrollNav({
    target_section: targetSection,
    current_section: currentActiveSection, // Your state variable
    navigation_method: 'scroll_nav',
  });

  // Your existing scroll logic
  scrollToSection(targetSection);
};
```

---

## Phase 3: Pattern Detective Events

### Step 3.1: Track Pattern Block Clicks

**File**: `frontend/src/sections/BoldPatternsSection.tsx`

```typescript
import { useState, useRef } from 'react';
import { trackClickPatternBlock, trackAnalyzePattern, trackViewPatternResults, trackPatternAnalysisError } from '../../analytics/events';

export const BoldPatternsSection = () => {
  const [pattern, setPattern] = useState(['⬜', '🟨', '⬜', '⬜', '🟩']);
  const totalClicksRef = useRef(0);
  const defaultPattern = ['⬜', '🟨', '⬜', '⬜', '🟩'];

  const handleBlockClick = (position: number) => {
    const oldState = getBlockState(pattern[position]);

    // Cycle through states
    const newPattern = [...pattern];
    newPattern[position] = cycleBlockState(pattern[position]);
    setPattern(newPattern);

    const newState = getBlockState(newPattern[position]);
    totalClicksRef.current += 1;

    // Track the block click
    trackClickPatternBlock({
      block_position: position + 1, // 1-indexed
      old_state: oldState,
      new_state: newState,
      total_clicks: totalClicksRef.current,
    });
  };

  const handleAnalyze = async () => {
    const startTime = Date.now();
    const patternString = pattern.join('');

    // Count pattern characteristics
    const num_correct = pattern.filter(b => b === '🟩').length;
    const num_wrong_position = pattern.filter(b => b === '🟨').length;
    const num_wrong = pattern.filter(b => b === '⬜').length;
    const is_default_pattern = pattern.every((b, i) => b === defaultPattern[i]);

    // Track analyze event
    trackAnalyzePattern({
      pattern: patternString,
      num_correct,
      num_wrong_position,
      num_wrong,
      is_default_pattern,
    });

    try {
      // Your existing API call
      const response = await analyzePatternAPI(patternString);
      const timeToResults = Date.now() - startTime;

      // Track successful results
      trackViewPatternResults({
        success_rate: response.success_rate,
        sample_size: response.sample_size,
        avg_guesses: response.avg_guesses,
        has_next_steps: response.next_steps && response.next_steps.length > 0,
        time_to_results: timeToResults,
      });

    } catch (error) {
      // Track error
      trackPatternAnalysisError({
        error_type: determineErrorType(error),
        pattern: patternString,
        error_message: getErrorMessage(error),
      });
    }
  };

  // Helper functions
  const getBlockState = (emoji: string): 'wrong' | 'wrong_position' | 'correct' => {
    if (emoji === '🟩') return 'correct';
    if (emoji === '🟨') return 'wrong_position';
    return 'wrong';
  };

  const cycleBlockState = (current: string): string => {
    if (current === '⬜') return '🟨';
    if (current === '🟨') return '🟩';
    return '⬜';
  };

  const determineErrorType = (error: any): 'api_error' | 'no_results' | 'network_error' => {
    if (error.response?.status === 404) return 'no_results';
    if (error.message?.includes('network')) return 'network_error';
    return 'api_error';
  };

  const getErrorMessage = (error: any): string => {
    return error.response?.data?.message || error.message || 'An error occurred';
  };

  // ... rest of component
};
```

---

## Next Steps

**All phases 1-7 are now complete! Proceed to Phase 8: Testing & Validation**

---

## Phase 8: Testing & Validation

1. **Access DebugView**:
   - Go to GA4 Admin → DebugView
   - Or: https://analytics.google.com/analytics/web/#/a{account-id}/p{property-id}/reports/explorer?params=_u..debugView

2. **Enable Debug Mode** (already enabled via `testMode: true` in development)

3. **Test Events**:
   - Load the dashboard in development mode
   - Check browser console for `[GA Event]` logs
   - Check GA4 DebugView for real-time events (appears within 60 seconds)

4. **Verify Event Properties**:
   - Click on each event in DebugView
   - Verify all properties have correct data types
   - Check for any missing or null values

---

**See**: [GOOGLE-ANALYTICS-PLAN.md](./GOOGLE-ANALYTICS-PLAN.md) for complete event specifications and implementation details.
