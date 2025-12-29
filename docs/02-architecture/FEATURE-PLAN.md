# Feature Development Plan: Wordle Data Explorer

This document describes what you'll be able to do with the Wordle Data Explorer at each stage of development. For technical implementation details, developers should see TECHNICAL-SPEC.md.

---

## Phase 1: Minimum Viable Product (MVP)

**What You'll Have:**
A fully working interactive dashboard where you can explore Wordle patterns, analyze difficulty trends, and discover what makes puzzles hard or easy - all with a playful Wordle-inspired design that works beautifully on any device.

**Success Criteria:**
- All 5 analytical features provide interesting, actionable insights
- General users can immediately understand visualizations and find insights within 1 minute
- Responsive design works smoothly on mobile, tablet, and desktop
- Color-blind users can distinguish all chart elements clearly
- Dashboard loads in <3 seconds with smooth, responsive interactions
- Code demonstrates strong data analysis skills suitable for portfolio evaluation

---

### 1.1 Database & Data Pipeline (Foundation) **(Status: COMPLETED ✅)**

**What It Does:**
Behind the scenes, this component downloads, cleans, and organizes all the Wordle data so the dashboard can show you insights instantly.
- **Documentation:** [Data & Database Architecture](DATA-PIPELINE.md)

**What You'll See:**
Fast, reliable data throughout the dashboard. Charts and statistics load quickly without errors or missing information.
- **Verified**: 320 Game IDs and 306 days of Sentiment data processed.

**Why It Matters:**
Without clean, well-structured data, none of the analytical features would work. This foundation ensures every insight you see is accurate and based on complete information.

---

### 1.2 Dashboard Application (Foundation) **(Status: COMPLETED ✅)**

**What It Does:**
Sets up the web application you'll interact with - the layout, navigation, color scheme, and responsive design that works on any device.
- **Documentation:** [Dashboard & Visualization Architecture](DASHBOARD.md)

**What You'll See:**
A working website at localhost:3000 with a color-blind friendly blue/orange/gray palette (WCAG 2.1 AA compliant), smooth navigation between features, and a design that adapts perfectly whether you're on your phone, tablet, or desktop.
- **Verified**: React 19 + TypeScript, Vite build system, Tailwind CSS styling, responsive breakpoints working on all devices.

**Why It Matters:**
This creates the foundation for all features. Once it's ready, you can actually see and interact with the dashboard instead of just having data sitting in a database.

**Accessibility Note:**
The dashboard uses Wordle's signature brand colors (green #6aaa64, yellow #c9b458, gray #787c7e) with accessibility patterns (icons, line styles, shapes) to ensure color-blind users can distinguish all elements. Phase 2 migrated from blue/orange to Wordle colors using a Single Source of Truth (SSOT) pattern for easy theme updates.

---

### 1.3 Word Difficulty Analysis **(Status: COMPLETED ✅)**

**What You'll Experience:**

**Visual Difficulty Scoring:**
- See every Wordle answer rated on a difficulty scale based on how common the word is in English
- Scatter plots showing the relationship between word rarity and how many guesses people needed
- Timeline view revealing difficulty trends over months
- **Documentation:** [Dashboard & Visualization Architecture](DASHBOARD.md)

**Interactive Exploration:**
- Click any word to see its detailed breakdown (frequency score, letter patterns, performance stats)
- Filter the view to show only easy, medium, or hard words
- Hover over data points for instant details about specific puzzles

**Why It Matters:**
Ever wonder why "KNOLL" felt impossible while "CRANE" was easy? This feature gives you data-driven answers by analyzing word commonality and showing exactly how difficulty correlates with player performance.

---

### 1.4 Guess Distribution Visualizations **(Status: COMPLETED ✅)**

**What It Does:**
Shows how many people solved each puzzle in 1, 2, 3, 4, 5, or 6 tries - or failed completely.

**What You'll See:**
- Stacked bar charts breaking down the guess distribution for any day
- Daily, weekly, and monthly views to spot patterns over time
- Calendar heatmap showing which days were hardest across months
- **Documentation:** [Dashboard & Visualization Architecture](DASHBOARD.md)
- Comparison tools to see how different time periods stack up

