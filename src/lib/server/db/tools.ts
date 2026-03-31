import type { Tool, PricingModel } from '$lib/types';
import { getDb } from './index';

export interface DbTool {
	id: string;
	slug: string;
	name: string;
	url: string;
	description: string;
	category: string | null;
	pricing_model: string;
	affiliate_available: number;
	affiliate_url: string | null;
	affiliate_commission: string | null;
	logo_url: string | null;
	avatar_url: string | null;
	trust_score: number;
	base_score: number;
	velocity_score: number;
	engagement_score: number;
	total_score: number;
	upvotes: number;
	views: number;
	github_stars: number;
	github_forks: number;
	github_language: string | null;
	github_topics: string | null;
	created_at: string;
	updated_at: string;
	last_synced_at: string | null;
}

function dbToolToTool(dbTool: DbTool, useCases: string[] = [], bestFor: string[] = []): Tool {
	return {
		id: dbTool.id,
		slug: dbTool.slug,
		name: dbTool.name,
		url: dbTool.url,
		description: dbTool.description,
		category: dbTool.category ?? undefined,
		pricingModel: dbTool.pricing_model as PricingModel,
		affiliateAvailable: dbTool.affiliate_available === 1,
		affiliateUrl: dbTool.affiliate_url ?? undefined,
		affiliateCommission: dbTool.affiliate_commission ?? undefined,
		logoUrl: dbTool.logo_url ?? undefined,
		avatarUrl: dbTool.avatar_url ?? undefined,
		trustScore: dbTool.trust_score,
		score: dbTool.total_score,
		upvotes: dbTool.upvotes,
		views: dbTool.views,
		useCases,
		bestFor,
		stars: dbTool.github_stars,
		forks: dbTool.github_forks,
		language: dbTool.github_language ?? undefined,
		topics: dbTool.github_topics ? JSON.parse(dbTool.github_topics) : [],
		updatedAt: dbTool.updated_at,
		legacy: {
			language: dbTool.github_language ?? undefined,
			stars: dbTool.github_stars,
			starsGrowth: 0,
			forks: dbTool.github_forks,
			topics: dbTool.github_topics ? JSON.parse(dbTool.github_topics) : [],
			contributors: 0
		}
	};
}

export function getAllTools(limit = 100, offset = 0): Tool[] {
	const db = getDb();
	const stmt = db.prepare(`
		SELECT * FROM tools 
		ORDER BY total_score DESC 
		LIMIT ? OFFSET ?
	`);
	
	const rows = stmt.all(limit, offset) as DbTool[];
	
	return rows.map(row => {
		const useCases = getToolUseCases(row.id);
		const bestFor = getToolBestFor(row.id);
		return dbToolToTool(row, useCases, bestFor);
	});
}

export function getToolBySlug(slug: string): Tool | null {
	const db = getDb();
	const stmt = db.prepare('SELECT * FROM tools WHERE slug = ?');
	const row = stmt.get(slug) as DbTool | undefined;
	
	if (!row) return null;
	
	const useCases = getToolUseCases(row.id);
	const bestFor = getToolBestFor(row.id);
	return dbToolToTool(row, useCases, bestFor);
}

export function getToolById(id: string): Tool | null {
	const db = getDb();
	const stmt = db.prepare('SELECT * FROM tools WHERE id = ?');
	const row = stmt.get(id) as DbTool | undefined;
	
	if (!row) return null;
	
	const useCases = getToolUseCases(row.id);
	const bestFor = getToolBestFor(row.id);
	return dbToolToTool(row, useCases, bestFor);
}

export function getToolsByCategory(categorySlug: string, limit = 50): Tool[] {
	const db = getDb();
	const stmt = db.prepare(`
		SELECT t.* FROM tools t
		JOIN tool_categories tc ON t.id = tc.tool_id
		WHERE tc.category_slug = ?
		ORDER BY t.total_score DESC
		LIMIT ?
	`);
	
	const rows = stmt.all(categorySlug, limit) as DbTool[];
	
	return rows.map(row => {
		const useCases = getToolUseCases(row.id);
		const bestFor = getToolBestFor(row.id);
		return dbToolToTool(row, useCases, bestFor);
	});
}

export function searchTools(query: string, limit = 20): Tool[] {
	const db = getDb();
	const stmt = db.prepare(`
		SELECT * FROM tools 
		WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
		ORDER BY total_score DESC
		LIMIT ?
	`);
	
	const searchTerm = `%${query}%`;
	const rows = stmt.all(searchTerm, searchTerm, searchTerm, limit) as DbTool[];
	
	return rows.map(row => {
		const useCases = getToolUseCases(row.id);
		const bestFor = getToolBestFor(row.id);
		return dbToolToTool(row, useCases, bestFor);
	});
}

