import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';

const child = spawn(process.execPath, [resolve('integrations/searchbridge-mcp.mjs')], { env: process.env, stdio: ['pipe', 'pipe', 'inherit'] });
const exit = new Promise((accept) => child.on('close', accept));
const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
const requests = [
  { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'gate', version: '1' } } },
  { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
  { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'searchbridge_fetch', arguments: { capability: 'analytics', provider: 'google-analytics-4', max_total_rows: 2, fixture: true } } },
  { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'searchbridge_submit', arguments: { provider: 'indexnow', urls: ['https://example.com/'], capability: 'index.submission', act: false, yes: true } } },
];
for (const request of requests) child.stdin.write(`${JSON.stringify(request)}\n`);
child.stdin.end();
const responses = [];
for await (const line of lines) responses.push(JSON.parse(line));
const byId = new Map(responses.map((item) => [item.id, item]));
if (byId.get(1)?.result?.serverInfo?.name !== 'searchbridge' || byId.get(1)?.result?.protocolVersion !== '2025-11-25') throw new Error('MCP initialize failed');
if (byId.get(2)?.result?.tools?.length !== 4) throw new Error('MCP tool catalog drifted');
if (byId.get(3)?.result?.structuredContent?.schema !== 'searchbridge.result/v1') throw new Error('MCP fixture fetch failed');
if (byId.get(4)?.result?.isError !== true) throw new Error('MCP submission confirmation failed open');
if ((await exit) !== 0) throw new Error('MCP server exited unsuccessfully');
console.log('MCP initialize, generated catalog, fixture execution, and mutation confirmation passed.');
