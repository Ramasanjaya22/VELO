import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import type { TrendingData, WeeklyRollup } from '../src/lib/types';
import { RETENTION_CONFIG } from './lib/config';
import { ensureDir, readJSON, writeJSON, cleanupOldFiles, getWeekPrefix } from './lib/fs-utils';

interface ArchivedSnapshot extends TrendingData {
	archivedAt: string;
}

function getWeekNumber(date: Date): number {
	const startOfYear = new Date(date.getFullYear(), 0, 1);
	const days = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
	return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

function getCurrentWeekSnapshots(): ArchivedSnapshot[] {
	const historyDir = join(process.cwd(), RETENTION_CONFIG.HISTORY_DIR);
	if (!existsSync(historyDir)) return [];

	const currentWeek = getWeekNumber(new Date());
	const currentYear = new Date().getFullYear();
	const snapshots: ArchivedSnapshot[] = [];

	const files = readdirSync(historyDir);
	for (const file of files) {
		if (!file.match(/^\d{4}-\d{2}-\d{2}\.json$/)) continue;

		const filePath = join(historyDir, file);
		const fileDate = new Date(file.replace('.json', ''));
		const fileWeek = getWeekNumber(fileDate);
		const fileYear = fileDate.getFullYear();

		if (fileWeek === currentWeek && fileYear === currentYear) {
			const data = readJSON<ArchivedSnapshot>(filePath);
			if (data) snapshots.push(data);
		}
	}

	return snapshots;
}

function generateWeeklyRollup(): WeeklyRollup {
	const snapshots = getCurrentWeekSnapshots();
	const weekPrefix = getWeekPrefix();

	if (snapshots.length === 0) {
		return {
			week: weekPrefix,
			startDate: new Date().toISOString().split('T')[0],
			endDate: new Date().toISOString().split('T')[0],
			averageScore: 0,
			topProducts: [],
			productCount: 0
		};
	}

	// Aggregate data from snapshots
	const allScores: number[] = [];
	const productScores = new Map<string, { name: string; score: number; category: string }>();

	for (const snapshot of snapshots) {
		for (const product of snapshot.products) {
			const score = product.score ?? 0;
			allScores.push(score);

			const existing = productScores.get(product.name);
			if (!existing || score > existing.score) {
				productScores.set(product.name, {
					name: product.name,
					score,
					category: product.category ?? 'general'
				});
			}
		}
	}

	const topProducts = Array.from(productScores.values())
		.sort((a, b) => b.score - a.score)
		.slice(0, 10)
		.map((p) => ({ name: p.name, score: p.score, category: p.category }));

	const averageScore =
		allScores.length > 0
			? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
			: 0;

	const dates = snapshots
		.map((s) => new Date(s.lastUpdated))
		.sort((a, b) => a.getTime() - b.getTime());

	return {
		week: weekPrefix,
		startDate: dates[0]?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
		endDate:
			dates[dates.length - 1]?.toISOString().split('T')[0] ||
			new Date().toISOString().split('T')[0],
		averageScore,
		topProducts,
		productCount: productScores.size
	};
}

function cleanupOldArchives(): void {
	const historyDir = join(process.cwd(), RETENTION_CONFIG.HISTORY_DIR);
	const weeklyDir = join(process.cwd(), RETENTION_CONFIG.WEEKLY_DIR);

	cleanupOldFiles(
		historyDir,
		RETENTION_CONFIG.KEEP_DAILY_DAYS * 24 * 60 * 60 * 1000,
		/^\d{4}-\d{2}-\d{2}\.json$/
	);

	cleanupOldFiles(
		weeklyDir,
		RETENTION_CONFIG.KEEP_WEEKLY_WEEKS * 7 * 24 * 60 * 60 * 1000,
		/^\d{4}-W\d{2}\.json$/
	);
}

const isMain = process.argv[1]?.includes('rollup.ts') ?? false;
const cleanupOnly = process.argv.includes('--cleanup-only');

if (isMain) {
	console.log('VELO Rollup - Weekly aggregation');
	console.log('================================\n');

	if (cleanupOnly) {
		cleanupOldArchives();
		console.log('[INFO] Old archives cleaned up');
		process.exit(0);
	}

	const rollup = generateWeeklyRollup();

	const weeklyDir = join(process.cwd(), RETENTION_CONFIG.WEEKLY_DIR);
	ensureDir(weeklyDir);

	const outputPath = join(weeklyDir, `${rollup.week}.json`);
	writeJSON(outputPath, rollup);

	console.log(`[SUCCESS] Weekly rollup saved: ${outputPath}`);
	console.log(`[INFO] Week: ${rollup.week}`);
	console.log(`[INFO] Products: ${rollup.productCount}`);
	console.log(`[INFO] Average Score: ${rollup.averageScore}`);

	if (rollup.topProducts.length > 0) {
		console.log('\n[INFO] Top 5 this week:');
		rollup.topProducts.slice(0, 5).forEach((p, i) => {
			console.log(`  ${i + 1}. ${p.name} - Score: ${(p.score ?? 0).toFixed(1)} (${p.category})`);
		});
	}

	cleanupOldArchives();
	console.log('\n[INFO] Old archives cleaned up');
}

export { generateWeeklyRollup, cleanupOldArchives };
