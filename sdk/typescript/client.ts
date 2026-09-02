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
export class SearchBridgeClient {
  constructor(public readonly executable = process.env.SEARCHBRIDGE_BIN || 'searchbridge', public readonly cwd?: string) {}
  async run<T = JsonValue>(args: readonly string[], signal?: AbortSignal): Promise<T> {
    return new Promise((accept, reject) => {
      const child = spawn(this.executable, [...args], { cwd: this.cwd, env: process.env, shell: false, signal });
      const output: Buffer[] = []; const errors: Buffer[] = [];
      child.stdout.on('data', (chunk: Buffer) => output.push(chunk)); child.stderr.on('data', (chunk: Buffer) => errors.push(chunk)); child.on('error', reject);
      child.on('close', (code) => { const stderr = Buffer.concat(errors).toString('utf8').slice(0, 65_536).trim(); if (code !== 0) return reject(new SearchBridgeError(stderr || `SearchBridge exited ${code}`, code, stderr)); try { accept(JSON.parse(Buffer.concat(output).toString('utf8')) as T); } catch { reject(new SearchBridgeError('SearchBridge returned invalid JSON', code, stderr)); } });
    });
  }
  fetch(capability: string, provider: string, args: readonly string[] = [], signal?: AbortSignal): Promise<SearchBridgeResult> { return this.run<SearchBridgeResult>(['fetch', '--capability', capability, '--provider', provider, ...args], signal); }
  stream(args: readonly string[], signal?: AbortSignal): { rows: AsyncGenerator<JsonValue>; completed: Promise<void> } {
    const child = spawn(this.executable, [...args, '--format', 'jsonl'], { cwd: this.cwd, env: process.env, shell: false, signal }); const errors: Buffer[] = []; child.stderr.on('data', (chunk: Buffer) => errors.push(chunk));
    const completed = new Promise<void>((accept, reject) => { child.on('error', reject); child.on('close', (code) => code === 0 ? accept() : reject(new SearchBridgeError(Buffer.concat(errors).toString('utf8').trim() || `SearchBridge exited ${code}`, code, Buffer.concat(errors).toString('utf8').slice(0, 65_536)))); });
    return { rows: readJsonLines(child.stdout), completed };
  }
}
