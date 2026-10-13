#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { lstatSync, realpathSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const version = (await readFile(resolve(root, 'VERSION'), 'utf8')).trim();
const executable = process.env.SEARCHBRIDGE_BIN || resolve(root, 'searchbridge');
const catalog = JSON.parse(await readFile(resolve(root, 'integrations/searchbridge-tools.json'), 'utf8'));
const evidenceRoot = process.env.SEARCHBRIDGE_MCP_EVIDENCE_ROOT ? realpathSync(process.env.SEARCHBRIDGE_MCP_EVIDENCE_ROOT) : null;
const visibleTools = catalog.tools.filter((tool) => tool.name !== 'searchbridge_query' || evidenceRoot !== null);
const tools = new Map(visibleTools.map((tool) => [tool.name, tool]));
const protocolVersions = ['2025-11-25', '2025-06-18'];
const maxMessageBytes = 4 * 1024 * 1024;

function error(code, message, data) {
  return { code, message, ...(data === undefined ? {} : { data }) };
}

function boundedInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error('max_total_rows must be an integer from 1 to 100');
  return value;
}

function boundedCalls(value) {
  if (!Number.isInteger(value) || value < 1 || value > 1000) throw new Error('max_calls must be an integer from 1 to 1,000');
  return value;
}

function containedEvidencePath(inputPath) {
  if (evidenceRoot === null) throw new Error('searchbridge_query requires SEARCHBRIDGE_MCP_EVIDENCE_ROOT');
  const requested = resolve(evidenceRoot, inputPath);
  const lexical = relative(evidenceRoot, requested);
  if ((lexical === '..' || lexical.startsWith(`..${sep}`)) || isAbsolute(lexical)) throw new Error('evidence_path escapes SEARCHBRIDGE_MCP_EVIDENCE_ROOT');
  const requestedStat = lstatSync(requested);
  if (requestedStat.isSymbolicLink()) throw new Error('evidence_path must not be a symlink');
  const canonical = realpathSync(requested);
  const canonicalRelative = relative(evidenceRoot, canonical);
  if ((canonicalRelative === '..' || canonicalRelative.startsWith(`..${sep}`)) || isAbsolute(canonicalRelative) || !lstatSync(canonical).isFile()) throw new Error('evidence_path must be a contained regular file');
  return canonical;
}

function argumentsFor(name, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('arguments must be an object');
  const schema = tools.get(name)?.input_schema;
  if (!schema || Object.keys(input).some((key) => !Object.hasOwn(schema.properties || {}, key))) throw new Error('unknown tool argument');
  if (name === 'searchbridge_catalog') return ['agent-catalog'];
  if (name === 'searchbridge_fetch') {
    if (typeof input.capability !== 'string' || typeof input.provider !== 'string') throw new Error('capability and provider are required strings');
    const args = ['fetch', '--capability', input.capability, '--provider', input.provider, '--max-total-rows', String(boundedInteger(input.max_total_rows, 100))];
    if (input.fixture !== undefined && typeof input.fixture !== 'boolean') throw new Error('fixture must be a boolean');
    if (input.fixture === true) args.push('--fixture', '--offline');
    if (input.max_calls !== undefined || input.fixture !== true) args.push('--max-calls', String(boundedCalls(input.max_calls)));
    args.push('--max-output-tokens', '25000');
    for (const field of ['property', 'start_date', 'end_date', 'url']) {
      if (input[field] === undefined) continue;
      if (typeof input[field] !== 'string' || input[field].length === 0 || input[field].length > 8192 || /[\x00-\x1f\x7f]/.test(input[field])) throw new Error(`${field} must be a bounded string without control characters`);
      args.push(`--${field.replaceAll('_', '-')}=${input[field]}`);
    }
    return args;
  }
	if (name === 'searchbridge_query') {
	  if (typeof input.evidence_path !== 'string' || input.evidence_path.length === 0) throw new Error('evidence_path is required');
	  const args = ['evidence-query', '--evidence-path', containedEvidencePath(input.evidence_path), '--max-total-rows', String(boundedInteger(input.max_total_rows, 100)), '--max-output-tokens', '25000'];
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
	  return ['submit', '--provider', input.provider, '--capability', 'index.submission', '--act', '--yes', '--max-calls', String(boundedCalls(input.max_calls)), ...input.urls.flatMap((url) => ['--url', url])];
  }
  throw new Error('unknown tool');
}

function run(args) {
  return new Promise((accept, reject) => {
    const child = spawn(executable, args, { cwd: root, env: process.env, stdio: ['ignore', 'pipe', 'pipe'], shell: false });
    const chunks = []; const errors = []; let bytes = 0; let errorBytes = 0;
    child.stdout.on('data', (chunk) => { bytes += chunk.length; if (bytes <= 2_000_000) chunks.push(chunk); else child.kill(); });
    child.stderr.on('data', (chunk) => { const remaining = 65_536 - errorBytes; if (remaining > 0) { const kept = chunk.subarray(0, remaining); errors.push(kept); errorBytes += kept.length; } });
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
  if (request.method === 'initialize') {
    const requested = request.params?.protocolVersion;
    const negotiated = protocolVersions.includes(requested) ? requested : protocolVersions[0];
    return { ...response, result: { protocolVersion: negotiated, capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'searchbridge', version } } };
  }
  if (request.method === 'notifications/initialized') return null;
  if (request.method === 'ping') return { ...response, result: {} };
	if (request.method === 'tools/list') return { ...response, result: { tools: visibleTools.map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.input_schema })) } };
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

async function writeResponse(response) {
  if (response && !process.stdout.write(`${JSON.stringify(response)}\n`)) {
    await new Promise((accept) => process.stdout.once('drain', accept));
  }
}

process.stdin.setEncoding('utf8');
let buffered = '';
let bufferedBytes = 0;
input: for await (const chunk of process.stdin) {
  let start = 0;
  while (start < chunk.length) {
    const newline = chunk.indexOf('\n', start);
    const piece = chunk.slice(start, newline < 0 ? chunk.length : newline);
    bufferedBytes += Buffer.byteLength(piece, 'utf8');
    if (bufferedBytes > maxMessageBytes) {
      await writeResponse({ jsonrpc: '2.0', id: null, error: error(-32700, 'Message exceeds 4 MiB') });
      process.exitCode = 1; break input;
    }
    buffered += piece;
    if (newline < 0) break;
    const line = buffered; buffered = ''; bufferedBytes = 0; start = newline + 1;
    if (!line.trim()) continue;
    let request;
    try { request = JSON.parse(line); } catch {
      await writeResponse({ jsonrpc: '2.0', id: null, error: error(-32700, 'Parse error') }); continue;
    }
    await writeResponse(await handle(request));
  }
}
if (buffered.trim() && process.exitCode !== 1) await writeResponse({ jsonrpc: '2.0', id: null, error: error(-32700, 'Incomplete JSON-RPC message') });