**What You'll Experience:**
- Click any bar to drill into that specific day and see full details
- Toggle between time ranges (daily/weekly/monthly) with a single click
- Hover over any data point for exact percentages

For example: "On March 15, 2022, 45% of players solved in 4 tries, 25% in 3 tries, and 8% failed completely."

**Why It Matters:**
Compare your own performance against thousands of other players. See if that puzzle that took you 5 tries was actually unusually hard, or if you just had a rough day.

---

### 1.5 Pattern-Based Performance Analysis **(Status: COMPLETED ✅)**

**What It Does:**
Analyzes game patterns (those emoji grids like 🟩⬜⬜🟨⬜) to predict success rates and completion guesses.

**What You'll See:**
A pattern input widget where you can enter or select your first guess pattern, then see:
- **Success Rate:** "Players with this pattern solve the puzzle 87% of the time"
- **Average Completion:** "Typical completion in 4.2 tries from here"
- **Common Next Steps:** Flow diagrams showing what successful players did next
- **Pattern Rankings:** Which patterns lead to the best outcomes

**What You'll Experience:**
- Type or click to build your pattern using the emoji picker
- Filter patterns by characteristics (number of greens, yellows, positions)
- Compare multiple patterns side-by-side
- See progression flows showing how successful games evolved

For example: If your first guess gives you 🟩⬜⬜🟨⬜, you can see that players with this pattern succeed 72% of the time and typically finish in 3.8 guesses.

**Why It Matters:**
Learn from crowd wisdom. See if your pattern puts you on track for success or if you should adjust your strategy. It's like having thousands of Wordle players as coaches.

---

### 1.6 The NYT Effect Analysis **(Status: COMPLETED ✅)**

**What It Does:**
Answers the burning question: "Did Wordle get harder after the New York Times bought it?"

**What You'll See:**
A split-screen dashboard comparing before/after February 10, 2022:
- **Side-by-Side Metrics:** Average guess count, word difficulty distribution, success rates
- **Statistical Tests:** Clear indicators showing which changes are statistically significant
- **Timeline Visualization:** The exact moment of transition marked clearly on trend lines
- **Word Obscurity Comparison:** How frequently NYT chose rare words vs. the original creator

**What You'll Experience:**
- Toggle between "Before NYT" and "After NYT" views
- Drill into specific metrics (average guesses, difficulty scores, etc.)
- See box plots comparing the full distributions, not just averages
- Clear visual indicators when differences are statistically meaningful vs. just noise

For example: "Average guesses increased from 3.92 to 4.08 (p < 0.01, statistically significant). NYT used 23% more 'obscure' words (frequency score > 7)."

**Why It Matters:**
Data-driven answer to one of the most debated Wordle questions. No more arguments based on gut feelings - see the actual evidence and decide for yourself.

---

### 1.7 Outlier & Viral Day Detection **(Status: COMPLETED ✅)**

**What It Does:**
Identifies days when tweet activity was unusually high or low, revealing viral moments, controversial puzzles, and quiet periods in Wordle's history.
- **Documentation:** [Feature Implementation Details](../03-features/FEATURE-IMPLEMENTATION.md)

**What You'll See:**
- **Timeline with Highlights:** Days flagged as outliers stand out visually, color-coded by category
- **Outlier Categories:** Viral frustration (high volume + negative sentiment), viral fun (high volume + positive sentiment), quiet days, sentiment extremes
- **Context Cards:** Each outlier explained with tweet volume, community mood, and word difficulty
- **Volume vs Sentiment Chart:** Scatter plot showing relationship between engagement and community mood

**What You'll Experience:**
- Click any outlier day for detailed analysis
- Filter by outlier type (viral frustration, viral fun, quiet days, sentiment extremes)
- See which days had abnormally high or low tweet participation
- Discover stories behind unusual days (frustrating words, fun moments, holidays)

For example: "January 12, 2022: Tweet volume 340% above expected (Z-score: 3.4). Community sentiment: Frustrated (-0.42). Word: PROXY (difficulty 8.7/10) - unusually hard word sparked massive discussion."

**Why It Matters:**
Discover the fascinating stories behind Wordle's viral moments. See which words caused the internet to explode with frustration versus celebration, and understand what makes a puzzle "go viral" beyond just difficulty.

