#!/usr/bin/env node
// Compare release archives without ever extracting attacker-controlled paths.
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync, inflateRawSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';

const MAX_ARCHIVE = 64 * 1024 * 1024;
const MAX_TOTAL = 256 * 1024 * 1024;
const MAX_ENTRIES = 10_000;
const digest = (data) => createHash('sha256').update(data).digest('hex');
function boundedRead(path) {
  if (statSync(path).size > MAX_ARCHIVE) throw new Error('archive exceeds 64 MiB');
  return readFileSync(path);
}
function nameCheck(name, prefix) {
  const parts = name.replace(/\/$/, '').split('/');
  if (!name.startsWith(prefix) || /[\\\x00-\x1f\x7f]/.test(name) || parts.some((part) => !part || part === '.' || part === '..')) throw new Error('unsafe archive member');
}
function record(entries, name, prefix, data, mode, directory) {
  nameCheck(name, prefix);
  if (entries.has(name) || entries.size >= MAX_ENTRIES) throw new Error('duplicate member or entry limit exceeded');
  entries.set(name, directory ? null : `${mode & 0o111}:${digest(data)}`);
}
function tarEntries(input, prefix) {
  const bytes = input[0] === 0x1f && input[1] === 0x8b ? gunzipSync(input, { maxOutputLength: MAX_TOTAL }) : input;
  if (bytes.length > MAX_TOTAL) throw new Error('tar exceeds expanded byte limit');
  const entries = new Map();
  const text = (buffer) => buffer.toString('utf8').split('\0')[0];
  const octal = (buffer) => { const value = text(buffer).trim(); if (!/^[0-7]+$/.test(value)) throw new Error('unsupported tar integer'); return parseInt(value, 8); };
  let offset = 0;
  while (offset + 512 <= bytes.length) {
    const header = bytes.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      if (!bytes.subarray(offset).every((byte) => byte === 0)) throw new Error('nonzero trailing tar content');
      return entries;
    }
    let checksum = 0; for (let i = 0; i < 512; i++) checksum += i >= 148 && i < 156 ? 32 : header[i];
    if (octal(header.subarray(148, 156)) !== checksum) throw new Error('invalid tar checksum');
    const size = octal(header.subarray(124, 136));
    if (size > MAX_ARCHIVE || offset + 512 + size > bytes.length) throw new Error('invalid tar member size');
    const type = header[156];
    const name = (text(header.subarray(345, 500)) ? `${text(header.subarray(345, 500))}/` : '') + text(header.subarray(0, 100));
    // git archive emits a global PAX commit comment. Per-file overrides and links
    // are unsupported: accepting them would change the interpreted identity.
    if (type === 103) {
      if (!/^\d+ comment=[0-9a-f]{40,64}\n$/.test(bytes.subarray(offset + 512, offset + 512 + size).toString('ascii'))) throw new Error('unsupported global tar attributes');
    } else {
      if (![0, 48, 53].includes(type)) throw new Error('unsupported tar member type');
      record(entries, name, prefix, bytes.subarray(offset + 512, offset + 512 + size), octal(header.subarray(100, 108)), type === 53);
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error('truncated tar archive');
}
function zipEntries(bytes, prefix) {
  function extraCheck(start, length) {
    const finish = start + length;
    for (let at = start; at < finish;) {
      if (at + 4 > finish || bytes.readUInt16LE(at) !== 0x5455 || at + 4 + bytes.readUInt16LE(at + 2) > finish) throw new Error('unsupported zip extra attributes');
      at += 4 + bytes.readUInt16LE(at + 2);
    }
  }
  let end = bytes.length - 22;
  for (; end >= Math.max(0, bytes.length - 65557); end--) if (bytes.readUInt32LE(end) === 0x06054b50 && end + 22 + bytes.readUInt16LE(end + 20) === bytes.length) break;
  if (end < 0 || end < bytes.length - 65557) throw new Error('invalid zip directory');
  const count = bytes.readUInt16LE(end + 10);
  if (bytes.readUInt16LE(end + 4) || bytes.readUInt16LE(end + 6) || bytes.readUInt16LE(end + 8) !== count || count > MAX_ENTRIES) throw new Error('unsupported zip layout');
  let offset = bytes.readUInt32LE(end + 16); const directoryEnd = offset + bytes.readUInt32LE(end + 12);
  if (directoryEnd !== end) throw new Error('invalid zip directory bounds');
  const entries = new Map(); let total = 0;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || bytes.readUInt32LE(offset) !== 0x02014b50) throw new Error('invalid zip entry');
    const flags = bytes.readUInt16LE(offset + 8); const method = bytes.readUInt16LE(offset + 10);
    const compressed = bytes.readUInt32LE(offset + 20); const size = bytes.readUInt32LE(offset + 24);
    const nameLength = bytes.readUInt16LE(offset + 28); const extraLength = bytes.readUInt16LE(offset + 30); const commentLength = bytes.readUInt16LE(offset + 32);
    const local = bytes.readUInt32LE(offset + 42); const mode = bytes.readUInt32LE(offset + 38) >>> 16;
    if (flags & 1 || ![0, 8].includes(method) || size > MAX_ARCHIVE || (total += size) > MAX_TOTAL || offset + 46 + nameLength + extraLength + commentLength > end) throw new Error('zip resource or format limit exceeded');
    const nameBytes = bytes.subarray(offset + 46, offset + 46 + nameLength); const name = nameBytes.toString('utf8');
    extraCheck(offset + 46 + nameLength, extraLength);
    if (local + 30 > bytes.readUInt32LE(end + 16) || bytes.readUInt32LE(local) !== 0x04034b50) throw new Error('invalid zip local header');
    const localNameLength = bytes.readUInt16LE(local + 26); const localExtraLength = bytes.readUInt16LE(local + 28);
    const start = local + 30 + localNameLength + localExtraLength;
    if (start + compressed > bytes.readUInt32LE(end + 16) || !bytes.subarray(local + 30, local + 30 + localNameLength).equals(nameBytes) || bytes.readUInt16LE(local + 6) !== flags || bytes.readUInt16LE(local + 8) !== method) throw new Error('zip member identity mismatch');
    extraCheck(local + 30 + localNameLength, localExtraLength);
    const kind = mode & 0o170000; const directory = name.endsWith('/');
    if (kind && kind !== (directory ? 0o040000 : 0o100000)) throw new Error('unsupported zip member type');
    const packed = bytes.subarray(start, start + compressed);
    const data = method === 0 ? packed : inflateRawSync(packed, { maxOutputLength: MAX_ARCHIVE });
    if (data.length !== size) throw new Error('zip size mismatch');
    record(entries, name, prefix, data, mode, directory);
    offset += 46 + nameLength + extraLength + commentLength;
  }
  if (offset !== directoryEnd) throw new Error('zip entry count mismatch');
  return entries;
}
export function compareArchives(expectedPath, tarPath, zipPath, prefix) {
  const expected = tarEntries(boundedRead(expectedPath), prefix);
  for (const actual of [tarEntries(boundedRead(tarPath), prefix), zipEntries(boundedRead(zipPath), prefix)]) {
    if (actual.size !== expected.size || [...expected].some(([name, value]) => actual.get(name) !== value || !actual.has(name))) throw new Error('release archive differs from signed tag');
  }
  return expected.size;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { if (process.argv.length !== 6) throw new Error('expected signed tar, release tar, release zip, prefix'); compareArchives(...process.argv.slice(2)); }
  catch (error) { console.error(`release archive verification failed: ${error.message}`); process.exitCode = 1; }
}
