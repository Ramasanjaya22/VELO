import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { initDb, closeDb, getDb } from '../src/lib/server/db/index.js';
import { upsertTool, upsertCategory } from '../src/lib/server/db/tools.js';
import type { Tool, TrendingData } from '../src/lib/types';

const STATIC_DATA_PATH = join(process.cwd(), 'static', 'data', 'trending.json');
const HISTORY_DIR = join(process.cwd(), 'data', 'history');

function loadStaticData(): TrendingData | null {
	try {
		if (!existsSync(STATIC_DATA_PATH)) {
			console.log('[Migrate] No static data found at', STATIC_DATA_PATH);
			return null;
		}
		
		const content = readFileSync(STATIC_DATA_PATH, 'utf-8');
		return JSON.parse(content) as TrendingData;
	} catch (e) {
		console.error('[Migrate] Failed to load static data:', e);
		return null;
	}
}

function loadHistoryFiles(): TrendingData[] {
	const data: TrendingData[] = [];
	
	try {
		if (!existsSync(HISTORY_DIR)) {
			return data;
		}
		
		const { readdirSync } = require('fs');
		const files = readdirSync(HISTORY_DIR)
			.filter((f: string) => f.endsWith('.json'))
			.sort()
			.reverse()
			.slice(0, 5);
		
		for (const file of files) {
			try {
				const content = readFileSync(join(HISTORY_DIR, file), 'utf-8');
				data.push(JSON.parse(content) as TrendingData);
			} catch (e) {
				console.warn(`[Migrate] Failed to load ${file}:`, e);
			}
		}
	} catch (e) {
		console.error('[Migrate] Failed to load history:', e);
	}
	
	return data;
}

function extractCategories(tools: Tool[]): Map<string, { name: string; count: number }> {
	const categories = new Map<string, { name: string; count: number }>();
	
	for (const tool of tools) {
		if (tool.category) {
			const slug = tool.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
			const existing = categories.get(slug);
			if (existing) {
				existing.count++;
			} else {
				categories.set(slug, { name: tool.category, count: 1 });
			}
		}
	}
	
	return categories;
}

function migrate() {
	console.log('VELO Migration - JSON to SQLite');
	console.log('================================\n');
	
	initDb();
	
	let totalTools = 0;
	let totalCategories = 0;
	
	const staticData = loadStaticData();
	if (staticData && staticData.products) {
		console.log(`[Migrate] Found ${staticData.products.length} tools in static data`);
		
		const categories = extractCategories(staticData.products);
		
		for (const [slug, info] of categories) {
			upsertCategory(slug, info.name);
			totalCategories++;
		}
		console.log(`[Migrate] Migrated ${totalCategories} categories`);
		
		for (const tool of staticData.products) {
			if (!tool.id) {
				tool.id = `velo:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			}
			if (!tool.slug) {
				tool.slug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
			}
			
			upsertTool(tool);
			totalTools++;
		}
		
		console.log(`[Migrate] Migrated ${totalTools} tools from static data`);
	}
	
	const historyData = loadHistoryFiles();
	console.log(`[Migrate] Found ${historyData.length} history files`);
	
	for (const data of historyData) {
		if (data.products) {
			for (const tool of data.products) {
				if (!tool.id) {
					tool.id = `velo:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				}
				if (!tool.slug) {
					tool.slug = tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
				}
				
				upsertTool(tool);
				totalTools++;
			}
		}
	}
	
	console.log(`\n[SUCCESS] Migration complete!`);
	console.log(`  Total tools: ${totalTools}`);
	console.log(`  Total categories: ${totalCategories}`);
	
	closeDb();
}

migrate();
