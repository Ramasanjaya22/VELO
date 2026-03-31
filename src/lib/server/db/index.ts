import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const DB_DIR = join(process.cwd(), 'data');
const DB_PATH = join(DB_DIR, 'velo.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
	if (db) return db;

	if (!existsSync(DB_DIR)) {
		mkdirSync(DB_DIR, { recursive: true });
	}

	db = new Database(DB_PATH);
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');

	return db;
}

export function initDb(): void {
	const database = getDb();

	database.exec(`
		CREATE TABLE IF NOT EXISTS tools (
			id TEXT PRIMARY KEY,
			slug TEXT UNIQUE NOT NULL,
			name TEXT NOT NULL,
			url TEXT NOT NULL,
			description TEXT NOT NULL,
			category TEXT,
			pricing_model TEXT DEFAULT 'unknown',
			affiliate_available INTEGER DEFAULT 0,
			affiliate_url TEXT,
			affiliate_commission TEXT,
			logo_url TEXT,
			avatar_url TEXT,
			trust_score REAL DEFAULT 0,
			base_score REAL DEFAULT 0,
			velocity_score REAL DEFAULT 0,
			engagement_score REAL DEFAULT 0,
			total_score REAL DEFAULT 0,
			upvotes INTEGER DEFAULT 0,
			views INTEGER DEFAULT 0,
			github_stars INTEGER DEFAULT 0,
			github_forks INTEGER DEFAULT 0,
			github_language TEXT,
			github_topics TEXT,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			last_synced_at TEXT
		);

		CREATE TABLE IF NOT EXISTS tool_use_cases (
			tool_id TEXT NOT NULL,
			use_case TEXT NOT NULL,
			PRIMARY KEY (tool_id, use_case),
			FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS tool_best_for (
			tool_id TEXT NOT NULL,
			segment TEXT NOT NULL,
			PRIMARY KEY (tool_id, segment),
			FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS tool_history (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			tool_id TEXT NOT NULL,
			github_stars INTEGER,
			github_forks INTEGER,
			upvotes INTEGER,
			views INTEGER,
			recorded_at TEXT NOT NULL,
			FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS upvotes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			tool_id TEXT NOT NULL,
			fingerprint TEXT NOT NULL,
			ip_hash TEXT,
			user_agent TEXT,
			created_at TEXT NOT NULL,
			UNIQUE(tool_id, fingerprint),
			FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS categories (
			slug TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT,
			tool_count INTEGER DEFAULT 0,
			created_at TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS tool_categories (
			tool_id TEXT NOT NULL,
			category_slug TEXT NOT NULL,
			PRIMARY KEY (tool_id, category_slug),
			FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
			FOREIGN KEY (category_slug) REFERENCES categories(slug) ON DELETE CASCADE
		);

		CREATE INDEX IF NOT EXISTS idx_tools_score ON tools(total_score DESC);
		CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
		CREATE INDEX IF NOT EXISTS idx_tools_updated ON tools(updated_at DESC);
		CREATE INDEX IF NOT EXISTS idx_tool_history_tool ON tool_history(tool_id, recorded_at);
		CREATE INDEX IF NOT EXISTS idx_upvotes_tool ON upvotes(tool_id);
	`);

	console.log('[DB] Database initialized at', DB_PATH);
}

export function closeDb(): void {
	if (db) {
		db.close();
		db = null;
	}
}
