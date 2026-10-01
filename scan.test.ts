import assert from 'node:assert/strict';
import { decodeScan } from './lib/scan.js';

const process = { pid: 12, parent: 4, started: '639000000000000123', name: 'node', path: null, command: null };
const scan = { processes: [process], listeners: [{ pid: 12, address: '127.0.0.1', port: 3000 }] };
assert.deepEqual(decodeScan(scan), scan);
assert.equal(decodeScan(scan).processes[0].started, '639000000000000123');
assert.deepEqual(decodeScan({}), { processes: [], listeners: [] });
for (const started of [639000000000000123, 'not-ticks']) {
  assert.throws(() => decodeScan({ ...scan, processes: [{ ...process, started }] }), /Prozessidentität/);
}
assert.throws(() => decodeScan({ ...scan, listeners: [{ pid: 12, port: '3000', address: '127.0.0.1' }] }), /Listener/);
console.log('Task Master scan boundary checks passed');
