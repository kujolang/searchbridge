#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { compareArchives } from './verify_release_archives.mjs';

const work = mkdtempSync(join(tmpdir(), 'searchbridge-release-gate-'));
try {
  const git = (...args) => execFileSync('git', args, { cwd: work, stdio: ['ignore', 'pipe', 'pipe'] });
  git('init', '--quiet');
  writeFileSync(join(work, 'file.txt'), 'release evidence\n');
  writeFileSync(join(work, 'run'), '#!/bin/sh\nexit 0\n'); chmodSync(join(work, 'run'), 0o755);
  git('add', '.'); git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'fixture');
  const expected = join(work, 'expected.tar'); const tar = join(work, 'release.tar.gz'); const zip = join(work, 'release.zip');
  const prefix = 'searchbridge-1.0.0/';
  for (const [format, path] of [['tar', expected], ['tar.gz', tar], ['zip', zip]]) git('archive', `--format=${format}`, `--prefix=${prefix}`, '--output', path, 'HEAD');
  const goodTar = readFileSync(tar); const goodZip = readFileSync(zip);
  assert.equal(compareArchives(expected, tar, zip, prefix), 3);
  function badTar(change) {
    const data = Buffer.from(readFileSync(expected));
    // The regular fixture follows git's global PAX record and root directory.
    let offset = 0;
    while (data[offset + 156] !== 48) offset += 512 + Math.ceil(parseInt(data.subarray(offset + 124, offset + 136).toString().replace(/\0/g, '').trim(), 8) / 512) * 512;
    change(data, offset);
    data.fill(32, offset + 148, offset + 156);
    let sum = 0; for (const byte of data.subarray(offset, offset + 512)) sum += byte;
    data.write(sum.toString(8).padStart(6, '0') + '\0 ', offset + 148, 'ascii');
    writeFileSync(tar, gzipSync(data)); assert.throws(() => compareArchives(expected, tar, zip, prefix)); writeFileSync(tar, goodTar);
  }
  badTar((data, offset) => { data.fill(0, offset, offset + 100); data.write('../outside', offset); });
  badTar((data, offset) => { data[offset + 156] = 50; }); // symlink
  badTar((data, offset) => { data[offset + 512] ^= 1; }); // content mismatch
  badTar((data, offset) => { data.write('0000777\0', offset + 100, 'ascii'); }); // changed executable bits
  const alteredPax = Buffer.from(readFileSync(expected));
  alteredPax.write('path=', 515, 'ascii');
  writeFileSync(tar, gzipSync(alteredPax)); assert.throws(() => compareArchives(expected, tar, zip, prefix)); writeFileSync(tar, goodTar);
  writeFileSync(tar, goodTar.subarray(0, 50)); assert.throws(() => compareArchives(expected, tar, zip, prefix)); writeFileSync(tar, goodTar);
  // ZIP central/local-name disagreements and forged sizes fail before content use.
  for (const mutate of [
    (data, offset) => { data[offset + 46] = 47; },
    (data, offset) => { data.writeUInt32LE(0xffffffff, offset + 24); },
    (data, offset) => { data.writeUInt32LE((0o120777 << 16) >>> 0, offset + 38); },
    (data, offset) => { data.writeUInt16LE(0x7075, offset + 46 + data.readUInt16LE(offset + 28)); },
  ]) {
    const data = Buffer.from(goodZip); const offset = data.indexOf(Buffer.from('504b0102', 'hex')); mutate(data, offset);
    writeFileSync(zip, data); assert.throws(() => compareArchives(expected, tar, zip, prefix));
  }
  writeFileSync(zip, goodZip.subarray(0, 10)); assert.throws(() => compareArchives(expected, tar, zip, prefix));
  console.log('Release archive gate passed: valid signed-tree comparison and 11 malformed archive cases.');
} finally { rmSync(work, { recursive: true, force: true }); }