**Phase 2 Enhancement:**
Google Trends integration will add search behavior data to distinguish "help-seeking" (high search volume) from "celebrating" (low search volume) viral moments.

---

### 1.8 Trap Pattern Analysis ("The Trap Cache") **(Status: COMPLETED ✅)**

**What It Does:**
Specifically analyzes "trap" words—those that have many similar neighbors (like *LIGHT*, *NIGHT*, *FIGHT*)—to see how they derail players.
- **Documentation:** [Feature Implementation Details](../03-features/FEATURE-IMPLEMENTATION.md)

**What You'll See:**
- **Trap Highlight:** Words flagged as "Traps" stand out in your analytics.
- **The "Deadly Neighbors" List:** For any trap word, see the list of words that commonly cause players to waste guesses (e.g., for *LIGHT*, see *MIGHT, SIGHT, TIGHT*).
- **Brute-Force Rate:** Metrics showing how often players resort to brute-force guessing vs. strategic elimination.

**Why It Matters:**
Some words aren't hard because they're obscure; they're hard because they belong to a large family of similar words. This feature identifies those "Wordle Traps" and shows you exactly where players get stuck.

---

### 1.9 Sentiment & Performance Correlation **(Status: COMPLETED ✅)**

**What It Does:**
Combines tweet sentiment analysis with puzzle performance to reveal the emotional impact of Wordle puzzles on the community.

**What You'll See:**
- **Sentiment Distribution Pie Chart:** Breakdown of all tweets into 5 sentiment buckets (Very Positive, Positive, Neutral, Negative, Very Negative).
- **Daily Sentiment Volume (Grouped Bar Chart):** Daily trends showing tweet volume per sentiment category, with tooltips revealing the day's solution word.
- **Frustration Index Meter:** A visual gauge showing the average percentage of tweets with sentiment below **-0.1**.
- **Most Frustrating Words Table (Top 5):** A dynamic table listing the top 5 most frustration-inducing words, including:
    - Word and Date
    - **Difficulty** (color-coded: Green=Easy, Yellow=Medium, Red=Hard)
    - **Success Rate**
    - Frustration Index and Total Tweets
- **Documentation:** [Dashboard & Visualization Architecture](DASHBOARD.md), [API Reference](API-REFERENCE.md)

**Why It Matters:**
It captures the social vibe of the game, distinguishing between a \"statistically hard\" day and an \"emotionally draining\" one for the Wordle community.

---

## When Phase 1 Is Complete

You'll have a fully working Wordle Data Explorer where you can:
- Understand exactly why some puzzles felt harder than others
- Compare your performance against thousands of real players
- Get pattern-based insights to improve your strategy
- See data-driven evidence about the NYT acquisition impact
- Discover viral moments and unusual patterns in Wordle history
- Interact with beautiful, responsive visualizations on any device
- Explore data freely with intuitive filtering and drill-down capabilities

---

## Phase 2: UX Polish & Enhancement ✅ **IN PROGRESS**

**What Changes:**
Phase 2 transforms the working MVP into a polished, single-page dashboard experience based on user feedback and UX/UI review. Includes single-page navigation, plain language content, Wordle brand colors, compact spacing, mobile responsiveness, and accessibility improvements that elevate the experience from "functional" to "professional portfolio piece."

**Prerequisites:** ✅ **COMPLETE**
Phase 1 MVP is complete with all analytical features working.

**Design Reference:**
UI/UX mockup completed with approved design patterns in `mockup/index.html`. Mockup demonstrates:
- Single-page scrollable layout with sticky navigation
- Compact spacing (25-42% reduction in whitespace)
- Wordle brand colors with accessibility patterns
- Mobile-responsive breakpoints
- Statistical significance indicators
- Plain language chart titles
- Interactive pattern input with visual blocks

**Key Focus Areas:**
- User feedback implementation (single-page dashboard, compact spacing, plain language)
- Wordle brand identity (color migration with SSOT pattern)
- Mobile-first responsiveness with compact design
- Basic accessibility (WCAG 2.1 AA compliance, screen readers)
- Performance optimization (Intersection Observer for progressive loading)

