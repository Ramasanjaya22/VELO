# VELO — Design Document

> github trending. ranked. fast.

## Overview

VELO adalah Product Hunt-style ranking app yang data-nya berasal dari
GitHub Trending Weekly. Repositori di-curate menggunakan metadata scoring
system, bukan LLM analysis. Fokus pada kecepatan, minimalisme, dan
branding yang kuat.

## Konsep Visual

Minimalist white + metallic gray + electric green accent.
No emoji, no AI slop, no rounded corners. Sharp, fast, direct.

Branding menggunakan ASCII art wordmark sebagai identitas utama.

## Arsitektur

### Approach: Static Site + Manual Script (MVP v1)

```
Manual Script (bun run scrape)
  -> Firecrawl API -> GitHub Trending Weekly
  -> Extract metadata
  -> Scoring engine
  -> Write data/trending.json
  -> SvelteKit static build
  -> Deploy Vercel
```

### Tech Stack

| Layer      | Tech                       |
| ---------- | -------------------------- |
| Runtime    | Bun                        |
| Framework  | SvelteKit + adapter-static |
| Components | shadcn-svelte / Radix UI   |
| Styling    | Tailwind CSS               |
| Scraping   | Firecrawl API              |
| Data       | Static JSON                |
| Hosting    | Vercel                     |
| Fonts      | Space Grotesk + Inter      |

## Scoring Formula

```
Score = (starsGrowth * 0.40)
      + (forks * 0.15)
      + (descQuality * 0.10)
      + (contributors * 0.10)
      + (topicRelevance * 0.10)
      + (languagePerfBias * 0.15)
```

Language bias: Rust, Go, C++, TypeScript, Zig = higher score.

## Style Guide

### Colors

| Token      | Hex     | Usage              |
| ---------- | ------- | ------------------ |
| bg         | #FAFAFA | Background utama   |
| surface    | #FFFFFF | Card, container    |
| metal-100  | #F0F0F0 | Dividers, borders  |
| metal-300  | #B0B0B0 | Secondary text     |
| metal-500  | #707070 | Body text          |
| metal-700  | #3A3A3A | Headings           |
| metal-900  | #1A1A1A | Primary text       |
| accent     | #00E676 | CTA, score badge   |
| accent-dim | #00C853 | Hover state        |
| matrix     | #00FF41 | Trending indicator |

### Typography

| Elemen     | Font               | Weight | Size |
| ---------- | ------------------ | ------ | ---- |
| Hero       | Space Grotesk      | 700    | 48px |
| Section    | Space Grotesk      | 600    | 24px |
| Card title | Space Grotesk      | 500    | 18px |
| Body       | Inter              | 400    | 16px |
| Metadata   | Inter              | 400    | 14px |
| Score      | Space Grotesk Mono | 700    | 32px |

### Rules

- NO emoji anywhere
- NO AI-generated copy
- ASCII art as branding element
- Svelte native transitions only (CSS-driven)
- Border radius: 4px (sharp)
- Shadow: 0 1px 3px rgba(0,0,0,0.04)
- Max width: 1200px

## Animasi

| Element       | Svelte Transition               |
| ------------- | ------------------------------- |
| Hero Entrance | fly: { y: 20, duration: 600 }   |
| Cards Stagger | fly: { y: 30, delay: i \* 80 }  |
| Score Counter | flip: { duration: 300 }         |
| Speed Line    | CSS keyframe pulse (3s)         |
| List Reorder  | animate:flip: { duration: 250 } |

## Data Schema

```json
{
	"lastUpdated": "2026-03-21T00:00:00Z",
	"source": "github-trending-weekly",
	"products": [
		{
			"rank": 1,
			"name": "repo-name",
			"url": "https://github.com/...",
			"description": "Short description",
			"language": "Rust",
			"stars": 12400,
			"starsGrowth": 3200,
			"forks": 892,
			"topics": ["cli", "performance"],
			"contributors": 45,
			"score": 87.4,
			"avatarUrl": "..."
		}
	]
}
```

## UI Layout

### Single Page Structure

1. Hero: ASCII wordmark + tagline + speed line animation
2. Product List: Card grid (1 col mobile, 2 tablet, 3 desktop)
3. Footer: ASCII wordmark (small)

### Card Component

```
┌─────────────────────────────────────┐
│ >  repo-name               [87.4]  │
│   Short description of project      │
│   12.4k  892  Rust                  │
└─────────────────────────────────────→
```

## Iterasi Roadmap

| Version | Features                      |
| ------- | ----------------------------- |
| MVP v1  | Static list, manual scrape    |
| MVP v2  | Filter by language + category |
| MVP v3  | Cron automation, detail page  |

## Branding

### ASCII Wordmark

```
  ╦ ╦╔═╗╔╗    ╔═╗
  ║ ║╠═╝╠╩╗   ╠╦╝
  ╚═╝╩  ╚═╝───╩╚═
```

### Tagline

> github trending. ranked. fast.
