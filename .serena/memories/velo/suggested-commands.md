# VELO - Suggested Commands (Windows/Bun)

## Development

```bash
bun run dev          # Start dev server (vite)
bun run build        # Build static site
bun run preview      # Preview production build
```

## Scraping & Data

```bash
bun run scrape              # Run scraping script (fetch GitHub Trending)
bun run scrape:force        # Force scrape (ignore cache)
bun run scrape:verbose       # Verbose logging during scrape
bun run rollup              # Create weekly rollup archive
bun run archive:cleanup      # Cleanup old archives
```

## Code Quality

```bash
bun run lint          # Run prettier + eslint
bun run typecheck     # Run svelte-check with tsconfig
bun run format        # Format all files with prettier
```

## Testing

```bash
bun run test          # Run tests (if configured)
```

## Key File Paths

- Scraper: `scripts/scrape.ts`
- Scoring: `src/lib/scoring.ts`
- Types: `src/lib/types.ts`
- Data: `data/weekly/`, `data/history/`

## Environment Variables

- Copy `.env.example` to `.env`
- `FIRECRAWL_API_KEY` - Firecrawl API key for scraping
