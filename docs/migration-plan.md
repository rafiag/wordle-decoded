# Bold Mockup V2 Migration Plan

## Overview
This document outlines the comprehensive migration of the Wordle Data Explorer dashboard to the **Bold Mockup V2** design, featuring the **Data Noir** dark theme.

### Migration Strategy: Side-by-Side
To ensure stability of the current live dashboard, we are adopting a **Side-by-Side** migration strategy.
- **Current Dashboard (`/`)**: Stays on the stable Light Theme ("Old UI").
- **New Dashboard (`/v2`)**: Hosted on a dedicated route for development and verification of the new designs.
- **Final Switch**: Once `/v2` is feature-complete and verified, it will replace `/` as the main route.

**Reference Documents:**
- Design mockup: `docs/04-design/mockup-v2-bold.html`
- Design system: `docs/04-design/design-system.md`
- Implementation Plan: `implementation_plan.md`

---

## Design System Overview

### Color Palette (Data Noir)

**Backgrounds:**
- Primary: `#0a0e27`
- Secondary: `#1a1a2e`
- Card: `#16213e`

**Accent Colors:**
- Cyan: `#00d9ff`
- Coral: `#ff6b9d`
- Lime: `#00ff88`
- Orange: `#ffa500`
- Purple: `#a855f7`

**Text:**
- Primary: `#f0f0f0`
- Secondary: `#a0a0a0`
- Muted: `#666`

**Borders & Effects:**
- Border: `#2a2a4e`
- Glow Cyan: `rgba(0, 217, 255, 0.3)`
- Glow Coral: `rgba(255, 107, 157, 0.3)`

### Typography

- **Headings**: Space Grotesk (700 weight)
- **Body**: Inter (400, 600 weight)
- **Stats/Monospace**: JetBrains Mono (700 weight)

---

## Migration Phases

### Phase 1: Design System Foundation (COMPLETED)

**File:** `frontend/src/styles/bold-theme.css`

**Summary:**
- Created dedicated stylesheet `bold-theme.css` completely isolated from legacy styles by the `.theme-bold` class.
- Defined all Data Noir CSS variables.
- Imported Google Fonts.
- Created scoped utility classes (e.g., `.theme-bold .card`, `.theme-bold .btn-primary`).

### Phase 2: Layout & Navigation (COMPLETED)

**New Components:**
- `frontend/src/components/layout/BoldLayout.tsx`: Specialized layout wrapper applying the `.theme-bold` class.
- `frontend/src/components/ScrollNav.tsx`: Interactive right-side navigation.
- `frontend/src/pages/BoldDashboard.tsx`: Container page for V2.

**Features:**
- Fixed right-side vertical navigation (hidden on mobile `<768px`)
- Dot indicators with active/viewed/upcoming states
- Progress line with gradient fill (cyan → purple)
- Smooth scroll click handlers
- Dedicated `/v2` route implementation in `App.tsx`

**Sections to Track:**
1. At a Glance
2. Difficulty
3. Guesses
4. Pattern
5. Sentiment *(new)*
6. NYT Effect
7. Viral *(new)*
8. Traps

---

### Phase 3: Hero Section Restructure (COMPLETED)

**File:** `frontend/src/sections/BoldHeroSection.tsx` (New Component)

**Changes:**
- Created dedicated `BoldHeroSection` to preserve legacy `HeroSection` (Side-by-Side strategy).
- Implemented "Data Noir" design with gradient text and glow animations.
- Added scroll nudge separator with animated bounce arrow.
- Removed all stat cards (clean landing view).

---

### Phase 4: Core Sections (COMPLETED)

#### At a Glance Section

**File:** `frontend/src/sections/AtAGlanceSection.tsx`

**Primary Stat Cards (4 total):**
1. Total Words
2. Hardest Word Ever
3. NYT Difficulty Increase
4. Viral Moments Count

**Styling Updates:**
- Replace Tailwind with `.stats-grid` and `.stat-card`
- Gradient text: `linear-gradient(135deg, var(--accent-cyan), var(--accent-lime))`
- Font: JetBrains Mono for values (56px)
- Icon size: 48px
- 3px borders with cyan hover effect

**Overview Navigation Cards:**
- Grid layout below stats
- Cards for: Difficulty, Guesses, Pattern, Sentiment, NYT Effect, Viral, Traps
- Click handlers for smooth scroll to sections

---

#### Sentiment Section

**File:** `frontend/src/sections/SentimentSection.tsx`

**Charts:**
- Update colors: lime (`#00ff88`), coral (`#ff6b9d`), orange, purple
- CartesianGrid stroke: `var(--border-color)`
- Replace `ContentCard` with `<div className="chart-container">`