**Out of Scope:**
- Advanced keyboard navigation for charts (browser defaults sufficient)
- Click-to-pin tooltips
- Welcome modals/onboarding tours (deferred)

---

### 2.1 Navigation & Architecture Redesign

**What It Does:**
Converts multi-page tab navigation to single-page scrollable dashboard based on user feedback ("too many tabbing").

**What You'll Experience:**
- All features accessible in one continuous scroll (no tab clicking)
- Sticky header with scroll-spy navigation highlighting current section
- Scroll progress bar showing your position on the page
- Anchor links for sharing specific sections (#difficulty, #patterns, #nyt-effect, etc.)
- Back-to-top button appearing after scrolling 500px
- Progressive loading: Charts render as you scroll into view (Intersection Observer)
- Maintains context while exploring different features
- Mobile: Hamburger menu with smooth slide-out navigation

**Design Reference:**
See `mockup/index.html` for approved layout:
- Sticky header with horizontal navigation (desktop)
- Scroll progress indicator at top of page
- Section badges (🎯 Analysis, 📊 Trends, 🔍 Interactive, etc.)
- Smooth scroll behavior with `scroll-padding-top` for header offset
- Mobile menu toggle with overlay navigation

**Technical Implementation:**
- Convert page components (DifficultyPage, DistributionPage, etc.) to section components
- Remove React Router routes (keep HashRouter for anchor navigation)
- Implement scroll-spy using Intersection Observer API
- Add sticky header with active section highlighting
- Lazy-load chart data when sections become visible (90% viewport threshold)
- Add scroll progress bar tracking `window.scrollY`

**Why It Matters:**
Dashboard best practice - users want to explore data at a glance, not click through separate pages. Creates cohesive storytelling flow for data insights. User feedback confirmed preference for continuous scrolling over multi-page navigation.

---

### 2.2 Plain Language Content & Visual Polish

**What It Does:**
Simplifies technical chart terminology based on user feedback ("charts are too technical").

**What You'll Experience:**
- Chart titles in plain language (e.g., "Rare Words vs. Player Performance" instead of "Correlation between word rarity and guess count")
- Two-tier content system: Primary title (plain) + subtitle/tooltip (technical details)
- "How to Read This Chart" expandable sections
- Insight callouts highlighting interesting findings
- Example patterns users can click to try immediately

**Implementation:**
- Update ChartContainer component (add subtitle, helpText props)
- Migrate all chart titles to plain language
- Add info icons (ℹ️) with methodology tooltips
- Create reusable InfoTooltip component

**Why It Matters:**
Target audience is general Wordle enthusiasts, not data scientists. Users need to understand insights within 1 minute (success criteria).

---

### 2.3 Wordle Brand Color Migration & Compact Spacing (SSOT)

**What It Does:**
Reverts from blue/orange to Wordle's signature green/yellow/gray colors using Single Source of Truth pattern, and implements compact spacing system to reduce whitespace throughout the dashboard.

**What You'll Experience:**
- Instantly recognizable Wordle aesthetic (green #6aaa64, yellow #c9b458, gray #787c7e)
- Accessibility patterns (icons, line styles, shapes) for color-blind users
- Consistent color usage across all components
- Compact, efficient use of screen space (25-42% reduction in spacing values)
- More content visible at a glance without excessive scrolling
- Tighter visual hierarchy with reduced gaps between elements

**Design Reference:**
See `mockup/styles.css` for approved spacing system:
- `--spacing-xs`: 0.375rem (was 0.5rem, 25% reduction)
- `--spacing-sm`: 0.75rem (was 1rem, 25% reduction)
- `--spacing-md`: 1rem (was 1.5rem, 33% reduction)
- `--spacing-lg`: 1.25rem (was 2rem, 38% reduction)
- `--spacing-xl`: 1.75rem (was 3rem, 42% reduction)
- `--spacing-xxl`: 2.5rem (was 4rem, 38% reduction)

**Color System Implementation:**
- Create `frontend/src/theme/colors.ts` (SSOT file)
- Tailwind config imports from theme file
- All components import from `@/theme/colors`
- Add icons to pattern input squares (✓ green, ~ yellow, ✗ gray)
- Different line styles for chart series (solid/dashed/dotted)

**Spacing System Implementation:**
- Update Tailwind spacing scale in `tailwind.config.js`
- Reduce section padding from `xxl` to `xl`
- Reduce card padding and margins from `lg` to `md`
- Reduce heading sizes (hero: 3rem → 2.25rem, section: 2.5rem → 2rem)
- Tighten grid gaps (stats grid, quick nav, comparison cards)

**Why It Matters:**
Brand recognition + easy theme updates. Change one file to update entire app. Compact spacing addresses user feedback that design felt "too big with lots of whitespace." Future-proof for dark mode or theme variations.

---

### 2.4 Mobile Responsiveness & Design System

**What It Does:**
Optimizes dashboard for mobile devices and standardizes visual language across all components.

**What You'll Experience:**
- Hamburger menu navigation on mobile (<768px)
- Responsive chart heights (no excessive scrolling)
- Touch targets ≥44px (WCAG minimum)
- Consistent card components across all sections
- Standardized typography scale (display, h1, h2, h3, body, small)
- Unified loading states (spinner with descriptive text)
- User-friendly error messages with retry buttons
- Pattern input blocks optimized for touch (3rem × 3rem with hover effects)
- Comparison cards stack vertically on mobile with rotated arrow

**Design Reference:**
See `mockup/index.html` and `mockup/styles.css` for approved patterns:
- **Stat Cards:** Green/yellow/gray color variants with icons
- **Comparison Cards:** Before/After layout with significance indicators
- **Pattern Blocks:** 5 interactive squares with emoji display
- **Results Display:** 3-column metrics grid + flow list
- **Filter Buttons:** Rounded pill style with active state
- **Responsive Breakpoints:** Desktop (1024px+), Tablet (768px-1023px), Mobile (<768px)

**Component Standardization:**
- All cards use `border-radius: var(--radius-md)` (12px)
- All sections use consistent badge style with emoji + label
- All interactive elements have hover effects (scale, shadow, border)
- All metrics follow label-value-note structure

**Why It Matters:**
40%+ users on mobile. Consistent design language creates professional, polished experience. Design system ensures maintainability and visual coherence.

---

### 2.5 Accessibility & Performance

**What It Does:**
Adds basic accessibility support and optimizes performance.

**What You'll Experience:**
- ARIA live regions (screen readers announce loading/errors)
- Focus indicators on interactive elements
- Memoized chart data transformations (smoother interactions)
- React Query standardization (consistent data fetching)

**Out of Scope:**
- Advanced keyboard navigation for charts (browser defaults sufficient)
- Click-to-pin tooltips
- Complex chart interactions

**Why It Matters:**
WCAG 2.1 AA compliance for portfolio quality. Performance optimizations prevent frame drops during interactions.

---

### 2.6 Advanced Interactions (Future Enhancement)

**What It Does:**
Adds enhanced filtering tools, shareable views, and data export functionality.

**Status:** Deferred to future phase (optional enhancement)

**Potential Features:**
- Enhanced filter combinations (multiple criteria at once)
- Shareable URLs preserving current view and filters
- Export buttons to download charts as images or data as CSV
- Comparison mode to view multiple timeframes side-by-side

**Why Deferred:**
These are nice-to-haves that aren't essential for the core analytical experience or portfolio demonstration. Focus on user feedback items first (navigation, plain language, colors, mobile).

---

### 2.7 Performance Optimization & Code Quality

**What It Does:**
Optimizes loading times and interaction smoothness even with large datasets. Also includes backend ETL optimizations and code quality improvements.

**What You'll See:**
A new section showing:
- **Initial Load:** <1 second for first view (down from 2-3 seconds)
- **Filter Response:** Instant filter updates with no lag
- **Progressive Loading:** Charts appear immediately, details fill in progressively
- **Smooth Scrolling:** Buttery smooth even on mobile devices

For example:
- "Dashboard now loads in 0.8s (previously 2.1s)"
- "Pattern search returns results in <100ms (previously 500ms)"

**Completed During Phase 1 (Post-Review, Dec 29, 2025):**
- ✅ **Pattern Input Validation:** Format validation with proper HTTP error codes (400 Bad Request)
- ✅ **Statistical Completeness:** All NYT Effect metrics now have statistical tests (guesses, difficulty, success rate)
- ✅ **Dynamic Significance Badges:** UI reflects actual p-values with color coding and tooltips

**Deferred from Phase 1.1 & 1.2:**
- **Backend ETL:** Sentiment analysis multiprocessing (3-4x speedup, currently acceptable at 2-5 minutes)
- **Advanced Statistics:**
  - Effect size (Cohen's d) for practical significance
  - Confidence intervals for mean differences
  - Pearson correlation and R² metrics for sentiment analysis (deferred from Phase 1.9)
- **Enhanced Aggregation:** Weekly/Monthly views for distribution endpoints (deferred from Phase 1.4)
- **Feature Robustness:**
  - Bounds checking on limit parameters (e.g., max 100)
  - Comprehensive validation tests for edge cases
  - Integration tests for pattern endpoints
- **Frontend:** Incremental test coverage expansion (target 80%, currently 15%)
- **Code Quality:** Complete type hints, extract magic numbers to named constants
- **Distribution:** Package distribution setup (setup.py/pyproject.toml)

**Why It Matters:**
Speed is a feature. Faster interactions mean users explore more, discover more insights, and have a better overall experience. Critical for making a professional impression.

---

## When Phase 2 Is Complete

You'll have everything from Phase 1, plus:
- Single-page scrollable dashboard with sticky navigation and scroll progress bar
- Plain language chart titles that non-technical users can understand
- Wordle brand color identity with accessibility patterns
- Compact spacing design (25-42% reduction in whitespace)
- Mobile-optimized responsive design with hamburger menu
- Statistical significance indicators on NYT Effect comparison
- Interactive pattern input with visual blocks (first guess only)
- Pattern flow analysis showing most likely next steps
- WCAG 2.1 AA accessibility compliance (basic support)
- Professional portfolio-ready user experience

**Visual Deliverables:**
- Complete UI/UX mockup in `mockup/index.html` demonstrating all design patterns
- Approved spacing system, color palette, and component styles
- Mobile-responsive breakpoints and navigation patterns

---

## Feature Summary

| Feature | Phase | What You Can Do | How It Helps You |
| :------ | :---: | :-------------- | :--------------- |
| **Database & Data Pipeline** | 1 | Fast, reliable data access | Foundation for all insights |
| **Dashboard Application** | 1 | Navigate the web interface | Access all features in one place |
| **Word Difficulty Analysis** | 1 | See word rarity and difficulty scores | Understand why puzzles felt hard |
| **Guess Distribution** | 1 | Compare performance vs. crowd | See how you stack up |
| **Pattern Analysis** | 1 | Get pattern-based predictions | Learn from successful strategies |
| **NYT Effect** | 1 | See before/after acquisition data | Answer the big debate question |
| **Outlier Detection** | 1 | Discover viral/unusual days | Find interesting stories |
| **UX/UI Polish** | 2 | Enjoy smooth, refined experience | Professional portfolio piece |
| **Advanced Interactions** | 2 | Keyboard nav, export, sharing | Enhanced usability |
| **Performance Optimization** | 2 | Lightning-fast interactions | Smooth, professional feel |

---

## What Happens Next

### Immediate Focus: Phase 1
Build a complete, working dashboard with all 5 core analytical features. Quality bar: production-ready code, clean design, accurate insights, responsive on all devices.

### After Phase 1: Your Feedback
Once you've used the dashboard and explored the features, we'll discuss:
- What works well and what doesn't
- What features you actually use vs. what sounded good on paper
- Whether Phase 2 polish is the right next step
- Any adjustments needed based on real usage

### Phase 2 Decision Point
Only proceed to Phase 2 polish if:
- Phase 1 dashboard proves useful and showcases skills well
- You're using it regularly enough to notice where polish would help
- The value of enhanced UX justifies the additional development time

---

## The Bottom Line

**Phase 1:** Build a working Wordle Data Explorer that lets you discover patterns, analyze difficulty, and explore what makes Wordle puzzles easy or hard.

**Phase 2:** Polish it into a professional, delightful experience with smooth animations, blazing performance, and enhanced accessibility.

Each phase must be complete and useful before considering the next one.
