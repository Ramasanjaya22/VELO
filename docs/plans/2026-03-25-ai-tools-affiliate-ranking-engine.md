# AI Tools Affiliate Ranking Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Pivot VELO from GitHub repo ranking into an AI tools affiliate ranking engine with segmented discovery, detail pages, and monetization hooks.

**Architecture:** Keep the current static SvelteKit app and replace the repo-centric domain model with tool-centric data, scoring, and routing. Preserve the ingestion → normalization → scoring → rendering pipeline, but change the source shape, ranking dimensions, and page map to support affiliate conversion and segment-based SEO content.

**Tech Stack:** Bun, SvelteKit, TypeScript, Tailwind CSS, static JSON, Firecrawl API, shadcn-svelte

---

### Task 1: Redefine the core data model for tools

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `data/trending.json` or the current data source file used by the homepage
- Modify: `src/routes/+page.server.ts`

**Step 1: Write the failing test**

Create or update a type-level assertion or narrow runtime fixture that expects a `Tool` shape instead of a repo shape.

**Step 2: Run test to verify it fails**

Run: `bun run typecheck`
Expected: type errors for missing tool fields and outdated repo-specific fields.

**Step 3: Write minimal implementation**

Add `Tool`, `ToolSource`, `ToolSignal`, `ToolScore`, `WeeklySnapshot`, and `SegmentRanking` types. Replace repo-specific fields with tool-centric fields such as `pricingModel`, `affiliateAvailable`, `affiliateUrl`, `useCases`, and `bestFor`.

**Step 4: Run test to verify it passes**

Run: `bun run typecheck`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/types.ts src/routes/+page.server.ts data/trending.json
git commit -m "feat: pivot core types to ai tools"
```

---

### Task 2: Replace repo scoring with affiliate ranking scoring

**Files:**
- Modify: `src/lib/scoring.ts`
- Modify: any scoring call sites in `src/routes/+page.server.ts`

**Step 1: Write the failing test**

Add a scoring fixture that validates the new weighting model:
`demand`, `affiliateReadiness`, `conversionFit`, `trust`, `useCaseRelevance`, `contentOpportunity`, and `differentiation`.

**Step 2: Run test to verify it fails**

Run: `bun run typecheck`
Expected: old repo-specific scoring symbols no longer satisfy the test fixture.

**Step 3: Write minimal implementation**

Replace stars/forks/language bias logic with the new weighted model. Keep the API simple: one function that accepts a tool signal object and returns a normalized final score plus component breakdown.

**Step 4: Run test to verify it passes**

Run: `bun run typecheck`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/scoring.ts src/routes/+page.server.ts
git commit -m "feat: add affiliate ranking score model"
```

---

### Task 3: Build the tool ingestion and normalization pipeline

**Files:**
- Modify: `scripts/scrape.ts`
- Create: `scripts/normalize-tool.ts` if a dedicated helper is needed
- Modify: `data/trending.json` output target or replace it with a tool dataset file

**Step 1: Write the failing test**

Add a small script-level fixture or validation that asserts normalized output contains required tool fields and affiliate metadata.

**Step 2: Run test to verify it fails**

Run: `bun run scrape --force --verbose`
Expected: current output still produces repo-shaped records or missing fields.

**Step 3: Write minimal implementation**

Update the scrape pipeline to ingest tool sources, normalize fields, detect affiliate availability, and emit the new dataset structure.

**Step 4: Run test to verify it passes**

Run: `bun run scrape --force --verbose`
Expected: output dataset contains normalized tools with score-ready fields.

**Step 5: Commit**

```bash
git add scripts/scrape.ts scripts/normalize-tool.ts data/trending.json
git commit -m "feat: normalize ai tools ingestion"
```

---

### Task 4: Rebuild the homepage as an AI tools leaderboard

**Files:**
- Modify: `src/routes/+page.svelte`
- Modify: `src/lib/components/ProductCard.svelte` or rename to a tool card component
- Modify: `src/lib/components/Hero.svelte`
- Modify: `src/lib/components/Navbar.svelte`

**Step 1: Write the failing test**

Add a page-level expectation that the homepage renders tool-centric labels, filters, and affiliate disclosure copy instead of GitHub repo language.

**Step 2: Run test to verify it fails**

Run: `bun run typecheck`
Expected: UI references still assume repo terminology.

**Step 3: Write minimal implementation**

Change the homepage to a leaderboard of AI tools with search, filters, best-for badges, and a clear CTA path to detail pages and affiliate links.

**Step 4: Run test to verify it passes**

Run: `bun run typecheck`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/routes/+page.svelte src/lib/components/ProductCard.svelte src/lib/components/Hero.svelte src/lib/components/Navbar.svelte
git commit -m "feat: rebuild homepage for ai tools"
```

---

### Task 5: Add tool detail pages and conversion-focused content blocks

**Files:**
- Modify: `src/routes/repo/[id]/+page.svelte`
- Modify: `src/routes/repo/[id]/+page.server.ts`
- Create: `src/routes/tool/[id]/+page.svelte`
- Create: `src/routes/tool/[id]/+page.server.ts`
- Modify: `src/routes/+layout.svelte` if navigation or metadata needs updating

**Step 1: Write the failing test**

Add a route-level fixture that expects tool detail content: overview, pricing, pros/cons, alternatives, FAQ, and affiliate CTA.

**Step 2: Run test to verify it fails**

Run: `bun run typecheck`
Expected: new route is missing or still references repo-specific assumptions.

**Step 3: Write minimal implementation**

Implement `/tool/[id]` as the new canonical detail page and keep old repo routes only if a redirect or compatibility layer is needed.

**Step 4: Run test to verify it passes**

Run: `bun run typecheck`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/routes/tool/[id]/+page.svelte src/routes/tool/[id]/+page.server.ts src/routes/repo/[id]/+page.svelte src/routes/repo/[id]/+page.server.ts
git commit -m "feat: add tool detail pages"
```

---

### Task 6: Add segment pages and monetization hooks

**Files:**
- Create: `src/routes/category/[slug]/+page.svelte`
- Create: `src/routes/category/[slug]/+page.server.ts`
- Create: `src/routes/best-for/[slug]/+page.svelte`
- Create: `src/routes/best-for/[slug]/+page.server.ts`
- Create: `src/routes/compare/[slug]/+page.svelte`
- Create: `src/routes/weekly/[weekKey]/+page.svelte`
- Modify: `src/routes/submit/+page.svelte`

**Step 1: Write the failing test**

Add route-level expectations for category, use-case, comparison, and weekly pages with affiliate disclosures and CTA blocks.

**Step 2: Run test to verify it fails**

Run: `bun run typecheck`
Expected: routes are missing or not wired to the new data model.

**Step 3: Write minimal implementation**

Create the segment pages with the smallest useful content blocks and the same shared ranking data source.

**Step 4: Run test to verify it passes**

Run: `bun run typecheck`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/routes/category src/routes/best-for src/routes/compare src/routes/weekly src/routes/submit/+page.svelte
git commit -m "feat: add segment pages and monetization hooks"
```

---

### Task 7: Verify build, lint, and static output

**Files:**
- Modify: only if verification exposes a real issue

**Step 1: Run lint**

Run: `bun run lint`
Expected: no formatting or lint errors.

**Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: no TypeScript or Svelte diagnostics.

**Step 3: Run production build**

Run: `bun run build`
Expected: static build succeeds and emits the expected routes.

**Step 4: Review generated output**

Confirm the built app contains the new tool-first pages and does not depend on GitHub repo wording.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: verify ai tools pivot"
```

