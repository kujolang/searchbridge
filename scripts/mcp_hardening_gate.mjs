import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { once } from 'node:events';

const directory = await mkdtemp(join(tmpdir(), 'searchbridge-mcp-'));
async function exchange(input, env = {}) {
  const child = spawn(process.execPath, [resolve('integrations/searchbridge-mcp.mjs')], { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
  const timeout = setTimeout(() => child.kill('SIGKILL'), 15000);
  let output = ''; let stderr = '';
  child.stdout.setEncoding('utf8'); child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.setEncoding('utf8'); child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.stdin.on('error', (error) => { if (error.code !== 'EPIPE') throw error; });
  const closed = once(child, 'close');
  child.stdin.end(input);
  const [code] = await closed; clearTimeout(timeout);
  assert.equal(stderr, '');
  return { code, responses: output.trim().split('\n').filter(Boolean).map((line) => JSON.parse(line)) };
}
const call = (id, arguments_) => ({ jsonrpc: '2.0', id, method: 'tools/call', params: { name: 'searchbridge_fetch', arguments: arguments_ } });
try {
  const mock = join(directory, 'cli');
  await writeFile(mock, '#!/usr/bin/env node\nprocess.stdout.write(JSON.stringify({args:process.argv.slice(2)}));\n', { mode: 0o700 });
  const args = { capability: 'search.performance', provider: 'google-search-console', property: 'sc-domain:example.com', start_date: '2026-09-01', end_date: '2026-09-02', max_calls: 2 };
  const cases = [call(1, args), call(2, { ...args, max_calls: 0 }), call(3, { ...args, max_calls: undefined }), call(4, { ...args, fixture: 'false' }), call(5, { ...args, endpoint: 'https://example.invalid' })];
  const { responses, code } = await exchange(cases.map((value) => JSON.stringify(value)).join('\n') + '\n', { SEARCHBRIDGE_BIN: mock });
  assert.equal(code, 0); assert.equal(responses.length, 5);
  const forwarded = responses[0].result.structuredContent.args;
  assert.equal(forwarded[forwarded.indexOf('--max-calls') + 1], '2');
  assert(forwarded.includes('--property=sc-domain:example.com'));
  assert(forwarded.includes('--start-date=2026-09-01'));
  assert.equal(forwarded[forwarded.indexOf('--max-output-tokens') + 1], '25000');
  for (const result of responses.slice(1)) assert.equal(result.result.isError, true);
  const ping = JSON.stringify({ jsonrpc: '2.0', id: 8, method: 'ping', padding: 'x'.repeat(4 * 1024 * 1024 - 128) });
  const framed = await exchange(ping + '\n' + ping + '\n');
  assert.equal(framed.code, 0); assert.equal(framed.responses.length, 2);
  const oversized = await exchange('x'.repeat(4 * 1024 * 1024 + 1) + '\n');
  assert.equal(oversized.code, 1); assert.equal(oversized.responses[0].error.code, -32700);
  const malformed = await exchange('{bad}\n' + JSON.stringify({ jsonrpc: '2.0', id: 9, method: 'ping' }) + '\n');
  assert.equal(malformed.responses[0].error.code, -32700); assert.equal(malformed.responses[1].id, 9);
  const partial = await exchange('{'); assert.equal(partial.responses[0].error.code, -32700);
  await writeFile(join(directory, '..evidence'), '{}\n');
  const query = { jsonrpc: '2.0', id: 10, method: 'tools/call', params: { name: 'searchbridge_query', arguments: { evidence_path: '..evidence' } } };
  const contained = await exchange(JSON.stringify(query) + '\n', { SEARCHBRIDGE_BIN: mock, SEARCHBRIDGE_MCP_EVIDENCE_ROOT: directory });
  assert.equal(contained.responses[0].result.isError, false);
  console.log('MCP live budgets, argument validation, per-message framing, and contained dot paths passed.');
} finally { await rm(directory, { recursive: true, force: true }); }