export function upsertTool(tool: Partial<Tool> & { id: string; slug: string; name: string; url: string; description: string }): void {
	const db = getDb();
	const now = new Date().toISOString();
	
	const stmt = db.prepare(`
		INSERT INTO tools (
			id, slug, name, url, description, category, pricing_model,
			affiliate_available, affiliate_url, affiliate_commission,
			logo_url, avatar_url, trust_score, base_score, velocity_score,
			engagement_score, total_score, github_stars, github_forks,
			github_language, github_topics, created_at, updated_at, last_synced_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			slug = excluded.slug,
			name = excluded.name,
			url = excluded.url,
			description = excluded.description,
			category = excluded.category,
			pricing_model = excluded.pricing_model,
			affiliate_available = excluded.affiliate_available,
			affiliate_url = excluded.affiliate_url,
			affiliate_commission = excluded.affiliate_commission,
			logo_url = excluded.logo_url,
			avatar_url = excluded.avatar_url,
			trust_score = excluded.trust_score,
			base_score = excluded.base_score,
			velocity_score = excluded.velocity_score,
			engagement_score = excluded.engagement_score,
			total_score = excluded.total_score,
			github_stars = excluded.github_stars,
			github_forks = excluded.github_forks,
			github_language = excluded.github_language,
			github_topics = excluded.github_topics,
			updated_at = excluded.updated_at,
			last_synced_at = excluded.last_synced_at
	`);
	
	stmt.run(
		tool.id,
		tool.slug,
		tool.name,
		tool.url,
		tool.description,
		tool.category ?? null,
		tool.pricingModel ?? 'unknown',
		tool.affiliateAvailable ? 1 : 0,
		tool.affiliateUrl ?? null,
		tool.affiliateCommission ?? null,
		tool.logoUrl ?? null,
		tool.avatarUrl ?? null,
		tool.trustScore ?? 0,
		tool.score ?? 0,
		0,
		0,
		tool.score ?? 0,
		tool.stars ?? 0,
		tool.forks ?? 0,
		tool.language ?? null,
		tool.topics ? JSON.stringify(tool.topics) : null,
		tool.createdAt ?? now,
		now,
		now
	);
	
	if (tool.useCases) {
		setToolUseCases(tool.id, tool.useCases);
	}
	
	if (tool.bestFor) {
		setToolBestFor(tool.id, tool.bestFor);
	}
}

export function updateToolScore(id: string, scores: { base?: number; velocity?: number; engagement?: number; total?: number }): void {
	const db = getDb();
	const stmt = db.prepare(`
		UPDATE tools SET
			base_score = COALESCE(?, base_score),
			velocity_score = COALESCE(?, velocity_score),
			engagement_score = COALESCE(?, engagement_score),
			total_score = COALESCE(?, total_score),
			updated_at = ?
		WHERE id = ?
	`);
	
	stmt.run(
		scores.base ?? null,
		scores.velocity ?? null,
		scores.engagement ?? null,
		scores.total ?? null,
		new Date().toISOString(),
		id
	);
}

export function incrementToolViews(id: string): void {
	const db = getDb();
	const stmt = db.prepare(`
		UPDATE tools SET views = views + 1 WHERE id = ?
	`);
	stmt.run(id);
}

export function getToolUseCases(toolId: string): string[] {
	const db = getDb();
	const stmt = db.prepare('SELECT use_case FROM tool_use_cases WHERE tool_id = ?');
	const rows = stmt.all(toolId) as { use_case: string }[];
	return rows.map(r => r.use_case);
}

export function setToolUseCases(toolId: string, useCases: string[]): void {
	const db = getDb();
	const deleteStmt = db.prepare('DELETE FROM tool_use_cases WHERE tool_id = ?');
	deleteStmt.run(toolId);
	
	const insertStmt = db.prepare('INSERT INTO tool_use_cases (tool_id, use_case) VALUES (?, ?)');
	for (const useCase of useCases) {
		insertStmt.run(toolId, useCase);
	}
}

export function getToolBestFor(toolId: string): string[] {
	const db = getDb();
	const stmt = db.prepare('SELECT segment FROM tool_best_for WHERE tool_id = ?');
	const rows = stmt.all(toolId) as { segment: string }[];
	return rows.map(r => r.segment);
}

export function setToolBestFor(toolId: string, bestFor: string[]): void {
	const db = getDb();
	const deleteStmt = db.prepare('DELETE FROM tool_best_for WHERE tool_id = ?');
	deleteStmt.run(toolId);
	
	const insertStmt = db.prepare('INSERT INTO tool_best_for (tool_id, segment) VALUES (?, ?)');
	for (const segment of bestFor) {
		insertStmt.run(toolId, segment);
	}
}

