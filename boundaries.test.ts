import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import type { ClientBundleRegistration } from '@deepseek-ai/dsh-client-modules/client';
import type { ClientInventory } from './wire.js';

const source = readFileSync(new URL('./lib/client.js', import.meta.url), 'utf8');
assert.doesNotMatch(source, /^\s*(?:import|export)\s/m, 'Client remains a classic ModuleLoader script');
let bundle!: ClientBundleRegistration;
const scope: {
  window: { __ModuleLoader__: { load(value: ClientBundleRegistration): void } };
  probe?: { checkInventory(value: unknown): void; checkLogs(value: unknown): void };
} = { window: { __ModuleLoader__: { load(value) { bundle = value; } } } };
const probed = source.replace('function Icon(', 'globalThis.probe = { checkInventory, checkLogs }; function Icon(');
assert.notEqual(probed, source, 'probe the actual compiled Client validators');
runInNewContext(probed, scope);
bundle.factory((() => ({ createElement() {} })) as unknown as Parameters<ClientBundleRegistration['factory']>[0]);
const valid: ClientInventory = {
  scannedAt: Date.now(), scanError: null,
  sessions: [{ id: 's1', running: true, available: true, archived: false, workspace: null, jobs: [], terminals: [] }],
  processes: [{ pid: 12, started: '639000000000000123', ports: ['127.0.0.1:3000'], protected: false, confidence: 'unknown' }],
  gateways: [{ id: 'g1', status: 'ready', expiresAt: null }],
};
scope.probe!.checkInventory(valid);
for (const invalid of [null, { ...valid, scannedAt: 1e99 }, { ...valid, sessions: [null] },
  { ...valid, processes: [{ ...valid.processes[0], pid: '12' }] },
  { ...valid, gateways: [{ id: 'g1', status: 'ready', url: {} }] }]) {
  assert.throws(() => scope.probe!.checkInventory(invalid), /Task-Master-Antwort/);
}
scope.probe!.checkLogs({ text: 'ready', next: 5 });
for (const next of ['5', -1, 0.5]) assert.throws(() => scope.probe!.checkLogs({ text: 'ready', next }), /Task-Master-Antwort/);
console.log('Task Master Client boundary and classic-script checks passed');
