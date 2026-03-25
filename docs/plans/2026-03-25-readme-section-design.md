# README Section for Tool Detail Page — Design Document

**Date:** 2026-03-25  
**Status:** Approved  
**Author:** Design Review

## Overview

Fetch and display GitHub README on-demand when users visit a tool detail page. Use Firecrawl to scrape the README content from the tool's GitHub repository page.

## Data Flow

```
User visits /tool/{slug}
    ↓
Check cache (in-memory or sessionStorage)
    ↓
If cached → Display immediately
If not cached → Fetch via Firecrawl API
    ↓
Store in sessionStorage
    ↓
Display README content
```

## API Endpoint

**File:** `src/routes/api/readme/+server.ts`

**Endpoint:** `GET /api/readme?url={github_url}`

**Request:**

```
GET /api/readme?url=https://github.com/unslothai/unsloth
```

**Response (success):**

```json
{
	"content": "# Unsloth Studio\n\nFast LLM fine-tuning...",
	"truncated": false,
	"cached": false
}
```

**Response (error):**

```json
{
	"error": "Failed to fetch README",
	"content": null
}
```

## Tool Detail Page Section

```
┌─────────────────────────────────────────────────────────────┐
│  README                                                  │
│  ─────────────────────────────────────────────────────── │
│                                                             │
│  # Project Name                                           │
│  Short project description...                             │
│                                                             │
│  ## Features                                              │
│  - Feature 1                                             │
│  - Feature 2                                             │
│                                                             │
│  [Truncated to 500 chars with "Read more..."]          │
└─────────────────────────────────────────────────────────────┘
```

### Layout

- New section below Signal Metrics section
- Full-width card with brutalist styling
- Section header: "README" with GitHub icon

## UI Components

### 1. README Card

- Border card: `border border-metal-100 bg-surface rounded-sm p-5`
- Header with icon and title
- Markdown content area

### 2. Markdown Rendering

Support basic markdown:

- `# Heading 1` → `<h1>`
- `## Heading 2` → `<h2>`
- `- list item` → `<ul><li>`
- `**bold**` → `<strong>`
- `` `code` `` → `<code>`
- `[link](url)` → `<a>`
- ` ```code block``` ` → `<pre><code>`

### 3. Truncation

- Show first ~500 characters
- "Read more" button to expand full content
- Smooth height animation

### 4. Loading State

```
┌─────────────────────────────────────────────────────────────┐
│  README                                       [Loading...] │
│  ─────────────────────────────────────────────────────── │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────────────────────┘
```

### 5. Error State

```
┌─────────────────────────────────────────────────────────────┐
│  README                                                  │
│  ─────────────────────────────────────────────────────── │
│  README not available for this repository.              │
└─────────────────────────────────────────────────────────────┘
```

### 6. Cached Indicator

Small badge: "Cached" with checkmark icon when served from sessionStorage

## Environment

```
FIRECRAWL_API_KEY=fc-2dd499caaec64c5d84b36675c6f0ee17
```

## Styling

- Match brutalist design (border-metal-900, accent-dim shadows on hover)
- Space Mono for labels, Space Grotesk for headings
- Monospace font for code blocks
- Proper heading hierarchy (h1, h2, h3 sizes)
- Link styling with accent-dim color
- List styling with custom bullets

## Files to Create/Modify

| File                                | Action                       |
| ----------------------------------- | ---------------------------- |
| `src/routes/api/readme/+server.ts`  | Create - API endpoint        |
| `src/routes/tool/[id]/+page.svelte` | Modify - Add README section  |
| `src/app.css`                       | Modify - Add markdown styles |
| `.env`                              | Add FIRECRAWL_API_KEY        |

## Caching Strategy

- **sessionStorage** key: `readme:{slug}`
- **TTL:** 1 hour
- **Format:** `{ content: string, fetchedAt: number }`

## Approval

- [x] API Endpoint Design
- [x] README Section UI
- [x] Markdown Rendering
- [x] Truncation
- [x] Loading State
- [x] Error State
- [x] Caching Strategy
- [x] Environment Configuration
