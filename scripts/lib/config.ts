export const RETENTION_CONFIG = {
	TTL_MINUTES: 60,
	HISTORY_DIR: 'data/history',
	WEEKLY_DIR: 'data/weekly',
	KEEP_DAILY_DAYS: 30,
	KEEP_WEEKLY_WEEKS: 12
} as const;

export const SCRAPE_CONFIG = {
	FORCE_SCRAPE: process.argv.includes('--force'),
	VERBOSE: process.argv.includes('--verbose')
} as const;
