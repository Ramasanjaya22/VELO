# VELO - Code Style & Conventions

## Design Rules (MUST FOLLOW)

1. **NO emoji** - anywhere in code, comments, or UI
2. **NO AI slop** - write direct, human-like copy
3. **NO large rounded corners** - use `rounded-sm` (4px) max, or `rounded-none` for sharp edges
4. **ASCII art only for branding** - hero, footer wordmark
5. **Svelte transitions only** - use built-in: fly, fade, flip, scale, slide
6. **Minimal** - prefer fewer components, cleaner code

## Color Tokens (CSS Variables in app.css)

```css
--bg: #fafafa; /* Background */
--surface: #ffffff; /* Card/panel surface */
--metal-100: #f0f0f0; /* Light borders */
--metal-300: #b0b0b0; /* Muted text */
--metal-500: #707070; /* Secondary text */
--metal-700: #3a3a3a; /* Primary text */
--metal-900: #1a1a1a; /* Headings */
--accent: #00e676; /* Primary accent (green) */
--accent-dim: #00c853; /* Dimmed accent */
--matrix: #00ff41; /* Matrix green (special) */
```

## Typography

- **Headings**: Space Grotesk (700, 600) - import from @fontsource/space-grotesk
- **Body**: Inter (400) - import from @fontsource/inter
- **Scores/Numbers**: Space Grotesk Mono (700) - import from @fontsource/space-mono

## Tailwind Usage

- Use `rounded-sm` for small radius, NOT `rounded-lg` or `rounded-xl`
- Use `rounded-none` for sharp corners
- Use shadcn-svelte components as base, customize via Tailwind

## Component Patterns

- shadcn-svelte UI components in `src/lib/components/ui/`
- Custom components in `src/lib/components/` (PascalCase)
- Icons: Custom SVG in `src/lib/icons/` (PascalCase filenames)

## Svelte Patterns

- Use Svelte 5 runes ($state, $derived, $effect) for reactivity
- Page components: `+page.svelte` with `+page.server.ts` for data loading
- Shared logic: utils in `src/lib/utils/` or `src/lib/server/`

## TypeScript

- Strict typing via `src/lib/types.ts`
- Tool interface with all fields typed
- ScoreWeights and DEFAULT_WEIGHTS exported from types.ts
