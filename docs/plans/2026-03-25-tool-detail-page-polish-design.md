# Tool Detail Page Polish — Design Document

**Date:** 2026-03-25  
**Status:** Approved  
**Author:** Design Review

## Overview

Redesign the `/tool/[id]` page with enhanced score visualizations and improved information architecture. The page should feel like a premium product analytics dashboard — giving users deep insight into why a tool ranks where it does.

---

## Section 1: Hero Redesign

### Current State

- Tool name, description, small category badges
- Score in separate panel (right side)

### Proposed State

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]  ToolName                              Score: 92.4 ▲    │
│          TypeScript • Free                    +2.1 vs average  │
│                                                                  │
│          Description text here...                                │
│                                                                  │
│          [Category]  [Use Case]  [Pricing]  [affiliate-ready]   │
└─────────────────────────────────────────────────────────────────┘
```

### Changes

1. **Large logo (64x64)** prominent in hero — first visual anchor
2. **Score + delta in hero** — shows "vs average" immediately
3. **Delta indicator** — green ▲ if above category average, red ▼ if below
4. Badges remain but moved below description

---

## Section 2: Score Breakdown Visualization

### Radar Chart + Score Components

```
┌───────────────────────────────────────┬──────────────────────────┐
│                                       │   SCORE COMPOSITION      │
│         RADAR CHART                   │                          │
│                                       │   Demand      ████░ 78   │
│            ● Demand                   │   Affiliate   █████ 95   │
│           /    \                      │   Conversion  ███░░ 62   │
│          /      \                     │   Trust       ████░ 74   │
│   Trust ●--------● UseCase          │   Use Case    ███░░ 65   │
│          \      /                     │   Content     ██░░░ 48   │
│           \    /                      │   Different.   ████░ 71   │
│            ● Affiliate                │                          │
│                                       │   [WEIGHTS: 25% 20%...] │
│   [Benchmark: Category avg = 68.2]    │                          │
└───────────────────────────────────────┴──────────────────────────┘
```

### Implementation

- SVG radar chart showing 7 dimensions
- Each axis labeled with dimension name
- Filled polygon with accent-dim color
- Right panel shows horizontal bar breakdown with exact scores
- Weight percentages shown below bars
- Category average benchmark shown on radar as dashed line

### Score Dimensions (from scoring.ts)

1. **Demand** (weight: 25%)
2. **Affiliate Readiness** (weight: 20%)
3. **Conversion Fit** (weight: 20%)
4. **Trust** (weight: 15%)
5. **Use Case Relevance** (weight: 10%)
6. **Content Opportunity** (weight: 5%)
7. **Differentiation** (weight: 5%)

---

## Section 3: Benchmark Comparison

### Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│  BENCHMARK                                                 │
│                                                             │
│  This Tool      ████████████████████░░░░░  82.4            │
│  Category Avg   ████████████████░░░░░░░░░  68.2  (-14.2)  │
│  Top in Type    ████████████████████████  91.1  (+8.7)    │
│                                                             │
│  [═══════════════════●══════════════════════════════════]   │
│  0              50              82.4           100       │
└─────────────────────────────────────────────────────────────┘
```

### Data Requirements

- Calculate category average from `data/trending.json`
- Find top tool in same category
- Show delta from both benchmarks

---

## Section 4: Signal Metrics

### Current Signal Bars (Keep + Enhance)

- Stars
- Weekly growth
- Forks
- Contributors
- Trust

### Enhancements

- Tool icon/logo next to each metric
- Better labels
- Consistent styling with overall design system

---

## Section 5: Sidebar Enhancements

### New Sidebar Structure

```
┌─────────────────────────────┐
│  [LOGO 80x80]              │
│                             │
│  ● 15,392 stars            │
│  ● 1,469 forks             │
│  ● 1 contributor           │
│                             │
│  Trust Score: ████░ 65     │
├─────────────────────────────┤
│  RELATED TOOLS              │
│  [tool card]                │
│  [tool card]                │
│  [tool card]                │
├─────────────────────────────┤
│  Disclosure text...          │
└─────────────────────────────┘
```

---

## Section 6: New Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HERO: Logo, Name, Score+Delta, Description, Badges            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬──────────────────────────────┐  │
│  │  SCORE BREAKDOWN            │  SCORE COMPOSITION          │  │
│  │  Radar Chart (7 dims)       │  Bar breakdown + weights   │  │
│  └─────────────────────────────┴──────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  BENCHMARK: This tool vs Category avg vs Top                    │
├─────────────────────────────────────────────────────────────────┤
│  SIGNAL METRICS: Stars, Growth, Forks, Contributors, Trust   │
├────────────────────────────┬────────────────────────────────────┤
│  BENEFIT / USE CASE /     │  SIDEBAR:                          │
│  PRICING (3-column)       │  - Logo + Quick stats             │
│                           │  - Related tools                   │
│                           │  - Disclosure                     │
└────────────────────────────┴────────────────────────────────────┘
```

---

## Technical Requirements

### Data Enrichment

1. **Category stats** — Calculate category average score from trending data
2. **Top tool in category** — Find highest scoring tool in same category
3. **Full score breakdown** — Call `scoreTool()` to get all 7 dimension scores

### New Components

1. `RadarChart.svelte` — SVG radar/spider chart component
2. `BenchmarkBar.svelte` — Horizontal benchmark comparison component
3. `ScoreBreakdown.svelte` — Combined radar + bar chart panel
4. Enhanced `SignalBars.svelte` — Signal metrics with icons

### Files to Modify

- `src/routes/tool/[id]/+page.svelte` — Main layout changes
- `src/routes/tool/[id]/+page.server.ts` — Add category stats to load()
- `src/lib/components/` — New components

### Styling

- Maintain brutalist shadow system
- Use accent-dim for chart fills (WCAG compliant)
- Keep Space Mono for labels, Space Grotesk for headings

---

## Approval

- [x] Hero Redesign
- [x] Score Breakdown Visualization (Radar + Components)
- [x] Benchmark Comparison
- [x] Signal Metrics Enhancement
- [x] Sidebar Enhancements
- [x] Overall Layout Structure
