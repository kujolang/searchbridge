#!/usr/bin/env node
import { createInterface } from 'node:readline';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const executable = process.env.SEARCHBRIDGE_BIN || resolve(root, 'searchbridge');
const catalog = JSON.parse(await readFile(resolve(root, 'integrations/searchbridge-tools.json'), 'utf8'));
const tools = new Map(catalog.tools.map((tool) => [tool.name, tool]));

function error(code, message, data) {
  return { code, message, ...(data === undefined ? {} : { data }) };
}

function boundedInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error('max_total_rows must be an integer from 1 to 100');
  return value;
}

function argumentsFor(name, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('arguments must be an object');
  if (name === 'searchbridge_catalog') return ['agent-catalog'];
  if (name === 'searchbridge_fetch') {
    if (typeof input.capability !== 'string' || typeof input.provider !== 'string') throw new Error('capability and provider are required strings');
    const args = ['fetch', '--capability', input.capability, '--provider', input.provider, '--max-total-rows', String(boundedInteger(input.max_total_rows, 100))];
    if (input.fixture === true) args.push('--fixture', '--offline');
    return args;
  }
  if (name === 'searchbridge_query') {
    if (typeof input.evidence_path !== 'string' || input.evidence_path.length === 0) throw new Error('evidence_path is required');
    const args = ['evidence-query', '--evidence-path', input.evidence_path, '--max-total-rows', String(boundedInteger(input.max_total_rows, 100))];
    if (input.filter_field !== undefined || input.filter_equals !== undefined) {
      if (typeof input.filter_field !== 'string' || typeof input.filter_equals !== 'string') throw new Error('filter_field and filter_equals must be supplied together');
      args.push('--filter-field', input.filter_field, '--filter-equals', input.filter_equals);
    }
    return args;
  }
  if (name === 'searchbridge_submit') {
    if (input.capability !== 'index.submission' || input.act !== true || input.yes !== true) throw new Error('submission requires capability index.submission and explicit act/yes confirmation');
    if (!['indexnow', 'bing-webmaster'].includes(input.provider)) throw new Error('unsupported submission provider');
    if (!Array.isArray(input.urls) || input.urls.length < 1 || input.urls.length > 1000 || input.urls.some((url) => typeof url !== 'string')) throw new Error('urls must contain 1 to 1,000 strings');
    return ['submit', '--provider', input.provider, '--capability', 'index.submission', '--act', '--yes', ...input.urls.flatMap((url) => ['--url', url])];
  }
  throw new Error('unknown tool');
}

function run(args) {
  return new Promise((accept, reject) => {
    const child = spawn(executable, args, { cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    const chunks = []; const errors = []; let bytes = 0;
    child.stdout.on('data', (chunk) => { bytes += chunk.length; if (bytes <= 2_000_000) chunks.push(chunk); else child.kill(); });
    child.stderr.on('data', (chunk) => { if (errors.reduce((sum, item) => sum + item.length, 0) < 65_536) errors.push(chunk); });
    child.on('error', reject);
    child.on('close', (code) => {
      const stderr = Buffer.concat(errors).toString('utf8').trim().slice(0, 65_536);
      if (bytes > 2_000_000) return reject(new Error('SearchBridge output exceeded the MCP bridge limit'));
      if (code !== 0) return reject(new Error(stderr || `SearchBridge exited ${code}`));
      const text = Buffer.concat(chunks).toString('utf8').trim();
      try { accept(JSON.parse(text)); } catch { reject(new Error('SearchBridge returned invalid JSON')); }
    });
  });
}

async function handle(request) {
  if (!request || request.jsonrpc !== '2.0' || typeof request.method !== 'string') return { jsonrpc: '2.0', id: request?.id ?? null, error: error(-32600, 'Invalid Request') };
  const response = { jsonrpc: '2.0', id: request.id ?? null };
  if (request.method === 'initialize') return { ...response, result: { protocolVersion: '2025-06-18', capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'searchbridge', version: '0.4.0' } } };
  if (request.method === 'notifications/initialized') return null;
  if (request.method === 'ping') return { ...response, result: {} };
  if (request.method === 'tools/list') return { ...response, result: { tools: catalog.tools.map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.input_schema })) } };
  if (request.method === 'tools/call') {
    const name = request.params?.name;
    if (!tools.has(name)) return { ...response, error: error(-32602, 'Unknown tool') };
    try {
      const value = await run(argumentsFor(name, request.params?.arguments || {}));
      return { ...response, result: { content: [{ type: 'text', text: JSON.stringify(value) }], structuredContent: value, isError: false } };
    } catch (cause) {
      return { ...response, result: { content: [{ type: 'text', text: cause instanceof Error ? cause.message : 'tool execution failed' }], isError: true } };
    }
  }
  return { ...response, error: error(-32601, 'Method not found') };
}

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of input) {
  if (!line.trim()) continue;
  let response;
  try { response = await handle(JSON.parse(line)); } catch { response = { jsonrpc: '2.0', id: null, error: error(-32700, 'Parse error') }; }
  if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
}
