import type { SearchBridgeBatch, SearchBridgeResult } from './index.js';
const result: SearchBridgeResult = JSON.parse('{"schema":"searchbridge.result/v1","capability":"analytics","provider":"google-analytics-4","mode":"fixture","retrieved_at":"1970-01-01T00:00:00Z","rows":[]}');
const batch: SearchBridgeBatch = JSON.parse('{"schema":"searchbridge.batch/v1","bounded_concurrency":2,"execution":"bounded-worker-pool","cancel_file":"","succeeded":0,"failed":0,"results":[]}');
void [result, batch];
