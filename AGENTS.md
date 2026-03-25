# VELO Project Instructions

## Project Overview

VELO adalah Product Hunt-style AI ranking app. Data dari GitHub Trending Weekly, di-curate dengan metadata scoring system.

## Quick Start

```bash
bun install
bun run dev
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: SvelteKit (adapter-static)
- **Components**: shadcn-svelte / Radix UI
- **Styling**: Tailwind CSS
- **Scraping**: Firecrawl API
- **Data**: Static JSON

## Commands

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `bun run dev`       | Start dev server             |
| `bun run build`     | Build static site            |
| `bun run preview`   | Preview production build     |
| `bun run scrape`    | Run scraping script (MVP v1) |
| `bun run lint`      | Run linter                   |
| `bun run typecheck` | Run type checking            |

## Code Style

### Rules (MUST FOLLOW)

1. **NO emoji** — anywhere in code, comments, or UI
2. **NO AI slop** — write direct, human-like copy
3. **NO rounded corners (large)** — use `rounded-sm` (4px) max
4. **ASCII art** — use for branding elements only
5. **Svelte transitions** — use built-in transitions only (fly, fade, flip, scale, slide)
6. **Minimal** — prefer fewer components, cleaner code

### Color Tokens

Use these CSS variables (defined in `app.css`):

```css
--bg: #fafafa;
--surface: #ffffff;
--metal-100: #f0f0f0;
--metal-300: #b0b0b0;
--metal-500: #707070;
--metal-700: #3a3a3a;
--metal-900: #1a1a1a;
--accent: #00e676;
--accent-dim: #00c853;
--matrix: #00ff41;
```

### Typography

- **Headings**: Space Grotesk (700, 600)
- **Body**: Inter (400)
- **Mono**: Space Grotesk Mono (700) — for scores only

### File Naming

- Components: `PascalCase.svelte`
- Routes: `kebab-case/+page.svelte`
- Utils: `kebab-case.ts`

## Project Structure

```
velo/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable components
│   │   ├── utils/         # Helper functions
│   │   ├── scoring.ts     # Scoring engine
│   │   └── types.ts       # TypeScript types
│   ├── routes/
│   │   └── +page.svelte   # Main page
│   ├── app.html           # HTML template
│   └── app.css            # Global styles
├── static/
│   └── fonts/             # Self-hosted fonts
├── data/
│   └── trending.json      # Data source
├── scripts/
│   └── scrape.ts          # Scraping script
└── AGENTS.md              # This file
```

## Scoring Formula

```typescript
Score =
	starsGrowth * 0.4 +
	forks * 0.15 +
	descQuality * 0.1 +
	contributors * 0.1 +
	topicRelevance * 0.1 +
	languagePerfBias * 0.15;
```

Language bias: Rust, Go, C++, TypeScript, Zig = higher score.

## Architecture

### MVP v1 (Current)

1. Manual script runs `bun run scrape`
2. Script fetches GitHub Trending via Firecrawl
3. Applies scoring formula
4. Writes `data/trending.json`
5. SvelteKit builds static site
6. Deploy to Vercel

### Future Iterations

- MVP v2: Filter by language, auto-category
- MVP v3: Vercel Cron, detail pages, history

## ASCII Wordmark

Use this for branding (hero, footer):

```
  ╦ ╦╔═╗╔╗    ╔═╗
  ║ ║╠═╝╠╩╗   ╠╦╝
  ╚═╝╩  ╚═╝───╩╚═
```

## Dependencies

### Required

- bun >= 1.0.0
- Node.js >= 18 (for some tooling)

### Key Packages

- @sveltejs/kit
- @sveltejs/adapter-static
- tailwindcss
- shadcn-svelte components

## Testing

```bash
bun run test
```

## Deployment

1. `bun run build`
2. Output in `build/` directory
3. Deploy to Vercel (auto-detected)
