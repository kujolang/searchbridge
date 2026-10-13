import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SearchBridgeClient, SearchBridgeError } from './client.js';

const client = new SearchBridgeClient(process.execPath);
const noisyFailure = ['-e', 'process.stderr.write("x".repeat(2 * 1024 * 1024)); process.exitCode = 7;'];
test('run retains bounded stderr and preserves exit status', async () => {
  await assert.rejects(client.run(noisyFailure), (error: unknown) => {
    assert(error instanceof SearchBridgeError);
    assert.equal(error.exitCode, 7); assert.equal(error.stderr.length, 65_536);
    return true;
  });
});
test('stream retains the same bounded diagnostics', async () => {
  const result = client.stream([...noisyFailure, '--']);
  const completion = assert.rejects(result.completed, (error: unknown) => {
    assert(error instanceof SearchBridgeError);
    assert.equal(error.exitCode, 7); assert.equal(error.stderr.length, 65_536); assert.equal(error.message.length, 65_536);
    return true;
  });
  for await (const _ of result.rows) { assert.fail('no rows expected'); }
  await completion;
});
test('JSON and JSONL results are unchanged', async () => {
  assert.deepEqual(await client.run(['-e', 'console.log(JSON.stringify({rows:[1]}))']), { rows: [1] });
  const result = client.stream(['-e', 'console.log("{\\"id\\":1}\\n{\\"id\\":2}")', '--']);
  const rows = []; for await (const row of result.rows) rows.push(row);
  await result.completed; assert.deepEqual(rows, [{ id: 1 }, { id: 2 }]);
});
