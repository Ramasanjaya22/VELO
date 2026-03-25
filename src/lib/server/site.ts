import fs from 'fs';
import path from 'path';

import type { TrendingData } from '$lib/types';

const SITE_URL = 'https://velo-428.pages.dev';

export function getTrendingData(): TrendingData {
	const historyDir = path.resolve('data', 'history');
	const files = fs
		.readdirSync(historyDir)
		.filter((file) => file.endsWith('.json'))
		.sort()
		.reverse();

	if (files.length > 0) {
		const filePath = path.join(historyDir, files[0]);
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		return JSON.parse(fileContent) as TrendingData;
	}

	const fallbackPath = path.resolve('static', 'data', 'trending.json');
	const fallbackContent = fs.readFileSync(fallbackPath, 'utf-8');
	return JSON.parse(fallbackContent) as TrendingData;
}

export function getSiteUrl() {
	return SITE_URL;
}

export function buildAbsoluteUrl(pathname = '/') {
	return new URL(pathname, SITE_URL).toString();
}