export function recordToolHistory(toolId: string, data: { stars?: number; forks?: number; upvotes?: number; views?: number }): void {
	const db = getDb();
	const stmt = db.prepare(`
		INSERT INTO tool_history (tool_id, github_stars, github_forks, upvotes, views, recorded_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`);
	
	stmt.run(
		toolId,
		data.stars ?? null,
		data.forks ?? null,
		data.upvotes ?? null,
		data.views ?? null,
		new Date().toISOString()
	);
}

export function getToolHistory(toolId: string, days = 30): Array<{ date: string; stars: number; upvotes: number }> {
	const db = getDb();
	const stmt = db.prepare(`
		SELECT recorded_at, github_stars, upvotes 
		FROM tool_history 
		WHERE tool_id = ? 
		AND recorded_at > datetime('now', '-${days} days')
		ORDER BY recorded_at ASC
	`);
	
	const rows = stmt.all(toolId) as Array<{ recorded_at: string; github_stars: number; upvotes: number }>;
	
	return rows.map(row => ({
		date: row.recorded_at,
		stars: row.github_stars,
		upvotes: row.upvotes
	}));
}

export function hasUpvoted(toolId: string, fingerprint: string): boolean {
	const db = getDb();
	const stmt = db.prepare('SELECT 1 FROM upvotes WHERE tool_id = ? AND fingerprint = ?');
	const row = stmt.get(toolId, fingerprint);
	return !!row;
}

export function addUpvote(toolId: string, fingerprint: string, ipHash?: string, userAgent?: string): boolean {
	const db = getDb();
	
	try {
		const stmt = db.prepare(`
			INSERT INTO upvotes (tool_id, fingerprint, ip_hash, user_agent, created_at)
			VALUES (?, ?, ?, ?, ?)
		`);
		
		stmt.run(
			toolId,
			fingerprint,
			ipHash ?? null,
			userAgent ?? null,
			new Date().toISOString()
		);
		
		const updateStmt = db.prepare('UPDATE tools SET upvotes = upvotes + 1 WHERE id = ?');
		updateStmt.run(toolId);
		
		return true;
	} catch (e) {
		return false;
	}
}

export function removeUpvote(toolId: string, fingerprint: string): boolean {
	const db = getDb();
	
	const stmt = db.prepare('DELETE FROM upvotes WHERE tool_id = ? AND fingerprint = ?');
	const result = stmt.run(toolId, fingerprint);
	
	if (result.changes > 0) {
		const updateStmt = db.prepare('UPDATE tools SET upvotes = MAX(0, upvotes - 1) WHERE id = ?');
		updateStmt.run(toolId);
		return true;
	}
	
	return false;
}

export function getUpvoteCount(toolId: string): number {
	const db = getDb();
	const stmt = db.prepare('SELECT upvotes FROM tools WHERE id = ?');
	const row = stmt.get(toolId) as { upvotes: number } | undefined;
	return row?.upvotes ?? 0;
}

export function getCategories(): Array<{ slug: string; name: string; count: number }> {
	const db = getDb();
	const stmt = db.prepare(`
		SELECT c.slug, c.name, COUNT(tc.tool_id) as count
		FROM categories c
		LEFT JOIN tool_categories tc ON c.slug = tc.category_slug
		GROUP BY c.slug
		ORDER BY count DESC
	`);
	
	return stmt.all() as Array<{ slug: string; name: string; count: number }>;
}

export function upsertCategory(slug: string, name: string, description?: string): void {
	const db = getDb();
	const stmt = db.prepare(`
		INSERT INTO categories (slug, name, description, created_at)
		VALUES (?, ?, ?, ?)
		ON CONFLICT(slug) DO UPDATE SET
			name = excluded.name,
			description = COALESCE(excluded.description, description)
	`);
	
	stmt.run(
		slug,
		name,
		description ?? null,
		new Date().toISOString()
	);
}

export function getTrendingTools(hours = 24, limit = 10): Tool[] {
	const db = getDb();
	const stmt = db.prepare(`
		SELECT t.*, 
			(t.upvotes - COALESCE(
				(SELECT upvotes FROM tool_history 
				 WHERE tool_id = t.id 
				 AND recorded_at < datetime('now', '-${hours} hours')
				 ORDER BY recorded_at DESC LIMIT 1),
				0
			)) as recent_upvotes
		FROM tools t
		ORDER BY recent_upvotes DESC, t.velocity_score DESC
		LIMIT ?
	`);
	
	const rows = stmt.all(limit) as Array<DbTool & { recent_upvotes: number }>;
	
	return rows.map(row => {
		const useCases = getToolUseCases(row.id);
		const bestFor = getToolBestFor(row.id);
		return dbToolToTool(row, useCases, bestFor);
	});
}
