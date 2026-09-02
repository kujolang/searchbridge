import { SearchBridgeClient, validateResult } from './index.js';
import { resolve } from 'node:path';
const client = new SearchBridgeClient(process.env.SEARCHBRIDGE_BIN || resolve('../..', 'searchbridge'), '../..');
const result = await client.fetch('analytics', 'google-analytics-4', ['--fixture', '--offline', '--deterministic']);
if (!validateResult(result)) throw new Error('unexpected SearchBridge result');
console.log(`${result.provider}: ${result.rows.length} rows`);
