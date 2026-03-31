import { initDb, closeDb } from '../src/lib/server/db/index.js';
import { ingestTrending, ingestRepo } from '../src/lib/server/ingestion/github.js';

const args = process.argv.slice(2);
const language = args.find(a => a.startsWith('--lang='))?.split('=')[1];
const since = (args.find(a => a.startsWith('--since='))?.split('=')[1] || 'weekly') as 'daily' | 'weekly' | 'monthly';
const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '25');
const repoArg = args.find(a => a.startsWith('--repo='))?.split('=')[1];

async function main() {
	console.log('VELO Ingest - GitHub Data');
	console.log('=========================\n');
	
	initDb();
	
	try {
		if (repoArg) {
			const [owner, repo] = repoArg.split('/');
			if (!owner || !repo) {
				console.error('[Error] Invalid repo format. Use: --repo=owner/repo');
				process.exit(1);
			}
			
			console.log(`[Ingest] Ingesting single repo: ${owner}/${repo}`);
			const tool = await ingestRepo(owner, repo);
			
			if (tool) {
				console.log(`[SUCCESS] Ingested: ${tool.name}`);
			} else {
				console.error(`[FAILED] Could not ingest ${owner}/${repo}`);
			}
		} else {
			console.log(`[Ingest] Fetching trending repos...`);
			console.log(`  Language: ${language || 'all'}`);
			console.log(`  Since: ${since}`);
			console.log(`  Limit: ${limit}\n`);
			
			const tools = await ingestTrending(language, since, limit);
			
			console.log(`\n[SUCCESS] Ingested ${tools.length} tools`);
			
			if (tools.length > 0) {
				console.log('\nTop 5 by stars:');
				tools
					.sort((a, b) => (b.stars || 0) - (a.stars || 0))
					.slice(0, 5)
					.forEach((tool, i) => {
						console.log(`  ${i + 1}. ${tool.name} (${tool.stars} stars)`);
					});
			}
		}
	} catch (error) {
		console.error('[FATAL] Ingestion failed:', error);
		process.exit(1);
	} finally {
		closeDb();
	}
}

main();
