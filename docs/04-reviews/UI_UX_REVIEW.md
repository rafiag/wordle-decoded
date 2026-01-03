# UI/UX Comprehensive Review: Wordle Data Explorer

> [!NOTE]
> **Status Update (Jan 2026):** The color palette decision in this review (returning to Wordle brand colors) was subsequently **superseded** by the **Bold Data Noir** theme (Cyan/Lime/Coral/Purple). Please refer to `docs/04-design/design-system.md` for the current active design system.

**Date:** 2025-12-29
**Status:** Implementation Decisions Made
**Reviewers:** UI/UX Designer Agent, Frontend Developer Agent, User Feedback

---

## Implementation Decisions (Updated 2025-12-29)

### Scope Clarifications
- **MVP Features:** All complete (1.3, 1.4, 1.5, 1.6, 1.7, 1.9)
- **Keyboard Navigation:** Removed from project scope - browser defaults sufficient for target audience
- **Advanced Chart Interactions:** Click-to-pin, keyboard arrow navigation not in scope

### Key Decisions
1. **Color Palette (HIGH-1):** ✅ **APPROVED - Revert to Wordle brand colors**
   - Switch from blue/orange to Wordle green (#6aaa64), yellow (#c9b458), gray (#787c7e)
   - Implement with **Single Source of Truth (SSOT)** pattern for easy future updates
   - Add accessibility patterns (icons, line styles) for color-blind users
   - Centralize all colors in theme configuration

2. **Navigation Architecture (CRITICAL-1):** ✅ **APPROVED - Single-Page Dashboard**
   - Convert multi-page tabs to single scrollable page
   - Implement after immediate bug fixes
   - Use Intersection Observer for progressive loading

3. **Technical Terminology (CRITICAL-3):** ✅ **APPROVED - Simplify language**
   - Two-tier system: plain language primary + technical tooltips
   - Implement across all chart titles and descriptions

### Updated Timeline
- **Week 1:** Critical fixes + color migration + plain language content (5 days)
- **Week 2:** Mobile responsiveness + design system (5 days)
- **Week 3:** UX enhancements + basic accessibility (7 days)

---

---

## Executive Summary

This document consolidates feedback from user testing, UI/UX design analysis, and technical frontend review. The current implementation demonstrates strong technical foundations (React + TypeScript + React Query) with clean component architecture. However, **three critical issues** require immediate attention:

1. **Architecture Mismatch:** Multi-page tab navigation vs. user preference for single-page scrollable dashboard
2. **CSS Bug:** Active navbar element text color matches background, causing visibility issues
3. **Technical Terminology:** Chart titles and descriptions use jargon that blocks non-technical users from understanding insights

**Overall Scores:**
- Code Quality: 7/10
- User Experience: 6/10
- Accessibility: 5/10
- Maintainability: 8/10

---

## Table of Contents

1. [User Feedback (Primary Source)](#1-user-feedback-primary-source)
2. [Critical Issues](#2-critical-issues)
3. [High Priority Issues](#3-high-priority-issues)
4. [Medium Priority Issues](#4-medium-priority-issues)
5. [Low Priority Enhancements](#5-low-priority-enhancements)
6. [Technical Recommendations](#6-technical-recommendations)
7. [Accessibility Audit](#7-accessibility-audit)
8. [Performance Analysis](#8-performance-analysis)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Strengths to Preserve](#10-strengths-to-preserve)

---

## 1. User Feedback (Primary Source)

### Issue 1.1: Too Many Tabs
**User Quote:** "There are too many tabbing, I prefer if the site is shown in single page with separate sections"

**Current State:**
- 8 separate routes with React Router (Home + 7 features)
- Traditional multi-page app (MPA) with client-side routing
- Each feature requires clicking through navigation tabs

**User Impact:**
- Breaks dashboard "at-a-glance" experience
- Requires multiple clicks to see related insights
- Loses context when switching between features
- Feels like separate tools rather than cohesive dashboard

**User Expectation:**
- Single-page layout with smooth scrolling
- All content accessible in one continuous flow
- Scroll-spy navigation or anchor links for jumping to sections
- Maintain context while exploring different features

---

### Issue 1.2: Active Navbar Color Bug
**User Quote:** "Active element on navbar text have same color as background color"

**Current State:**
- Active nav links use `bg-wordle-green text-white` classes
- CSS conflict from global styles in `index.css` overrides text color
- Links are `<a>` tags with global style: `a { color: #646cff; }`

**Root Cause:**
```css
/* d:\Project\Wordle Exploration\frontend\src\index.css line 18 */
a {
  color: #646cff;  /* Overrides Tailwind's text-white */
}
```

This global link style overrides the component-specific `text-white` class due to CSS specificity.

**Technical Detail:**
- File: `frontend/src/components/layout/Header.tsx` lines 42-45
- The Tailwind class is applied correctly, but global CSS wins the specificity battle

**Visual Impact:**
- Active tab is difficult to distinguish from inactive tabs
- User doesn't know which page they're on
- Poor navigation feedback

---

### Issue 1.3: Technical Chart Descriptions
**User Quote:** "Many of the chart is too technical, I prefer to have more less technical description so non-technical user can still understand, we can add tooltip or separate info section for the technical terms"

**Examples of Technical Jargon:**

| Current (Too Technical) | Audience Impact |
|-------------------------|-----------------|
| "Correlation between word rarity (x) and guess count (y)" | Non-technical users don't understand "correlation" |
| "Top Anomalies by Magnitude (Z-Score)" | "Z-Score" is statistics jargon |
| "Sentiment vs Difficulty Correlation" | Assumes understanding of sentiment scoring |
| "Distribution Trend (Last 30 Days)" | "Distribution" is vague |
| "Frustration Index" | Term not defined anywhere |
| "Statistically significant deviations" | Academic language |

**User-Friendly Alternatives:**

| Technical | Plain Language | Optional Technical Detail |
|-----------|---------------|---------------------------|
| "Correlation between word rarity (x) and guess count (y)" | "Rare Words vs. Player Performance" | Tooltip: "Statistical correlation analysis" |
| "Top Anomalies by Magnitude (Z-Score)" | "Weirdest Wordle Days" | Tooltip: "Ranked by Z-score (statistical significance)" |
| "Sentiment vs Difficulty Correlation" | "Did Hard Puzzles Make People Angry?" | Tooltip: "Comparing sentiment scores with difficulty ratings" |
| "Distribution Trend (Last 30 Days)" | "How Most People Solve Wordle" | Tooltip: "Guess distribution over time" |

**Target Audience Reminder:**
- **Primary:** General Wordle enthusiasts (non-technical)
- **Secondary:** Recruiters/hiring managers (may not be data scientists)
- **Tertiary:** Technical evaluators (can access detailed info via tooltips)

---

## 2. Critical Issues

### CRITICAL-1: Navigation Architecture Redesign
**Priority:** CRITICAL
**Effort:** High (3-5 days)
**User Impact:** High

**Problem:**
The current multi-page tab structure conflicts with dashboard UX best practices and user expectations. Users want to scroll through insights, not click through separate pages.

**Current Implementation:**
- React Router with 8 separate routes
- File: `frontend/src/App.tsx` lines 28-37
- Each feature is a standalone page component

**Three Architectural Options:**

#### Option A: True Single-Page Dashboard ⭐ RECOMMENDED
**Pros:**
- All data visible at a glance (dashboard best practice)
- Natural scroll-based exploration
- No loading delays between sections
- Better storytelling flow for data insights
- Matches user expectation

**Cons:**
- Heavier initial load (mitigate with lazy loading)
- No deep linking (mitigate with anchor links)
- All charts render at once (mitigate with Intersection Observer)

**Implementation Steps:**
1. Convert page components (`DifficultyPage`, etc.) to section components
2. Remove React Router routes (keep only `HashRouter` for anchors)
3. Create single Dashboard page that imports all sections
4. Implement Intersection Observer for progressive chart loading
5. Add scroll-spy navigation (sticky sidebar or top nav)
6. Use anchor links (#difficulty, #patterns) for sharing specific sections
7. Load critical data first (overview stats), defer feature-specific data

**Example Structure:**
```tsx
<Dashboard>
  <HeroSection />
  <OverviewStats />
  <DifficultySection />  {/* Lazy loads when scrolled into view */}
  <DistributionSection />
  <PatternsSection />
  {/* ... */}
</Dashboard>
```

#### Option B: Hybrid Approach
Keep React Router but make navigation feel seamless:
- Use hash routing (#/difficulty) instead of history routing
- Add "View All Dashboard" option to load all sections on one page
- Implement smooth scrolling transitions between routes
- Keep individual routes for deep linking capability
- Add mini-previews of adjacent features in sidebar

#### Option C: Enhanced Tab UX
Keep current architecture but improve discoverability:
- Add breadcrumb navigation showing progress through features
- Add "Next Feature" / "Previous Feature" buttons
- Show mini-previews of other features in sidebar
- Create "Dashboard Overview" page with all feature summaries

**Recommendation:**
Start with **Option A (Single-Page)** for MVP audience (general users). The target audience values exploration over deep-linking, and recruiters expect to see a dashboard, not a multi-tool suite.

---

### CRITICAL-2: Navbar Active State CSS Bug
**Priority:** CRITICAL
**Effort:** Low (30 minutes)
**User Impact:** High

**Problem:**
Active navigation link text is not visible due to CSS conflict between global link styles and Tailwind utility classes.

**Files Affected:**
- `frontend/src/index.css` (global link color override)
- `frontend/src/components/layout/Header.tsx` lines 42-45

**Root Cause:**
```css
/* index.css line 18 - Leftover from Vite template */
a {
  color: #646cff;  /* Global style wins over Tailwind's text-white */
}
```

**Three Fix Options:**

#### Fix Option 1: Remove Conflicting Global CSS ⭐ RECOMMENDED
Delete or comment out the global `a` style in `index.css`. This file appears to be leftover from the Vite template and contains dark mode styles that conflict with the Wordle theme.

**Action:**
1. Review `frontend/src/index.css` lines 1-68
2. Identify which styles are actually needed (likely none)
3. Move essential styles to `frontend/src/styles/index.css` (the custom Wordle theme file)
4. Delete `index.css` or rename to `index-old.css` and remove import

#### Fix Option 2: Increase Specificity
Add `!important` to the active link class (not recommended, but quick):
```tsx
className={`... ${isActive(link.path)
  ? 'bg-wordle-green !text-white'
  : 'text-gray-700 hover:bg-gray-100'
}`}
```

#### Fix Option 3: Use Inline Styles
Replace the conditional className with inline styles for active links.

**Additional Enhancement:**
Beyond fixing the bug, improve active tab visual indicator:
- Add bottom border or top border to active tab
- Add subtle shadow or background intensity difference
- Ensure WCAG AA contrast ratio (4.5:1 minimum for text)

**Testing Checklist:**
- [ ] Active tab text is visible on white background
- [ ] Active tab stands out when scanning navigation
- [ ] Inactive tabs are clearly distinguishable
- [ ] Mobile navigation has same fix applied (lines 61-64 in Header.tsx)

---

### CRITICAL-3: Technical Terminology Barrier
**Priority:** CRITICAL
**Effort:** Medium (2-3 days for all charts)
**User Impact:** High

**Problem:**
Chart titles, axis labels, and descriptions use technical jargon that prevents the primary audience (general Wordle enthusiasts) from understanding insights.

**Affected Components:**

#### DifficultyPage.tsx
- Line 59: "Avg guesses (blue) vs Difficulty Score (orange) over time"
  - **Issue:** "Difficulty Score" not explained, axis labels in description instead of legend
- Line 79: "Correlation between word rarity (x) and guess count (y)"
  - **Issue:** "Correlation" + math notation (x/y) assumes technical knowledge
- Line 105-106: Table header "Difficulty" shows "8.5/10" with no context
  - **Issue:** User doesn't know what scale means or how it's calculated

#### DistributionPage.tsx
- Line 45: "Distribution Trend (Last 30 Days)"
  - **Issue:** "Distribution" is vague
- Line 45: "Stacked view of the percentage of players solving in 1-6 guesses"
  - **Issue:** "Stacked view" assumes chart literacy

#### SentimentPage.tsx
- Line 40: "Sentiment vs Difficulty Correlation"
  - **Issue:** "Sentiment" scoring methodology not explained
- Line 41: "Comparing Daily Sentiment (Line) with Average Guesses (Bar)"
  - **Issue:** Technical description of chart mechanics vs. what insight to derive
- Y-axis: "Sentiment Score" ranges from -1 to +1 with no legend
  - **Issue:** User doesn't know what negative vs. positive means

#### OutliersPage.tsx
- Line 93: "Top Anomalies by Magnitude (Z-Score)"
  - **Issue:** "Anomalies," "Magnitude," and "Z-Score" all require statistics knowledge
- Line 101: Y-axis label "Z-Score"
  - **Issue:** Unexplained statistical metric
- Line 94: "The most statistically significant deviations from normal tweet volume"
  - **Issue:** Academic language

#### PatternsPage.tsx
- Pattern input has no examples or format explanation
- Results show "Success Rate: 67.8%" but don't explain what this means
- "Try Wordle 500 (ROBOT)" is helpful, but only one example

**Solution Framework:**

#### Two-Tier Content System
1. **Primary Title:** Plain language, engaging, curiosity-driven
2. **Subtitle/Tooltip:** Technical details for data enthusiasts and recruiters

#### Implementation Plan

**Step 1: Update ChartContainer Component**
Modify `frontend/src/components/shared/ChartContainer.tsx` to support:
```tsx
interface ChartContainerProps {
  title: string              // Plain language
  subtitle?: string          // Technical details
  description?: string       // Current prop
  helpText?: string          // NEW: Tooltip with methodology
  helpIcon?: boolean         // NEW: Show ℹ️ icon
  // ...
}
```

**Step 2: Create Plain Language Mapping**

| Component | Current Title | New Title | Subtitle | Help Text |
|-----------|--------------|-----------|----------|-----------|
| DifficultyPage (Timeline) | "Avg guesses (blue) vs Difficulty Score (orange) over time" | "How Puzzle Difficulty Changed Over Time" | "Average guesses vs. calculated difficulty score" | "Difficulty combines word rarity with letter patterns. Higher scores = harder puzzles." |
| DifficultyPage (Scatter) | "Correlation between word rarity (x) and guess count (y)" | "Rare Words vs. Player Performance" | "Word frequency correlation analysis" | "Rare words (right side) tend to take more guesses. Each dot is a puzzle." |
| DistributionPage | "Distribution Trend (Last 30 Days)" | "How Most People Solve Wordle" | "Guess distribution over time" | "Shows what percentage of players solved in 1, 2, 3, 4, 5, or 6 guesses." |
| SentimentPage | "Sentiment vs Difficulty Correlation" | "Did Hard Puzzles Make People Angry?" | "Sentiment correlation with difficulty" | "Sentiment measures tweet tone (-1 = frustrated, +1 = celebratory)." |
| OutliersPage | "Top Anomalies by Magnitude (Z-Score)" | "Weirdest Wordle Days" | "Ranked by statistical significance" | "Z-score measures how unusual the puzzle was. Higher = more tweets than expected." |

**Step 3: Add Tooltip Icons**
- Place ℹ️ icon next to technical terms
- Tooltip appears on hover/click
- Tooltip content explains methodology in 1-2 sentences

**Step 4: Add "How to Read This Chart" Expandable Sections**
Below each chart, add collapsible section:
```
[▼ How to Read This Chart]
- The horizontal axis shows...
- The vertical axis shows...
- Each dot/bar represents...
- Look for patterns like...
```

**Step 5: Provide Example Insights**
Add callout boxes with example findings:
```
💡 Insight: The word "KHAKI" on June 22 had the highest difficulty score (9.2/10)
because it's a rare word with uncommon letter patterns.
```

**Testing Criteria:**
- [ ] Non-technical user can understand primary title within 3 seconds
- [ ] Technical details available on-demand via tooltip/subtitle
- [ ] Each chart has at least one example insight highlighted
- [ ] Axis labels use everyday language
- [ ] Scales and ranges are explained (e.g., "1-6 guesses" instead of just "Guesses")

---

## 3. High Priority Issues

### HIGH-1: Color Palette Revert to Wordle Brand
**Priority:** HIGH
**Effort:** Medium (1-2 days)
**User Impact:** Medium
**Status:** ✅ **APPROVED FOR IMPLEMENTATION**

**Problem:**
Current color scheme uses blue (#0284c7) and orange (#d97706) instead of Wordle's signature green (#6aaa64) and yellow (#c9b458). While the intention (color-blind accessibility) is commendable, it sacrifices brand recognition.

**Current Palette:**
- Green: #0284c7 (actually sky blue) - tailwind.config.js line 9
- Yellow: #d97706 (orange) - line 10
- Gray: #6b7280 - line 11

**Wordle Brand Colors (Target):**
- Green: #6aaa64
- Yellow: #c9b458
- Gray: #787c7e

**Decision:**
User has approved reverting to Wordle brand colors with requirement for **Single Source of Truth (SSOT)** implementation to enable easy future updates.

**Implementation Plan - SSOT Approach:**

1. **Create Centralized Theme File** (`frontend/src/theme/colors.ts`):
```typescript
// Single Source of Truth for all color definitions
export const wordleColors = {
  // Brand colors
  green: '#6aaa64',
  yellow: '#c9b458',
  gray: '#787c7e',

  // Chart colors (using brand palette)
  primary: '#6aaa64',      // Green for primary data
  secondary: '#c9b458',    // Yellow for secondary data
  neutral: '#787c7e',      // Gray for neutral/disabled

  // Semantic colors
  success: '#6aaa64',
  warning: '#c9b458',
  error: '#dc2626',        // Red for errors
  info: '#0284c7',         // Blue for informational
} as const;

// Chart palette for multiple series
export const chartPalette = [
  wordleColors.primary,
  wordleColors.secondary,
  wordleColors.neutral,
  wordleColors.info,
];

// Type-safe color access
export type WordleColor = typeof wordleColors[keyof typeof wordleColors];
```

2. **Update Tailwind Config** (`frontend/tailwind.config.js`):
```javascript
import { wordleColors } from './src/theme/colors';

export default {
  theme: {
    extend: {
      colors: {
        'wordle-green': wordleColors.green,
        'wordle-yellow': wordleColors.yellow,
        'wordle-gray': wordleColors.gray,
      }
    }
  }
}
```

3. **Update Component Imports:**
   - All chart components import from `@/theme/colors`
   - Replace hardcoded hex values with `wordleColors.primary`, etc.
   - Use Tailwind classes (`bg-wordle-green`) for CSS

4. **Add Accessibility Patterns:**
   - Use different line styles (solid/dashed/dotted) for chart series
   - Add icons to pattern input squares (✓ green, ~ yellow, ✗ gray)
   - Use different shapes for scatter plot data points
   - Ensure 4.5:1 contrast ratio verified

5. **Testing:**
   - Verify all colors updated across application
   - Test with color-blind simulators (Chrome DevTools, Color Oracle)
   - Ensure contrast ratios meet WCAG AA standards
   - Verify SSOT: changing one value in colors.ts updates everywhere

**Files to Update:**
- Create: `frontend/src/theme/colors.ts` (new SSOT file)
- Update: `frontend/tailwind.config.js` (import from colors.ts)
- Update: All chart components (DifficultyPage, DistributionPage, SentimentPage, OutliersPage, NYTEffectPage, PatternsPage)
- Update: PatternInput component (add icons)
- Update: Any components with hardcoded color values

**Benefits of SSOT Approach:**
- Change colors in ONE place (colors.ts) to update entire application
- Type-safe color usage prevents typos
- Easy A/B testing of color schemes
- Simple to add color variants (light/dark mode future-proofing)
- Clear documentation of color usage and purpose

---

### HIGH-2: Inconsistent Visual Language
**Priority:** HIGH
**Effort:** Medium
**User Impact:** Medium

**Problem:**
Different pages use different UI patterns for similar functionality, creating a disjointed experience.

**Inconsistencies Found:**

#### Filter UI Patterns
- **OutliersPage:** Uses rounded pill buttons (lines 77-89)
- **Other pages:** No filter UI at all
- **Inconsistency:** Only one page has interactive filters

#### Card Styles
- **HomePage:** Feature cards with icons, hover effects (line 113: `hover:scale-105`)
- **NYTEffectPage:** Custom StatCard component with t-test results
- **OutliersPage:** Outlier detail cards with date badges
- **Inconsistency:** Three different card component patterns

#### Typography Hierarchy
- **HomePage:** h1 with `text-4xl font-bold`
- **DifficultyPage:** h1 with `text-5xl font-bold`
- **Inconsistency:** Heading sizes vary across pages

#### Chart Styling
- **DifficultyPage:** Uses Recharts Line + Scatter + Table
- **DistributionPage:** Uses Recharts AreaChart
- **SentimentPage:** Uses ComposedChart (Bar + Line)
- **OutliersPage:** Custom color functions, inconsistent tooltips
- **Inconsistency:** Chart colors, tooltip styles, legend placement differ

**Solution:**
Create a design system with reusable components:

1. **Card Components:**
   - `<FeatureCard>` - For homepage feature grid
   - `<StatCard>` - For metric displays (overview stats, NYT comparison)
   - `<DetailCard>` - For entity details (outlier days, pattern results)

2. **Filter Components:**
   - `<FilterPills>` - Rounded pill buttons for categorical filters
   - `<DateRangePicker>` - Consistent date selection
   - `<Dropdown>` - Standard select component

3. **Typography Scale:**
   - Define in `tailwind.config.js`:
     ```js
     fontSize: {
       'display': '3rem',      // 48px - Page hero
       'h1': '2.25rem',        // 36px - Page title
       'h2': '1.875rem',       // 30px - Section title
       'h3': '1.5rem',         // 24px - Subsection
       'body': '1rem',         // 16px - Body text
       'small': '0.875rem',    // 14px - Captions
     }
     ```

4. **Chart Theme:**
   - Centralize in `frontend/src/theme/chartColors.ts`:
     ```ts
     export const chartColors = {
       primary: '#6aaa64',    // Wordle green
       secondary: '#c9b458',  // Wordle yellow
       neutral: '#787c7e',    // Wordle gray
       accent: '#0284c7',     // Blue for special cases
     }
     ```
   - Standardize tooltip component used across all Recharts

---

### HIGH-3: Mobile Responsiveness Issues
**Priority:** HIGH
**Effort:** Medium
**User Impact:** High (40%+ users on mobile)

**Problem:**
Several components don't scale well to mobile devices, particularly navigation and charts.

**Specific Issues:**

#### Navigation (Header.tsx)
- **Issue:** Horizontal scroll with 8 tabs on mobile (line 55-70)
- **Problem:** Small touch targets (px-3 py-1.5 = 24px height)
- **WCAG Minimum:** 44px × 44px for touch targets
- **No indicator** that more tabs exist beyond viewport

**Recommendation:**
- Implement hamburger menu for mobile (< 768px)
- OR use bottom tab bar (iOS/Android pattern)
- OR vertical accordion navigation

#### Charts on Small Screens
- **Issue:** Fixed heights (h-64 = 256px, h-80 = 320px, h-96 = 384px)
- **Problem:** Charts may be too tall on small screens (excessive scrolling)
- **Problem:** Dual Y-axis charts (Difficulty Timeline) will be cramped
- **Problem:** Scatter plot tooltips hard to activate on touch devices

**Recommendation:**
- Use responsive heights with max constraints
- Simplify charts on mobile (fewer data points, simplified tooltips)
- Consider mobile-specific chart variations
- Test on real devices (iPhone SE 375px width, standard Android 360px)

#### Pattern Input Component
- **Issue:** 5 squares at w-12 h-12 on mobile = 60px each = 300px total
- **Device:** iPhone SE has 375px width
- **Problem:** Tight fit with gaps and padding

**Recommendation:**
- Use percentage-based widths instead of fixed
- Test on actual iPhone SE and small Android devices

**Testing Checklist:**
- [ ] All touch targets ≥ 44px × 44px
- [ ] No horizontal scrolling (except intentional carousels)
- [ ] Charts legible on 360px width screens
- [ ] Text readable without zooming (16px minimum for body text)
- [ ] Navigation accessible with thumb reach (bottom 50% of screen)

---

### HIGH-4: Missing Contextual Help & Onboarding
**Priority:** HIGH
**Effort:** Medium
**User Impact:** High (especially for first-time users)

**Problem:**
Users land on the dashboard with no guidance on what to explore or how to interpret data.

**Missing Elements:**

#### No First-Visit Experience
- Users see HomePage with 7 feature cards
- No explanation of what each feature reveals
- No suggested starting point or "Start Here" indicator
- No walkthrough or tutorial

#### No Empty State Instructions
- **PatternsPage:** Shows "Input a pattern above to see analysis" but doesn't explain:
  - What format the pattern should be (🟩🟨⬛ vs. GYX)
  - What insights they'll get
  - Why they should try this feature
- Only one example provided ("Try Wordle 500 (ROBOT)")

#### Minimal Chart Context
- `ChartContainer` descriptions are single sentences
- No interpretation guide ("What am I looking for?")
- No explanation of what insights are interesting vs. expected
- No "This means..." callouts

**Solutions:**

#### Add Onboarding Flow (Optional, can be dismissed)
1. **Welcome Modal** on first visit:
   - "Welcome to Wordle Data Explorer"
   - Brief overview of 5 main features
   - "Start with Difficulty Analysis" suggestion
2. **Tooltip Tour** (optional):
   - Highlight key UI elements
   - Explain navigation pattern
   - Show how to interact with charts

#### Improve Empty States
- **PatternsPage:** Add 3-5 example patterns users can click to load immediately
  - "Try: 🟨⬛⬛🟨🟩 (Hard start)"
  - "Try: 🟩🟩🟩🟩🟩 (Perfect game)"
  - "Try: ⬛⬛⬛⬛⬛ (Terrible first guess)"

#### Add "How to Read This" Sections
Below each chart:
```
[ℹ️ What to Look For]
- Higher difficulty scores (right side) mean rarer words
- Days with 4+ average guesses were especially hard
- Outliers (far from the trend line) are unusually easy or hard puzzles
```

#### Add Insight Callouts
Highlight interesting findings:
```
💡 Interesting: The word "KHAKI" was the hardest puzzle (9.2/10 difficulty)
💡 Trend: Puzzles got slightly harder after NYT acquisition
```

---

## 4. Medium Priority Issues

### MEDIUM-1: Loading States Need Improvement
**Priority:** MEDIUM
**Effort:** Low
**User Impact:** Medium

**Problem:**
Inconsistent loading states across pages create an unpolished experience.

**Current Implementations:**

| Page | Loading State | Quality |
|------|--------------|---------|
| DifficultyPage | Text: "Loading difficulty data..." | Basic |
| DistributionPage | Text: "Loading distribution data..." | Basic |
| SentimentPage | Text: "Loading sentiment data..." | Basic |
| NYTEffectPage | `<LoadingSpinner>` component with centering | Good |
| OutliersPage | Text only | Basic |
| PatternsPage | Text + disabled button | Good |

**Issues:**
- Text-only loading feels unpolished
- No visual feedback on progress
- No skeleton screens showing layout structure
- Inconsistent patterns across pages

**Recommendation:**

#### Implement Skeleton Screens
Replace text-only states with content placeholders:
- Gray placeholder boxes showing chart outlines
- Pulsing animation (shimmer effect)
- Preserves layout structure during load
- Creates perception of faster loading

**Example:**
```tsx
{isLoading ? (
  <ChartSkeleton height="h-64" />
) : (
  <LineChart data={data} />
)}
```

#### Use LoadingSpinner Consistently
For non-chart content (cards, tables):
- Center spinner in container
- Add descriptive text: "Loading [feature name]..."
- Use consistent spinner style

#### Add Partial Loading Support
If some data loads faster:
- Show overview stats immediately
- Load detailed charts progressively
- Use Suspense boundaries for section-level loading

---

### MEDIUM-2: Error Handling UX Needs Polish
**Priority:** MEDIUM
**Effort:** Low
**User Impact:** Medium

**Problem:**
Error messages are inconsistent and sometimes too technical for general users.

**Current Error Messages:**

| Page | Error Message | Issue |
|------|--------------|-------|
| DifficultyPage | "Error loading data. Please ensure backend is running." | Too technical |
| PatternsPage | "Failed to analyze pattern. It might not exist in our database yet." | Good! |
| OutliersPage | Generic error text | Vague |

**Issues:**
1. **Technical Language:** "Please ensure backend is running" assumes user can debug
2. **No Retry Mechanism:** Users must refresh entire page
3. **No Actionable Steps:** User doesn't know what to do next

**Recommendation:**

#### User-Friendly Error Messages
- ❌ "Error loading data. Please ensure backend is running."
- ✅ "We couldn't load this data right now. Please try again."

- ❌ "API request failed with status 500"
- ✅ "Something went wrong on our end. We've been notified."

- ❌ "Network error: ECONNREFUSED"
- ✅ "Can't connect to the server. Check your internet connection."

#### Add Retry Button
```tsx
{error && (
  <div className="error-state">
    <p>We couldn't load this data.</p>
    <button onClick={refetch}>Try Again</button>
  </div>
)}
```

#### Create ErrorMessage Component
Standardize error display:
```tsx
<ErrorMessage
  message="We couldn't load this chart"
  action={<button onClick={retry}>Retry</button>}
  supportText="If this keeps happening, try refreshing the page."
/>
```

---

### MEDIUM-3: Chart Tooltip & Interaction Design
**Priority:** MEDIUM
**Effort:** Low
**User Impact:** Medium

**Problem:**
Chart tooltips use Recharts defaults, which are adequate but generic.

**Current State:**
- Default Recharts tooltips (white box with text)
- Appear on hover/tap (standard behavior)

**Good Example:**
OutliersPage has custom tooltip (lines 140-158):
```tsx
<Tooltip content={<CustomTooltip />} />
```
This should be standardized across all charts.

**Recommendation:**

#### Standardize Custom Tooltip Component
Create `<ChartTooltip>` used across all Recharts:
- Consistent styling (Wordle colors, rounded corners)
- Formatted numbers (commas, percentages)
- Clear labels (not just raw data keys)

#### Add Touch Optimization
- Larger invisible hit areas for touch targets
- Tap to show tooltip (mobile-friendly)
- Tooltip positioned to avoid obscuring data

**Note:** Advanced keyboard navigation and click-to-pin features are **not in scope** for MVP.

---

### MEDIUM-4: Data Visualization Color Inconsistency
**Priority:** HIGH (elevated due to HIGH-1 color migration)
**Effort:** Low (included in HIGH-1 implementation)
**User Impact:** Low
**Status:** ✅ **INCLUDED IN HIGH-1 IMPLEMENTATION**

**Problem:**
Chart colors are hardcoded with hex values instead of referencing theme variables, making branding changes difficult.

**Current Usage:**

| Component | Color | Source |
|-----------|-------|--------|
| DifficultyPage Line Chart | `stroke="#0077bb"` | Hardcoded |
| DifficultyPage Scatter | `fill="#8884d8"` | Recharts default |
| OutliersPage Scatter | Custom function | Inconsistent |
| SentimentPage Bar | `fill="#ee7733"` | Hardcoded |

**Issues:**
- Colors don't reference Tailwind config or CSS variables
- Makes theming/rebranding require searching all files
- Inconsistent color usage across charts
- Some use Tailwind colors, some use hex codes

**Solution:**
This issue will be **fully resolved** by implementing HIGH-1 (Color Palette SSOT). The centralized `frontend/src/theme/colors.ts` file will provide:

1. Single source for all chart colors
2. Type-safe color references
3. Easy theme updates
4. Consistent color usage across all components

**Implementation covered by HIGH-1:**
- All hardcoded hex values replaced with imports from `@/theme/colors`
- Semantic color tokens (primary, secondary, success, warning, error)
- Chart-specific palette exported for multi-series charts
- Tailwind config imports from same source

**No additional work needed** - this is automatically resolved when HIGH-1 is implemented.

---

## 5. Low Priority Enhancements

### LOW-1: Typography Hierarchy Formalization
**Priority:** LOW
**Effort:** Low
**User Impact:** Low

**Problem:**
Heading sizes and text colors are inconsistent across pages.

**Current State:**
- H1: Sometimes `text-4xl`, sometimes `text-5xl`
- Body text: Mix of `text-gray-600`, `text-gray-500`, `text-slate-600`, `text-slate-500`
- No documented type scale

**Recommendation:**
Define in `tailwind.config.js`:
```js
fontSize: {
  'display': ['3rem', { lineHeight: '1.1' }],     // 48px - Hero
  'h1': ['2.25rem', { lineHeight: '1.2' }],        // 36px
  'h2': ['1.875rem', { lineHeight: '1.3' }],       // 30px
  'h3': ['1.5rem', { lineHeight: '1.4' }],         // 24px
  'body-lg': ['1.125rem', { lineHeight: '1.6' }],  // 18px
  'body': ['1rem', { lineHeight: '1.6' }],         // 16px
  'body-sm': ['0.875rem', { lineHeight: '1.5' }],  // 14px
}
```

**Best Practice:**
Use line-height 1.5-1.6 for body text (readability).

---

### LOW-2: Animation & Micro-interactions
**Priority:** LOW
**Effort:** Medium
**User Impact:** Low (polish)

**Current Transitions:**
- ✅ `hover:scale-105` on feature cards (nice!)
- ✅ `transition-colors` on buttons
- ✅ Chart tooltips have smooth appearance

**Missing:**
- Page transition animations
- Scroll reveal animations for sections (important if going single-page)
- Loading skeleton fade-in animations
- Success feedback for pattern submission
- Focus indicators for keyboard navigation

**Recommendation:**
Add for single-page layout:
- Fade-in as sections scroll into view
- Parallax effects for hero section (subtle)
- Smooth scroll behavior for anchor navigation
- Stagger animations for card grids

---

### LOW-3: Footer Underutilization
**Priority:** LOW
**Effort:** Low
**User Impact:** Low

**Current Footer:**
- Attribution to Kaggle dataset
- Copyright notice

**Missing:**
- Link to "About This Project"
- Link to data methodology
- Link to GitHub repository
- Contact/feedback mechanism
- Social sharing buttons (optional)

**Recommendation:**
Add useful navigation:
- About
- How It Works
- Data Sources
- GitHub
- Report Issue

---

### LOW-4: Accessibility - Focus Indicators
**Priority:** LOW
**Effort:** Low
**User Impact:** Low

**Problem:**
Custom components could have more visible focus indicators beyond browser defaults.

**Current State:**
- Links and buttons have browser default focus (blue outline) - sufficient for MVP
- PatternInput squares have no custom focus indicator

**Recommendation (Optional Enhancement):**
Add Tailwind focus utilities for custom components:
```tsx
className="focus:outline-2 focus:outline-offset-2 focus:outline-wordle-green"
```

**Note:** Browser default focus indicators are **sufficient for MVP**. Custom focus styling is a nice-to-have polish item for Phase 2.

---

## 6. Technical Recommendations

### TECH-1: Standardize Data Fetching with React Query
**Priority:** HIGH
**Effort:** Low
**Impact:** Code quality, consistency

**Problem:**
Some pages use React Query, others use manual `useEffect` + `useState`, creating inconsistent patterns.

**Examples:**
- ✅ DifficultyPage: Uses `useQuery` (lines 19-25)
- ❌ NYTEffectPage: Manual `useEffect` + Promise.all (lines 13-32)
- ❌ OutliersPage: Manual state management (lines 19-37)
- ❌ PatternsPage: Manual Promise.all (lines 22-25)

**Recommendation:**
Convert all data fetching to React Query:
```tsx
// Instead of manual state
const { data, isLoading, error } = useQuery({
  queryKey: ['nyt-effect'],
  queryFn: () => Promise.all([
    statsApi.getNYTEffect(),
    statsApi.getComparisonStats()
  ])
})
```

For parallel requests, use `useQueries`:
```tsx
const queries = useQueries({
  queries: [
    { queryKey: ['nyt-effect'], queryFn: statsApi.getNYTEffect },
    { queryKey: ['comparison'], queryFn: statsApi.getComparisonStats }
  ]
})
```

**Benefits:**
- Automatic caching (5 min stale time already configured)
- Consistent loading/error states
- Request deduplication
- Easier refetching and retry logic

---

### TECH-2: Implement Code Splitting
**Priority:** MEDIUM
**Effort:** Low
**Impact:** Performance

**Problem:**
All page components are imported directly in `App.tsx`, bundled into main chunk even though only one renders at a time.

**Current:**
```tsx
import HomePage from './pages/HomePage'
import DifficultyPage from './pages/DifficultyPage'
// All 8 pages imported
```

**Recommendation:**
Use React lazy loading:
```tsx
const HomePage = lazy(() => import('./pages/HomePage'))
const DifficultyPage = lazy(() => import('./pages/DifficultyPage'))
// etc.

<Suspense fallback={<LoadingSpinner />}>
  <Routes>...</Routes>
</Suspense>
```

**Impact Estimate:**
- Current: ~1932 lines + Recharts (~100kb) loaded upfront
- With splitting: 30-40% smaller initial bundle
- User loads only the feature they view

**Note:** If switching to single-page layout, this becomes less relevant (all sections load anyway).

---

### TECH-3: Add Memoization to Chart Data Transformations
**Priority:** MEDIUM
**Effort:** Low
**Impact:** Performance

**Problem:**
Chart data transformations run on every render, even when source data hasn't changed.

**Example (OutliersPage.tsx lines 44-52):**
```tsx
const chartData = [...filteredOutliers]
  .sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))
  .slice(0, 15)
  .map(o => ({ /* ... */ }))
```

This runs on EVERY render, even if `filteredOutliers` is unchanged.

**Recommendation:**
Use `useMemo`:
```tsx
const chartData = useMemo(() => {
  return [...filteredOutliers]
    .sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))
    .slice(0, 15)
    .map(o => ({ /* ... */ }))
}, [filteredOutliers])
```

**Files to Update:**
- DifficultyPage.tsx lines 44-52
- OutliersPage.tsx lines 44-52
- Any other chart data transformations

---

### TECH-4: Clean Up CSS Organization
**Priority:** MEDIUM
**Effort:** Low
**Impact:** Code quality, bug prevention

**Problem:**
Three CSS files with overlapping/conflicting styles:
1. `frontend/src/index.css` - Vite template (dark mode, global link styles)
2. `frontend/src/App.css` - Vite template (unused logo animation)
3. `frontend/src/styles/index.css` - Custom Wordle theme

**Issues:**
- `index.css` has global `a { color: #646cff }` causing navbar bug
- `App.css` appears completely unused
- Conflicting color schemes (dark mode vs. light Wordle theme)

**Recommendation:**

**Step 1:** Delete `App.css`
- Appears unused (only has logo animation)
- Not imported anywhere critical

**Step 2:** Review `index.css` Lines 1-68
- Identify essential styles (likely none)
- Move any needed styles to `styles/index.css`
- Delete or rename to `index-old.css` and remove import

**Step 3:** Consolidate to Single Source
- Keep only `styles/index.css` for custom CSS
- Use Tailwind config for all theme variables
- Reference CSS variables from Tailwind config

**Step 4:** Move CSS Variables to Tailwind
Instead of both CSS variables AND Tailwind config, use single source:
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'wordle-green': '#6aaa64',
      'wordle-yellow': '#c9b458',
      'wordle-gray': '#787c7e',
    }
  }
}
```

---

### TECH-5: Extract Reusable Components
**Priority:** MEDIUM
**Effort:** Low
**Impact:** Maintainability

**Problem:**
Code duplication across pages for common patterns.

**Repeated Code:**

#### Error Messages
Every page:
```tsx
if (error) return <div className="p-8 text-center text-red-500">{error}</div>
```

**Solution:**
```tsx
<ErrorMessage message={error} />
```

#### Loading States
Every page:
```tsx
if (loading) return <div className="p-8 text-center">Loading...</div>
```

**Solution:**
```tsx
<LoadingState message="Loading data..." />
```

#### Card Styling
Multiple inline class strings:
```tsx
className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
```

**Solution:**
Use existing `wordle-card` class consistently, or create `<Card>` component.

**Components to Extract:**
1. `<ErrorMessage>` - Standard error display
2. `<LoadingState>` - Standard loading display
3. `<Card>` - Reusable card container
4. `<InfoTooltip>` - ℹ️ icon with help text
5. `<SectionHeader>` - Page/section title with optional description

---

## 7. Accessibility Audit

### WCAG 2.1 AA Compliance Status

| Criterion | Status | Issue | Recommendation |
|-----------|--------|-------|----------------|
| **1.4.3 Contrast (Minimum)** | ✅ Pass | Current blue/orange palette meets 4.5:1 | Verify Wordle green/yellow also meet 4.5:1 when reverting colors |
| **2.1.1 Keyboard** | ⚠️ Partial | Links/buttons accessible, charts use browser defaults | Not in scope for MVP - browser defaults sufficient |
| **2.4.1 Bypass Blocks** | ❌ Fail | No skip navigation link | Add "Skip to content" link at top |
| **2.4.7 Focus Visible** | ⚠️ Partial | Browser defaults only | Add custom focus indicators (outline-2) |
| **4.1.2 Name, Role, Value** | ⚠️ Partial | Some ARIA labels, charts missing | Add ARIA labels to chart elements |

### Critical Accessibility Issues

#### A11Y-1: Chart Accessibility (Deferred)
**Status:** ⚠️ Browser Default Support
**Impact:** Low - Recharts provides basic accessibility, advanced keyboard navigation not in MVP scope

**Current State:**
- Recharts SVG visualizations use browser default accessibility
- Charts have basic ARIA labels
- Tooltips use hover (standard pattern)

**Note:**
Advanced keyboard navigation for charts (arrow keys through data points) is **not in scope** for this MVP. The target audience (general Wordle enthusiasts) primarily uses mouse/touch interactions. Browser default accessibility is sufficient for MVP requirements.

#### A11Y-2: Missing ARIA Live Regions
**Status:** ❌ Not Accessible
**Impact:** Screen reader users don't know when content updates

**Problem:**
- Loading states have no `aria-live` or `role="status"`
- Error messages have no `role="alert"`
- Dynamic content updates are silent to screen readers

**Recommendation:**
```tsx
<div role="status" aria-live="polite">
  {isLoading && <LoadingSpinner />}
</div>

<div role="alert" aria-live="assertive">
  {error && <ErrorMessage />}
</div>
```

#### A11Y-3: Color-Only Information
**Status:** ⚠️ Partial
**Impact:** Color-blind users may miss key information

**Problem:**
- Pattern input squares use only color to indicate state (green/yellow/gray)
- Chart series distinguished only by color
- Success/error states use only color

**Recommendation:**
1. Add icons to pattern squares (✓ for green, ~ for yellow, ✗ for gray)
2. Use different line styles (solid/dashed/dotted) for chart series
3. Add text labels in addition to color
4. Test with color-blind simulators

---

## 8. Performance Analysis

### Current Bundle Size (Estimated)

**Main Chunk:**
- React + React Router + React Query: ~120kb
- Recharts library: ~100kb
- All page components: ~80kb (1932 lines of code)
- Total: ~300kb minified (estimate)

### Performance Metrics (Target)

| Metric | Target | Current (Estimated) | Status |
|--------|--------|---------------------|--------|
| First Contentful Paint | <1.5s | ~2.0s | ⚠️ Needs improvement |
| Largest Contentful Paint | <2.5s | ~3.0s | ⚠️ Needs improvement |
| Time to Interactive | <3.5s | ~4.0s | ⚠️ Needs improvement |
| Total Bundle Size | <200kb | ~300kb | ⚠️ Needs improvement |

### Optimization Opportunities

#### PERF-1: Code Splitting (High Impact)
- Implement React.lazy for route components
- Potential savings: 30-40% initial bundle size
- Estimated improvement: FCP -0.5s

#### PERF-2: Chart Data Memoization (Medium Impact)
- Add useMemo to data transformations
- Prevents unnecessary re-renders
- Estimated improvement: Smoother interactions, fewer frame drops

#### PERF-3: Progressive Loading (High Impact)
For single-page layout:
- Load overview stats first
- Lazy-load chart sections with Intersection Observer
- Only render charts when scrolled into view
- Estimated improvement: TTI -1.5s

#### PERF-4: Image Optimization (N/A)
- Currently minimal image usage ✅
- No optimization needed

---

## 9. Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)
**Goal:** Address user feedback and blocking issues

**Day 1-2:**
- [ ] Fix navbar active state CSS bug
- [ ] Clean up CSS file organization (delete conflicting styles)
- [ ] Test navbar on all pages (desktop + mobile)

**Day 3-4:**
- [ ] Convert 5-8 chart titles to plain language
- [ ] Add subtitle/tooltip support to ChartContainer component
- [ ] Create example "How to Read This" section for one chart

**Day 5:**
- [ ] Decide on navigation architecture (single-page vs. hybrid)
- [ ] Get user approval on approach
- [ ] Create implementation plan for navigation redesign

---

### Phase 2: Navigation Redesign (Week 2)
**Goal:** Implement approved navigation architecture

**If Single-Page Approach:**
- [ ] Convert page components to section components
- [ ] Create single Dashboard page
- [ ] Implement Intersection Observer for progressive loading
- [ ] Add scroll-spy navigation
- [ ] Add anchor links for sharing (#difficulty, etc.)
- [ ] Test loading performance with all sections

**If Hybrid Approach:**
- [ ] Keep React Router, add hash navigation
- [ ] Implement smooth scroll transitions
- [ ] Create "View All" dashboard page
- [ ] Add mini-previews in sidebar

---

### Phase 3: High Priority Improvements (Week 3)
**Goal:** Polish core experience

- [ ] Revert to Wordle brand colors (green/yellow)
- [ ] Add accessibility patterns (icons, shapes) for color-blind users
- [ ] Create standardized Card components (FeatureCard, StatCard, DetailCard)
- [ ] Implement custom ChartTooltip used across all charts
- [ ] Add loading skeleton screens
- [ ] Improve error messages and add retry buttons
- [ ] Fix mobile navigation (hamburger menu or bottom tab bar)
- [ ] Test on real mobile devices

---

### Phase 4: Accessibility & Performance (Week 4)
**Goal:** Improve accessibility and optimize performance

**Accessibility:**
- [ ] Add skip-to-content link
- [ ] Add ARIA labels to chart containers
- [ ] Add aria-live regions for dynamic content
- [ ] Test basic screen reader compatibility (NVDA or JAWS)
- [ ] Verify focus indicators on interactive elements

**Note:** Advanced keyboard navigation for charts is **not in scope** for MVP.

**Performance:**
- [ ] Implement React.lazy code splitting
- [ ] Add useMemo to chart data transformations
- [ ] Standardize on React Query for all data fetching
- [ ] Optimize chart rendering (Canvas for large datasets if needed)
- [ ] Run Lighthouse audit and address issues

---

### Phase 5: Polish & Launch Prep (Week 5)
**Goal:** Final polish and documentation

- [ ] Add onboarding flow or tooltip tour
- [ ] Add example patterns to PatternsPage
- [ ] Add "How to Read This" sections to all charts
- [ ] Add insight callouts highlighting interesting findings
- [ ] Formalize typography scale in Tailwind config
- [ ] Add scroll animations (if single-page layout)
- [ ] Improve footer with useful navigation links
- [ ] Create user documentation ("How to Use This Dashboard")
- [ ] Final cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Final accessibility audit

---

## 10. Strengths to Preserve

### Excellent Technical Decisions

The following aspects of the current implementation are well-executed and should be maintained:

#### ✅ Code Architecture
1. **TypeScript Throughout** - Strong type safety, comprehensive interfaces
2. **Component Structure** - Clean separation of concerns (pages, components, services, types)
3. **React Query for Caching** - Modern, efficient data fetching with 5-minute stale time
4. **Service Layer Abstraction** - Clean API client with centralized error handling
5. **Error Boundaries** - Production-ready error handling

#### ✅ UI/UX Foundations
1. **Recharts Library** - Good balance of features vs. complexity
2. **Tailwind CSS** - Rapid development, consistent design system
3. **Responsive Grid Layouts** - Good breakpoint usage (mobile/tablet/desktop)
4. **Color-Blind Consideration** - Team thought about accessibility (even if execution needs refinement)
5. **Emoji Icons** - Zero HTTP requests, fun aesthetic, brand-appropriate

#### ✅ Performance Considerations
1. **CSS-Only Logo** - No image requests for branding
2. **Minimal Image Usage** - Primarily SVG and emoji (lightweight)
3. **Caching Strategy** - Appropriate stale time for dashboard data
4. **Responsive Charts** - ResponsiveContainer used consistently

#### ✅ Developer Experience
1. **Clear File Organization** - Easy to navigate codebase
2. **Consistent Naming Conventions** - Clear, descriptive names
3. **Type Safety** - No `any` types observed
4. **Reusable Components** - ChartContainer, MetricCard, LoadingSpinner

---

## Appendices

### Appendix A: File Reference

**Files Reviewed:**
- `frontend/src/App.tsx` (Lines 4-37)
- `frontend/src/components/layout/Header.tsx` (Lines 42-45, 55-70)
- `frontend/src/pages/DifficultyPage.tsx` (Lines 19-25, 36, 44-52, 59, 79, 105-106)
- `frontend/src/pages/DistributionPage.tsx` (Line 23, 45)
- `frontend/src/pages/SentimentPage.tsx` (Lines 27, 40-41)
- `frontend/src/pages/OutliersPage.tsx` (Lines 19-37, 44-52, 54-62, 64, 77-89, 93-94, 101, 140-158)
- `frontend/src/pages/NYTEffectPage.tsx` (Lines 13-32, 35-39)
- `frontend/src/pages/PatternsPage.tsx` (Lines 22-25)
- `frontend/src/components/shared/ChartContainer.tsx` (Line 16)
- `frontend/src/components/patterns/PatternInput.tsx` (Lines 49, 55, 75, 81)
- `frontend/src/services/api.ts` (Lines 15, 17-23, 26-33, 61-70)
- `frontend/tailwind.config.js` (Lines 9-11)
- `frontend/src/styles/index.css` (Lines 1-68)
- `frontend/src/index.css` (Lines 1-68, specifically line 18)
- `frontend/src/App.css` (Lines 1-43)

### Appendix B: User Feedback Summary

**Original User Comments:**
1. "Too many tabbing, I prefer if the site is shown in single page with separate sections"
2. "Active element on navbar text have same color as background color"
3. "Many of the chart is too technical, I prefer to have more less technical description so non-technical user can still understand, we can add tooltip or separate info section for the technical terms"

**Agent Additions:**
- Color palette deviation from Wordle brand
- Mobile responsiveness concerns
- Missing onboarding/contextual help
- Accessibility gaps (keyboard navigation, ARIA labels)
- Performance optimization opportunities (code splitting, memoization)
- Inconsistent visual language across pages

### Appendix C: Testing Checklist

**Before Launch:**
- [ ] Navigation bug fixed and tested on all pages
- [ ] At least 8 chart titles converted to plain language
- [ ] Navigation architecture decision made and implemented
- [ ] Mobile navigation tested on real devices (iPhone, Android)
- [ ] All touch targets ≥ 44px × 44px
- [ ] Color contrast verified with WCAG checker
- [ ] Basic tab navigation works for links and buttons
- [ ] Basic screen reader compatibility verified
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Lighthouse audit score ≥ 85 (Performance, Accessibility)

---

## Summary

This comprehensive review identifies **three critical issues** that must be addressed before launch:

1. **Navigation Architecture:** ✅ APPROVED - Redesign from multi-page tabs to single-page scrollable sections
2. **CSS Bug:** ✅ APPROVED - Fix active navbar text visibility issue by removing conflicting global styles
3. **Technical Terminology:** ✅ APPROVED - Simplify chart language for non-technical users with optional technical details

Additionally, **high/medium priority improvements** approved for implementation:
- ✅ **Revert to Wordle brand colors** with SSOT pattern and accessibility patterns
- Improve mobile responsiveness (navigation and charts)
- Add contextual help and onboarding
- Standardize visual language across pages
- Implement loading skeletons and better error handling
- Add basic ARIA labels for accessibility

**Removed from Scope:**
- Advanced keyboard navigation for charts (browser defaults sufficient)
- Click-to-pin tooltip functionality
- Complex chart interactions beyond hover/tap

The codebase demonstrates strong technical foundations with React + TypeScript + React Query and clean component architecture. With focused attention on user-facing experience issues, this dashboard can become an exemplary portfolio piece showcasing both data analysis skills and ability to build engaging, accessible user experiences.

**Implementation Status:** Ready to begin Week 1 implementation
- Day 1: Bug fixes + CSS cleanup + memoization
- Day 2-3: Plain language content updates
- Day 4: Color palette migration (SSOT)
- Day 5: Single-page architecture migration start
