# VELO - AI Tool Ranking App

## Project Purpose

VELO is a Product Hunt-style AI ranking app. Data sourced from GitHub Trending Weekly, curated with a metadata scoring system. Ranks AI tools based on multiple signals: demand, affiliate readiness, conversion fit, trust, use case relevance, content opportunity, and differentiation.

## Tech Stack

- **Runtime**: Bun
- **Framework**: SvelteKit with adapter-static
- **Components**: shadcn-svelte / Radix UI
- **Styling**: Tailwind CSS v4
- **Scraping**: Firecrawl API (via @mendable/firecrawl-js)
- **Data**: Static JSON in `data/` directory
- **Icons**: Custom SVG icons in `src/lib/icons/`
- **Fonts**: @fontsource/inter, @fontsource/space-grotesk, @fontsource/space-mono

## Key Dependencies

- svelte: ^5.20.1
- @sveltejs/kit: ^2.16.0
- @sveltejs/adapter-static: ^3.0.8
- tailwindcss: ^4.0.9
- @mendable/firecrawl-js: ^4.16.0
- cheerio: ^1.2.0 (for scraping)
- bits-ui: ^1.3.10 (UI components)
- class-variance-authority: ^0.7.1
- mode-watcher: ^0.5.1

## Data Structure

- `data/history/` - Weekly historical snapshots
- `data/weekly/` - Current week data (e.g., `2026-W12.json`)
- `data/stitch/` - Stitched data files

## Scoring Engine

Located in `src/lib/scoring.ts`. Main function: `scoreTool(tool, weights)` returns ToolScore with:

- 7 signal scores: demand, affiliateReadiness, conversionFit, trust, useCaseRelevance, contentOpportunity, differentiation
- Total weighted score (DEFAULT_WEIGHTS provided)
- `rankProducts(products)` - sorts and assigns ranks

## File Naming Conventions

- Components: `PascalCase.svelte` (e.g., `ProductCard.svelte`)
- Routes: `kebab-case/+page.svelte`
- Utils: `kebab-case.ts`
- UI components: `src/lib/components/ui/{component}/`

## Route Structure

- `/` - Homepage (main ranking)
- `/tool/[id]` - Tool detail page
- `/category/[slug]` - Category listing
- `/best-for/[slug]` - Best for specific use case
- `/compare/[slug]` - Compare tools
- `/weekly/[weekKey]` - Weekly archive
- `/archive` - Full archive
- `/profile/[id]` - Tool profile
- `/repo/[id]` - GitHub repo info
- `/about` - About page
- `/submit` - Submit tool
