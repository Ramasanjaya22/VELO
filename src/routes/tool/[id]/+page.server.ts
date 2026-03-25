import type { TrendingData, Tool } from '$lib/types';
import fs from 'fs';
import path from 'path';

interface PageData {
	tool: Tool;
	relatedTools: Tool[];
	compareTools: Tool[];
}

export async function load({ params }: { params: { id: string } }): Promise<PageData> {
	const historyDir = path.resolve('data', 'history');
	const files = fs.readdirSync(historyDir).filter((f) => f.endsWith('.json')).sort().reverse();
	const fallbackName = decodeURIComponent(params.id);

	if (files.length === 0) {
		return {
			tool: {
				rank: 0,
				name: fallbackName,
				url: `https://example.com/${fallbackName}`,
				description: 'Tool information not available.',
				pricingModel: 'unknown',
				affiliateAvailable: false,
				trustScore: 0,
				score: 0,
				category: 'general',
				useCases: [],
				bestFor: [],
				sourceIds: []
			},
			relatedTools: [],
			compareTools: []
		};
	}

	const fileContent = fs.readFileSync(path.join(historyDir, files[0]), 'utf-8');
	const trending: TrendingData = JSON.parse(fileContent);
	const tool = trending.products.find((p) => (p.slug ?? p.name) === params.id || p.name === fallbackName);
	const selected = tool ?? trending.products[0];

	if (!selected) {
		return {
			tool: {
				rank: 0,
				name: fallbackName,
				url: `https://example.com/${fallbackName}`,
				description: 'Tool information not available.',
				pricingModel: 'unknown',
				affiliateAvailable: false,
				trustScore: 0,
				score: 0,
				category: 'general',
				useCases: [],
				bestFor: [],
				sourceIds: []
			},
			relatedTools: [],
			compareTools: []
		};
	}

	const relatedTools = trending.products
		.filter((p) => p.name !== selected.name)
		.slice(0, 4);
	const compareTools = trending.products
		.filter((p) => p.name !== selected.name && (p.category ?? 'general') === (selected.category ?? 'general'))
		.slice(0, 3);

	return {
		tool: selected,
		relatedTools,
		compareTools
	};
}