**Tooltips:**
- Background: `var(--bg-card)`
- Border: `2px solid var(--border-color)`
- Text: `var(--text-primary)`

**Table:**
- Dark background: `rgba(0, 0, 0, 0.2)`
- Border: `1px solid var(--border-color)`
- Hover: cyan glow effect

**Frustration Meter:**
- Gradient: `linear-gradient(90deg, var(--accent-lime), var(--accent-coral))`

---

### Phase 5: Placeholder Sections (COMPLETED)

Each section below maintains current layout but wraps charts in placeholders:

**Files to Modify:**
- `DifficultySection.tsx` - Line chart placeholder
- `DistributionSection.tsx` - Stacked area chart placeholder
- `PatternsSection.tsx` - Verify 5-block interactive input alignment
- `NYTEffectSection.tsx` - Split-panel layout with chart placeholder
- `TrapsSection.tsx` - Heatmap placeholder

---

### Phase 6: New Viral Section (COMPLETED)

**New File:** `frontend/src/sections/ViralSection.tsx`

**Based on:** `OutliersSection.tsx`

**Layout:**
- Grid: `repeat(auto-fit, minmax(320px, 1fr))`

**Data Source:**
- API: `statsApi.getOutlierHighlights()` or `getOutliersOverview(50)`
- Filter by tweet volume

**Card Elements:**
- Date (uppercase, orange)
- Word (48px, bold)
- Tweet volume (cyan, monospace)
- Description (secondary text)

**Hover Effects:**
- Border → orange
- Transform: `scale(1.05)`

---

### Phase 7: App Integration (COMPLETED)

**File:** `App.tsx` (or main layout)

**Section Order:**
1. Hero/Landing (no nav)
2. At a Glance
3. Difficulty
4. Guesses
5. Pattern
6. **Sentiment** *(new placement)*
7. NYT Effect
8. **Viral** *(new section)*
9. Traps

**Global Changes:**
- Add `<ScrollNav />` component
- Update body background to `var(--bg-primary)`

---

## Verification Plan

### Browser Testing

**Start Dev Server:**
```bash
cd frontend
npm run dev
```

**Visual Checklist:**
- [ ] Dark theme applied across all sections
- [ ] Gradient text renders on hero & stat values
- [ ] Card hover effects (lift, border color change)
- [ ] Scroll navigation appears on right (desktop only)
- [ ] Scroll nav tracks active section
- [ ] Overview cards scroll to sections on click
- [ ] Charts use Data Noir accent colors
- [ ] Sentiment tables use dark theme
- [ ] All fonts load (Space Grotesk, Inter, JetBrains Mono)

**Responsive Testing:**
- [ ] Mobile (375px) - scroll nav hidden
- [ ] Tablet (768px) - 2-column layouts
- [ ] Desktop (1440px) - full multi-column

**Browser Compatibility:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if available)

---

### Accessibility Testing

**Keyboard Navigation:**
- Press `Tab` through all interactive elements
- Verify cyan focus outlines visible
- Test scroll nav keyboard controls

**Contrast Check:**
- Use WebAIM Contrast Checker
- Verify cyan text on dark background ≥ 4.5:1 (WCAG AA)
- Check all text/background combinations

---

### Manual Testing Scenarios

1. **Scroll navigation dots** - Click each, verify smooth scroll
2. **Overview cards** - Click in "At a Glance", verify section navigation
3. **Stat card hovers** - Confirm lift animation & border change
4. **Sentiment toggle** - Switch Hated/Loved, verify instant table update
5. **Monospace fonts** - Verify code-like appearance on stat values
6. **Mobile view** - Resize to <768px, scroll nav should disappear

---

## Important Notes

> [!WARNING]
> **Breaking Changes**: All Tailwind utility classes will be replaced with CSS custom properties. Any external components relying on current class names may break.

> [!IMPORTANT]
> **Sentiment Section Placement**: Adding Sentiment as a new section between Pattern and NYT Effect in the navigation order.

**Technical Considerations:**
- **No API changes required** - all endpoints remain unchanged
- **Font loading** adds ~40KB to initial page load
- Use `font-display: swap` to prevent Flash of Unstyled Text (FOUT)
- **Gradients and glows** may impact performance on low-end devices
- Monitor frame rates during scroll animations

**Team Communication:**
- Ensure alignment on CSS custom properties vs Tailwind classes
- Review design system documentation before making component changes
- Test across all target browsers before deployment

---

*Document prepared on 2025-12-30*  
*Last updated: 2025-12-30*
