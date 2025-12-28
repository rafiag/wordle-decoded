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
- **Documentation:** [Database & ETL Overview](docs/data-pipeline/README.md)

**What You'll See:**
Fast, reliable data throughout the dashboard. Charts and statistics load quickly without errors or missing information.
- **Verified**: 320 Game IDs and 306 days of Sentiment data processed.

**Why It Matters:**
Without clean, well-structured data, none of the analytical features would work. This foundation ensures every insight you see is accurate and based on complete information.

---

### 1.2 Dashboard Application (Foundation) **(Status: COMPLETED ✅)**

**What It Does:**
Sets up the web application you'll interact with - the layout, navigation, color scheme, and responsive design that works on any device.
- **Documentation:** [Dashboard Foundation Overview](dashboard-foundation/README.md)

**What You'll See:**
A working website at localhost:3000 with a color-blind friendly blue/orange/gray palette (WCAG 2.1 AA compliant), smooth navigation between features, and a design that adapts perfectly whether you're on your phone, tablet, or desktop.
- **Verified**: React 19 + TypeScript, Vite build system, Tailwind CSS styling, responsive breakpoints working on all devices.

**Why It Matters:**
This creates the foundation for all features. Once it's ready, you can actually see and interact with the dashboard instead of just having data sitting in a database.

**Accessibility Note:**
The dashboard uses a universally accessible color palette (blue replaces green, orange replaces yellow) that is safe for users with deuteranopia and protanopia while maintaining the playful Wordle aesthetic.

---

### 1.3 Word Difficulty Analysis **(Status: COMPLETED ✅)**

**What You'll Experience:**

**Visual Difficulty Scoring:**
- See every Wordle answer rated on a difficulty scale based on how common the word is in English
- Scatter plots showing the relationship between word rarity and how many guesses people needed
- Timeline view revealing difficulty trends over months
- **Documentation:** [Visualization Implementation](../docs/visualization/README.md)

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
- **Documentation:** [Visualization Implementation](../docs/visualization/README.md)
- Comparison tools to see how different time periods stack up

**What You'll Experience:**
- Click any bar to drill into that specific day and see full details
- Toggle between time ranges (daily/weekly/monthly) with a single click
- Hover over any data point for exact percentages

For example: "On March 15, 2022, 45% of players solved in 4 tries, 25% in 3 tries, and 8% failed completely."

**Why It Matters:**
Compare your own performance against thousands of other players. See if that puzzle that took you 5 tries was actually unusually hard, or if you just had a rough day.

---

### 1.5 Pattern-Based Performance Analysis **(Status: NOT STARTED)**

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

### 1.6 The NYT Effect Analysis **(Status: NOT STARTED)**

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

### 1.7 Outlier & Viral Day Detection **(Status: NOT STARTED)**

**What It Does:**
Identifies days when something unusual happened - puzzle went viral, search interest spiked, or tweet volume was abnormally high or low.

**What You'll See:**
- **Timeline with Highlights:** Days flagged as outliers stand out visually
- **Outlier Categories:** Tweet volume spikes, Google search surges, difficulty anomalies
- **Context Cards:** Each outlier explained ("Holiday: Thanksgiving" or "Controversial word: SWILL")
- **Correlation Charts:** How search interest relates to difficulty and tweet volume

**What You'll Experience:**
- Click any outlier day for detailed analysis
- Filter by outlier type (viral days, quiet days, search spikes, etc.)
- See scatter plots comparing expected vs. actual tweet volume
- Discover interesting stories behind unusual days

For example: "January 12, 2022: Tweet volume 340% above expected. Google searches for 'Wordle answer' spiked to 95/100. Word was 'PROXY' (difficulty 8.7/10) - unusually hard for a Wednesday."

**Why It Matters:**
Discover the fascinating stories behind Wordle's viral moments. See which words caused the internet to explode with frustration, and understand what makes a puzzle "go viral" beyond just difficulty.

---

### 1.8 Trap Pattern Analysis ("The Trap Cache") **(Status: NOT STARTED)**

**What It Does:**
Specifically analyzes "trap" words—those that have many similar neighbors (like *LIGHT*, *NIGHT*, *FIGHT*)—to see how they derail players.

**What You'll See:**
- **Trap Highlight:** Words flagged as "Traps" stand out in your analytics.
- **The "Deadly Neighbors" List:** For any trap word, see the list of words that commonly cause players to waste guesses (e.g., for *LIGHT*, see *MIGHT, SIGHT, TIGHT*).
- **Brute-Force Rate:** Metrics showing how often players resort to brute-force guessing vs. strategic elimination.

