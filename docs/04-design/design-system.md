# Design System Documentation

## Overview
This document defines the visual language and UI components for the **Wordle Data Explorer** based on the **Bold Mockup V2** (`mockup-v2-bold.html`). It captures the color palette, typography, spacing, component specifications, interaction patterns, and accessibility guidelines to ensure a consistent, premium look and feel across the application.

---

## Color System
| Role | Variable | Value |
|------|----------|-------|
| **Background Primary** | `--bg-primary` | `#0a0e27` |
| **Background Secondary** | `--bg-secondary` | `#1a1a2e` |
| **Card Background** | `--bg-card` | `#16213e` |
| **Accent Cyan** | `--accent-cyan` | `#00d9ff` |
| **Accent Coral** | `--accent-coral` | `#ff6b9d` |
| **Accent Lime** | `--accent-lime` | `#00ff88` |
| **Accent Orange** | `--accent-orange` | `#ffa500` |
| **Accent Purple** | `--accent-purple` | `#a855f7` |
| **Text Primary** | `--text-primary` | `#f0f0f0` |
| **Text Secondary** | `--text-secondary` | `#a0a0a0` |
| **Text Muted** | `--text-muted` | `#666666` |
| **Border** | `--border-color` | `#2a2a4e` |
| **Glow Cyan** | `--glow-cyan` | `rgba(0, 217, 255, 0.3)` |
| **Glow Coral** | `--glow-coral` | `rgba(255, 107, 157, 0.3)` |

### Usage
- **Backgrounds** use `--bg-primary` for page roots and `--bg-secondary` for sections.
- **Cards** and containers use `--bg-card`.
- **Accents** (`cyan`, `coral`, `lime`, `orange`, `purple`) are applied to interactive elements, highlights, and gradients.
- **Text** hierarchy follows primary → secondary → muted.
- **Borders** provide subtle separation; use `--border-color`.
- **Glows** are used for hover/focus effects.

---

## Typography
| Element | Font Family | Weight | Size (clamp) |
|---------|-------------|--------|-------------|
| **Base body** | `Inter`, sans‑serif | 400 | `clamp(14px, 1.2vw, 18px)` |
| **Headings (h1‑h3)** | `Space Grotesk`, sans‑serif | 700 | `clamp(36px, 5vw, 72px)` (h2) / `clamp(48px, 8vw, 120px)` (h1) |
| **Monospace** | `JetBrains Mono` | 700 | variable (used for stats) |
| **Eyebrow** | `Inter` | 600 | `14px` (uppercase) |
| **Button** | `Inter` | 600 | `16px` |

### Guidelines
- Use **uppercase** for eyecatchers (eyebrow, nav labels).
- Apply **gradient text** for hero titles using accent cyan → purple.
- Monospace is reserved for numeric values and code‑like displays.

---

## Layout & Spacing
- **Container**: `max-width: 1400px; margin: 0 auto; padding: 0 24px;`
- **Grid**: Utilise CSS Grid with `auto-fit` / `minmax` for responsive cards.
- **Breakpoints**:
  - Mobile: ≤ 768 px – single‑column layout, hide side navigation.
  - Tablet: 769 px–1024 px – two‑column where appropriate.
  - Desktop: > 1024 px – full multi‑column layout.
- **Vertical rhythm**: 24 px base spacing unit; use multiples for margins/paddings.

---

## Components
### 1. Button (`.btn`)
- Background: `linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)`
- Border: none, radius `12px`
- Padding: `20px 48px`
- Hover: lift `translateY(-2px)` + `box-shadow: 0 10px 30px var(--glow-cyan)`
- Text: uppercase, `font-weight: 600`.

### 2. Card (`.card`)
- Background: `var(--bg-card)`
- Border: `3px solid var(--border-color)`
- Radius: `16px`
- Padding: `32px`
- Hover: border color → `var(--accent-cyan)`, translateY `-4px`, subtle glow.

### 3. Hero Section (`.hero`)
- Full‑screen min‑height, flex column, centered.
- Gradient background from primary to secondary.
- **Glowing circles** (`::before`, `::after`) with pulse animation.
- Hero title uses gradient text and large clamp size.
- Optional **stat cards** inside hero (`.hero-stat`).

### 4. Section Header
- Eyebrow (`.section-eyebrow`): uppercase, accent coral, small size.
- Title (`.section-title`): clamp size, primary text.
- Description (`.section-description`): secondary text, max‑width 700 px.

### 5. Scroll Navigation Bar (`.scroll-nav`)
- Fixed right‑side, vertical list of items.
- Progress line background (`::before`) and fill (`::after`) with gradient cyan→purple.
- Nav items contain a **dot** (`.nav-dot`) and **label** (`.nav-label`).
- States: `active` (bright cyan, larger), `viewed` (opacity 0.6), hover (scale & glow).
- Hidden on mobile (`@media (max-width: 768px)`).

### 6. Overview Cards (`.overview-card`)
- Small interactive cards linking to sections.
- Icon + title, hover border → accent cyan, slight lift.

### 7. Pattern Input Blocks (`.pattern-block`)
- Square blocks (80 px) with state‑based background (`state-0`, `state-1`, `state-2`).
- Hover scale, border → accent cyan, glow.

### 8. Chart Placeholder (`.chart-placeholder`)
- Rounded container with subtle gradient background.
- Decorative line and accent dot for visual interest.

### 9. Carousel / Viral Grid (`.viral-grid`)
- Responsive grid of cards, hover border accent orange, scale up.

### 10. Scroll Nudge (`.scroll-nudge`)
- Centered prompt with animated arrow (`.scroll-arrow`) using bounce keyframes.

---

## Interaction & Animations
- **Pulse** (`@keyframes pulse`): subtle opacity/scale for hero glows.
- **Bounce** (`@keyframes bounce`): scroll arrow bounce.
- **Fade‑in** (`@keyframes fadeIn`): pattern results reveal.
- All interactive elements have `transition: all 0.3s ease` for smooth feedback.
- `html { scroll-behavior: smooth; }` enables smooth anchor navigation.

---

## Accessibility
- Ensure **contrast** meets WCAG AA (e.g., cyan on dark background).
- Provide **focus outlines** for keyboard navigation (use `outline: 2px solid var(--accent-cyan)` on focusable elements).
- Use **ARIA labels** for navigation items (`aria-label="Scroll to At a Glance"`).
- Text is **responsive** and scalable; avoid fixed pixel sizes for body copy.
- All icons have accompanying text for screen readers.

---

## Usage Example
```html
<link rel="stylesheet" href="/path/to/design-system.css">

<header class="hero">
  <div class="hero-content">
    <div class="hero-eyebrow">Data Exploration Dashboard</div>
    <h1 class="hero-title">WORDLE<br>DECODED</h1>
    <p class="hero-subtitle">You've played the game. Now see the data.</p>
    <div class="hero-stat">
      <span class="hero-stat-number">540</span>
      <span class="hero-stat-label">Total Words</span>
    </div>
    <button class="btn">Explore</button>
  </div>
</header>
```

---

*This design system should be kept in sync with the mockup and updated whenever visual changes are made.*
