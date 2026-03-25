# README Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add README section to tool detail page that fetches and displays GitHub README on-demand via Firecrawl API.

**Architecture:**

- Create API endpoint at `/api/readme` that proxies Firecrawl scrape requests
- Client-side fetch on page load with sessionStorage caching
- Simple markdown-to-HTML renderer for README display

**Tech Stack:** SvelteKit server routes, sessionStorage, Firecrawl API

---

## Task 1: Create API Endpoint

**Files:**

- Create: `src/routes/api/readme/+server.ts`

**Step 1: Write the API endpoint**

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

export const GET: RequestHandler = async ({ url }) => {
	const githubUrl = url.searchParams.get('url');

	if (!githubUrl) {
		return json({ error: 'Missing url parameter' }, { status: 400 });
	}

	if (!FIRECRAWL_API_KEY) {
		return json({ error: 'FIRECRAWL_API_KEY not configured' }, { status: 500 });
	}

	try {
		const firecrawlUrl = 'https://api.firecrawl.dev/v0/scrape';

		const response = await fetch(firecrawlUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${FIRECRAWL_API_KEY}`
			},
			body: JSON.stringify({
				url: githubUrl,
				formats: ['markdown'],
				onlyMainContent: true
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[API/readme] Firecrawl error:', errorText);
			return json({ error: 'Failed to fetch README', content: null }, { status: 500 });
		}

		const data = await response.json();
		const content = data.data?.markdown || '';

		if (!content) {
			return json({ error: 'No README content found', content: null }, { status: 404 });
		}

		return json({
			content,
			truncated: content.length > 500,
			cached: false
		});
	} catch (error) {
		console.error('[API/readme] Error:', error);
		return json({ error: 'Internal server error', content: null }, { status: 500 });
	}
};
```

**Step 2: Test the endpoint**

Run: `bun run typecheck`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/routes/api/readme/+server.ts
git commit -m "feat(api): add README fetch endpoint"
```

---

## Task 2: Create Simple Markdown Renderer

**Files:**

- Create: `src/lib/utils/markdown.ts`

**Step 1: Write the markdown utility**

````typescript
export function parseMarkdown(text: string): string {
	if (!text) return '';

	let html = text
		// Escape HTML
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')

		// Code blocks (must be before inline code)
		.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')

		// Inline code
		.replace(/`([^`]+)`/g, '<code>$1</code>')

		// Bold
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

		// Italic
		.replace(/\*([^*]+)\*/g, '<em>$1</em>')

		// Links
		.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
		)

		// Headings
		.replace(/^### (.+)$/gm, '<h3>$1</h3>')
		.replace(/^## (.+)$/gm, '<h2>$1</h2>')
		.replace(/^# (.+)$/gm, '<h1>$1</h1>')

		// Unordered lists
		.replace(/^- (.+)$/gm, '<li>$1</li>')
		.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

		// Paragraphs (lines that don't start with HTML tags)
		.replace(/^(?!<[a-z]|$)(.+)$/gm, '<p>$1</p>')

		// Clean up extra whitespace
		.replace(/\n{3,}/g, '\n\n')
		.trim();

	return html;
}

export function truncateMarkdown(
	text: string,
	maxLength: number = 500
): { content: string; truncated: boolean } {
	if (text.length <= maxLength) {
		return { content: text, truncated: false };
	}

	// Find a good break point (end of sentence or paragraph)
	const truncated = text.slice(0, maxLength);
	const lastPeriod = truncated.lastIndexOf('.');
	const lastNewline = truncated.lastIndexOf('\n');
	const breakPoint =
		lastPeriod > maxLength * 0.7
			? lastPeriod + 1
			: lastNewline > maxLength * 0.7
				? lastNewline
				: maxLength;

	return {
		content: text.slice(0, breakPoint),
		truncated: true
	};
}
````

**Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/lib/utils/markdown.ts
git commit -m "feat(utils): add markdown parser utility"
```

---

## Task 3: Add README Section to Tool Page

**Files:**

- Modify: `src/routes/tool/[id]/+page.svelte`

**Step 1: Add README state and functions to script**

Add these after the existing derived values:

```svelte
let readmeContent = $state<string | null>(null);
let readmeLoading = $state(false);
let readmeError = $state<string | null>(null);
let readmeTruncated = $state(false);
let readmeExpanded = $state(false);

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCacheKey(slug: string): string {
	return `readme:${slug}`;
}

function getCachedReadme(slug: string): string | null {
	if (typeof sessionStorage === 'undefined') return null;
	const cached = sessionStorage.getItem(getCacheKey(slug));
	if (!cached) return null;
	try {
		const { content, fetchedAt } = JSON.parse(cached);
		if (Date.now() - fetchedAt > CACHE_TTL) {
			sessionStorage.removeItem(getCacheKey(slug));
			return null;
		}
		return content;
	} catch {
		return null;
	}
}

function setCachedReadme(slug: string, content: string): void {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(getCacheKey(slug), JSON.stringify({
		content,
		fetchedAt: Date.now()
	}));
}

async function fetchReadme() {
	if (!data.tool.url) return;

	const slug = data.tool.slug ?? data.tool.name;

	// Check cache first
	const cached = getCachedReadme(slug);
	if (cached) {
		readmeContent = cached;
		return;
	}

	readmeLoading = true;
	readmeError = null;

	try {
		const apiUrl = `/api/readme?url=${encodeURIComponent(data.tool.url)}`;
		const response = await fetch(apiUrl);
		const result = await response.json();

		if (result.error || !result.content) {
			readmeError = result.error || 'Failed to load README';
			readmeContent = null;
			return;
		}

		readmeContent = result.content;
		readmeTruncated = result.truncated;
		setCachedReadme(slug, result.content);
	} catch (err) {
		readmeError = 'Network error';
		readmeContent = null;
	} finally {
		readmeLoading = false;
	}
}

// Fetch README on mount
$effect(() => {
	fetchReadme();
});
```

**Step 2: Add README section to template**

Add this section after the Benchmark section (before the Signal Metrics section):

```svelte
<!-- README -->
{#if readmeLoading || readmeContent || readmeError}
	<section class="mt-8 border border-metal-100 bg-surface rounded-sm overflow-hidden">
		<div class="flex items-center justify-between px-5 py-3 border-b border-metal-100">
			<div class="flex items-center gap-2">
				<svg class="size-4" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
					/>
				</svg>
				<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">README</p>
			</div>
			{#if readmeLoading}
				<span class="text-[10px] text-metal-500 font-mono">Loading...</span>
			{/if}
		</div>
		<div class="p-5">
			{#if readmeLoading}
				<div class="space-y-2 animate-pulse">
					<div class="h-4 bg-metal-100 rounded w-3/4"></div>
					<div class="h-4 bg-metal-100 rounded w-1/2"></div>
					<div class="h-4 bg-metal-100 rounded w-5/6"></div>
					<div class="h-4 bg-metal-100 rounded w-2/3"></div>
				</div>
			{:else if readmeError}
				<p class="text-sm text-metal-500">{readmeError}</p>
			{:else if readmeContent}
				{@const displayContent =
					readmeExpanded || !readmeTruncated ? readmeContent : readmeContent.slice(0, 500)}
				<div class="readme-content prose">
					{@html parseMarkdown(displayContent)}
				</div>
				{#if readmeTruncated && !readmeExpanded}
					<button
						type="button"
						class="mt-4 text-xs uppercase tracking-[0.15em] font-mono text-metal-500 hover:text-metal-900 transition-colors"
						onclick={() => (readmeExpanded = true)}
					>
						Read more...
					</button>
				{/if}
			{/if}
		</div>
	</section>
{/if}
```

**Step 3: Add imports**

Add to the script imports:

```svelte
import {parseMarkdown} from '$lib/utils/markdown';
```

**Step 4: Run typecheck**

Run: `bun run typecheck`
Expected: 0 errors

**Step 5: Commit**

```bash
git add src/routes/tool/[id]/+page.svelte
git commit -m "feat(tool): add README section with on-demand fetching"
```

---

## Task 4: Add Markdown Styles

**Files:**

- Modify: `src/routes/tool/[id]/+page.svelte` (add to style block)

**Step 1: Add markdown styles**

```css
.readme-content {
	font-size: 0.875rem;
	line-height: 1.7;
	color: var(--metal-700);
}

.readme-content :global(h1) {
	font-size: 1.5rem;
	font-weight: 700;
	color: var(--metal-900);
	margin: 0 0 1rem;
	font-family: var(--font-heading);
}

.readme-content :global(h2) {
	font-size: 1.125rem;
	font-weight: 600;
	color: var(--metal-900);
	margin: 1.5rem 0 0.75rem;
	font-family: var(--font-heading);
}

.readme-content :global(h3) {
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--metal-900);
	margin: 1rem 0 0.5rem;
}

.readme-content :global(p) {
	margin: 0 0 1rem;
}

.readme-content :global(ul) {
	margin: 0 0 1rem;
	padding-left: 1.5rem;
	list-style-type: disc;
}

.readme-content :global(li) {
	margin: 0.25rem 0;
}

.readme-content :global(code) {
	font-family: var(--font-mono);
	font-size: 0.8em;
	background: var(--metal-100);
	padding: 0.15em 0.4em;
	border-radius: 0.125rem;
}

.readme-content :global(pre) {
	background: var(--metal-900);
	color: var(--surface);
	padding: 1rem;
	border-radius: 0.125rem;
	overflow-x: auto;
	margin: 1rem 0;
}

.readme-content :global(pre code) {
	background: transparent;
	padding: 0;
	font-size: 0.8rem;
}

.readme-content :global(a) {
	color: var(--accent-dim);
	text-decoration: underline;
}

.readme-content :global(a:hover) {
	color: var(--metal-900);
}

.readme-content :global(strong) {
	font-weight: 700;
	color: var(--metal-900);
}
```

**Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/routes/tool/[id]/+page.svelte
git commit -m "feat(tool): add README markdown styles"
```

---

## Task 5: Add Environment Variable

**Files:**

- Modify: Create `.env` file (if not exists) or update existing

**Step 1: Add environment variable**

```
FIRECRAWL_API_KEY=fc-2dd499caaec64c5d84b36675c6f0ee17
```

**Note:** Also create `.env.example` with placeholder:

```
FIRECRAWL_API_KEY=your_api_key_here
```

**Step 2: Commit**

```bash
git add .env
git commit -m "chore: add Firecrawl API key"
```

---

## Task 6: Final Verification

**Step 1: Run typecheck on entire project**

Run: `bun run typecheck`
Expected: 0 errors

**Step 2: Test in browser**

1. Start dev server: `bun run dev`
2. Navigate to `/tool/unslothai-unsloth`
3. Verify:
   - README section appears below Benchmark
   - Loading skeleton shows while fetching
   - README content renders with proper markdown styling
   - "Read more" button works for long READMEs
   - Caching works (refresh should show content immediately)

**Step 3: Test error state**

Navigate to a tool without GitHub URL (if available) to verify error handling.

---

## Summary of Files Changed

| File                                | Action                      |
| ----------------------------------- | --------------------------- |
| `src/routes/api/readme/+server.ts`  | Create - API endpoint       |
| `src/lib/utils/markdown.ts`         | Create - Markdown parser    |
| `src/routes/tool/[id]/+page.svelte` | Modify - Add README section |
| `.env`                              | Modify - Add API key        |

---

## Plan Complete

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