**Why It Matters:**
Some words aren't hard because they're obscure; they're hard because they belong to a large family of similar words. This feature identifies those "Wordle Traps" and shows you exactly where players get stuck.

---

### 1.9 Sentiment & Performance Correlation **(Status: COMPLETED ✅)**

**What It Does:**
Combines tweet sentiment analysis with puzzle performance to see if "difficult" words also make the community "angry" or "frustrated."

**What You'll See:**
- **Mood of the Day:** An indicator showing if players felt "Triumphant," "Neutral," or "Frustrated" after the puzzle.
- **Sentiment vs. Guesses:** A correlation chart showing if higher average guess counts lead to more negative tweet sentiment.
- **Obscurity Sentiment:** Does an "obscure" word (low frequency) cause more frustration than a "trap" word? 
- **Documentation:** [Visualization Implementation](../docs/visualization/README.md) 

**Why It Matters:**
It captures the social vibe of the game. It allows you to see the difference between a "statistically hard" day and an "emotionally draining" one for the Wordle community.

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

## Phase 2: Polish & Enhancement

**What Changes:**
Phase 2 takes the working MVP and makes it delightful. Smoother animations, faster loading, better interactions, keyboard navigation, and additional polish that elevates the experience from "functional" to "professional portfolio piece."

**Prerequisites:**
Phase 1 must be complete and working well based on your testing and feedback.

---

### 2.1 UX/UI Improvements

**What It Does:**
Refines the visual experience with smooth transitions, enhanced design polish, and improved mobile interactions.

**What You'll Experience:**
- Smooth fade-in animations when loading charts
- Subtle transitions when filtering or switching views
- Enhanced visual hierarchy making key insights pop
- Improved mobile touch interactions (swipe, pinch-to-zoom on charts)
- Better loading states with skeleton screens instead of blank spaces
- Micro-interactions that make the dashboard feel responsive and alive

**Deferred from Phase 1.2:**
- Skeleton loading screens (current spinner is accessible and functional)
- Icon indicators for charts (✓, ⚠, ✕) to supplement color for maximum accessibility

**Why It Matters:**
The difference between a functional tool and a delightful experience. These refinements make the dashboard feel professional and polished - crucial for portfolio presentation.

---

### 2.2 Advanced Interactions

**What It Does:**
Adds keyboard navigation, enhanced filtering tools, shareable views, and data export functionality.

**Why This is Phase 2:**
These are nice-to-haves that enhance usability but aren't essential for the core analytical experience. They build on the foundation established in Phase 1.

**What You'll See:**
- Full keyboard navigation (arrow keys, tab, shortcuts)
- Enhanced filter combinations (multiple criteria at once)
- Shareable URLs preserving your current view and filters
- Export buttons to download charts as images or data as CSV
- Comparison mode to view multiple timeframes side-by-side

**Deferred from Phase 1.2:**
- E2E testing setup with Playwright (no user workflows exist yet in Phase 1.2)
- Advanced keyboard shortcuts beyond basic tab navigation

---

### 2.3 Performance Optimization & Code Quality

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

**Deferred from Phase 1.1 & 1.2:**
- **Backend ETL:** Sentiment analysis multiprocessing (3-4x speedup, currently acceptable at 2-5 minutes)
- **Advanced Statistics:** Pearson correlation, p-values, R² metrics (deferred from Phase 1.9)
- **Enhanced Aggregation:** Weekly/Monthly views for distribution endpoints (deferred from Phase 1.4)
- **Feature Robustness:** Input validation and comprehensive test coverage (deferred from Phase 1.3)
- **Frontend:** Incremental test coverage expansion (target 80%, currently 15%)
- **Code Quality:** Complete type hints, extract magic numbers to named constants
- **Distribution:** Package distribution setup (setup.py/pyproject.toml)

**Why It Matters:**
Speed is a feature. Faster interactions mean users explore more, discover more insights, and have a better overall experience. Critical for making a professional impression.

---

## When Phase 2 Is Complete

You'll have everything from Phase 1, plus:
- Polished, professional-quality design with smooth animations
- Blazing-fast performance with optimized loading and interactions
- Full accessibility including keyboard navigation
- Shareable views and data export capabilities

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
