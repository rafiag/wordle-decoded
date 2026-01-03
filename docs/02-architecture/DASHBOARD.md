# Dashboard & Visualization Architecture

This document covers the technical implementation of the Wordle Data Explorer frontend and its visualization capabilities.

## 1. Frontend Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Routing**: React Router v7

---

## 2. Core Visualizations

### Word Difficulty Analysis
- **Goal**: Correlate word rarity with player performance.
- **Charts**:
  - **Scatter Plot**: Global Rarity Score vs. Average Guess Count.
  - **Timeline**: Difficulty Rating trends over time.

### Guess Distribution
- **Goal**: Show the community's guess "bell curve."
- **Charts**:
  - **Bar Chart**: Cumulative counts for guesses 1–6.
  - **Composed Chart**: Stacked ratios of guesses over time.

### Sentiment Analytics
- **Goal**: Highlight the "community mood" for specific puzzles.
- **Metrics**: Frustration Index, Average Sentiment (VADER).
- **Charts**: Dual-axis timeline showing sentiment dips alongside difficulty spikes.

---

## 3. Design System & Accessibility
The dashboard is designed to be **WCAG 2.1 AA compliant** and color-blind friendly.

### Color Tokens (SSOT)
All colors are centralized in `frontend/src/theme/colors.ts` and follow the **Bold Data Noir** theme:
- **Correct Position**: Lime/Cyan/Purple - *High contrast accents*
- **Wrong Position**: Orange/Coral - *Distinct warm tones*
- **Neutral/Miss**: Muted Gray - *Low visual noise*

The palette uses high-contrast neon accents against dark backgrounds to ensure WCAG 2.1 AA compliance and clear differentiation for color-blind users without requiring a separate mode.

### Layout Patterns
### Layout Patterns
- **Single-Page Dashboard**: The dashboard is a seamless scrolling experience with sticky navigation and specialized sections.
- **Hero Section**: Features a primary headline, 6 key "At a Glance" metrics (responsive grid), and leads directly into the visual story.
- **Metric Cards**: Provide quick summaries of aggregate data.
- **Chart Containers**: Standardize loading/error states for all visualizations.
- **Responsive Grid**: 1 column (Mobile) -> 2 columns (Tablet) -> 3+ columns (Desktop).

---

## 4. API Integration
The frontend communicates with the FastAPI backend using standardized versioned endpoints.

- **URL Prefix**: `/api/v1`
- **Standard Response**:
  ```json
  {
    "status": "success",
    "data": { ... },
    "meta": { "timestamp": "...", "version": "1.0.0" }
  }
  ```

---

## 5. Development Workflow

### Starting the Dashboard
```bash
docker compose up frontend
```
Opens at [http://localhost:3000](http://localhost:3000).

### Running Tests
```bash
npm test              # Run unit/component tests
npm test -- --ui      # Open Vitest UI
```
