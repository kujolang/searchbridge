import type { MetricObservation, SearchBridgeBatch, SearchBridgeMultiResult, SearchBridgeResult } from './index.js';
const result: SearchBridgeResult = JSON.parse('{"schema":"searchbridge.result/v1","capability":"analytics","provider":"google-analytics-4","mode":"fixture","retrieved_at":"1970-01-01T00:00:00Z","rows":[]}');
const batch: SearchBridgeBatch = JSON.parse('{"schema":"searchbridge.batch/v1","bounded_concurrency":2,"execution":"bounded-worker-pool","cancel_file":"","succeeded":0,"failed":0,"results":[]}');
const observation: MetricObservation = { metric_id: 'semrush.visibility_index', semantic_family: 'search_visibility', value: 1, unit: 'provider_index', estimated: true, definition_version: '2026-09-02', comparison_key: null, source_field: 'visibility' };
const multi: SearchBridgeMultiResult = JSON.parse('{"schema":"searchbridge.multi-result/v1","capability":"serp.results","routing":{},"budget":{},"succeeded":0,"failed":0,"results":[]}');
void [result, batch, observation, multi];
