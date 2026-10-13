import { spawn } from 'node:child_process';
import type { Readable } from 'node:stream';
import { createInterface } from 'node:readline';
import type { JsonValue, SearchBridgeResult } from './index.js';

export class SearchBridgeError extends Error {
  constructor(message: string, public readonly exitCode: number | null, public readonly stderr: string) { super(message); this.name = 'SearchBridgeError'; }
}
export function validateResult(value: unknown): value is SearchBridgeResult {
  if (!value || typeof value !== 'object') return false; const result = value as Record<string, unknown>;
  return result.schema === 'searchbridge.result/v1' && typeof result.capability === 'string' && typeof result.provider === 'string' && Array.isArray(result.rows);
}
export async function* readJsonLines(stream: Readable): AsyncGenerator<JsonValue> {
  const lines = createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of lines) { if (line.trim()) yield JSON.parse(line) as JsonValue; }
}
// Retain diagnostics while draining stderr so a noisy child cannot grow memory
// without bound or block waiting for the pipe to be consumed.
function captureStderr(stream: Readable): () => string {
  const chunks: Buffer[] = []; let bytes = 0;
  stream.on('data', (chunk: Buffer) => {
    const remaining = 65_536 - bytes;
    if (remaining > 0) { const kept = chunk.subarray(0, remaining); chunks.push(kept); bytes += kept.length; }
  });
  return () => Buffer.concat(chunks, bytes).toString('utf8').trim();
}
export class SearchBridgeClient {
  constructor(public readonly executable = process.env.SEARCHBRIDGE_BIN || 'searchbridge', public readonly cwd?: string) {}
  async run<T = JsonValue>(args: readonly string[], signal?: AbortSignal): Promise<T> {
    return new Promise((accept, reject) => {
      const child = spawn(this.executable, [...args], { cwd: this.cwd, env: process.env, shell: false, signal });
      const output: Buffer[] = []; const stderrText = captureStderr(child.stderr);
      child.stdout.on('data', (chunk: Buffer) => output.push(chunk)); child.on('error', reject);
      child.on('close', (code) => { const stderr = stderrText(); if (code !== 0) return reject(new SearchBridgeError(stderr || `SearchBridge exited ${code}`, code, stderr)); try { accept(JSON.parse(Buffer.concat(output).toString('utf8')) as T); } catch { reject(new SearchBridgeError('SearchBridge returned invalid JSON', code, stderr)); } });
    });
  }
  fetch(capability: string, provider: string, args: readonly string[] = [], signal?: AbortSignal): Promise<SearchBridgeResult> { return this.run<SearchBridgeResult>(['fetch', '--capability', capability, '--provider', provider, ...args], signal); }
  stream(args: readonly string[], signal?: AbortSignal): { rows: AsyncGenerator<JsonValue>; completed: Promise<void> } {
    const child = spawn(this.executable, [...args, '--format', 'jsonl'], { cwd: this.cwd, env: process.env, shell: false, signal }); const stderrText = captureStderr(child.stderr);
    const completed = new Promise<void>((accept, reject) => { child.on('error', reject); child.on('close', (code) => code === 0 ? accept() : reject(new SearchBridgeError(stderrText() || `SearchBridge exited ${code}`, code, stderrText()))); });
    return { rows: readJsonLines(child.stdout), completed };
  }
}
