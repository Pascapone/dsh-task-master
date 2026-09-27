import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { apply, protectedProcess, workspaceHint, SCAN, KILL } from './index.js';

const workspaces = [{ id: 'w1', path: 'C:\\Projects\\alpha', title: 'Alpha' }, { id: 'w2', path: 'C:\\Projects\\beta', title: 'Beta' }];
assert.equal(workspaceHint({ command: 'node C:\\Projects\\alpha\\node_modules\\vite.js' }, workspaces)?.id, 'w1');
assert.equal(workspaceHint({ command: 'node C:\\Projects\\alphabeta\\server.js' }, workspaces), undefined);
const proc = (pid, parent, started, command = '') => ({ pid, parent, started, command });
const byPid = new Map([proc(50, 40, '10000000000000000'), proc(40, 0, '09000000000000000'), proc(90, 0, '12000000000000000')].map(row => [row.pid, row]));
assert.equal(protectedProcess(byPid.get(40), byPid, 50), true);
assert.equal(protectedProcess(byPid.get(90), byPid, 50), false);
assert.equal(protectedProcess(proc(70, 0, '12000000000000000', 'node deepseek-harness-production/apps/cli/lib/bin.js web'), byPid, 50), true);
assert.equal(protectedProcess(proc(70, 0, ''), byPid, 50), true);
if (process.platform === 'win32') {
  const scan = JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', SCAN], { timeout: 12000, maxBuffer: 4 * 1024 * 1024, windowsHide: true, encoding: 'utf8' }));
  assert.ok(Array.isArray(scan.processes) && Array.isArray(scan.listeners));
  assert.ok(scan.processes.some(row => row.pid === process.pid && /^\d{15,20}$/.test(row.started)));
  // A mismatched creation time must never terminate even this test's own process.
  assert.throws(() => execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', KILL.replace('__PID__', String(process.pid)).replace('__STARTED__', '00000000000000000')], { timeout: 12000, windowsHide: true, stdio: 'ignore' }));
  const child = spawn(process.execPath, ['-e', "require('node:net').createServer().listen(0,'127.0.0.1',()=>console.log('READY'))"], { stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
  try {
    await once(child.stdout, 'data', { signal: AbortSignal.timeout(5000) });
    const probe = JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', SCAN], { timeout: 12000, maxBuffer: 4 * 1024 * 1024, windowsHide: true, encoding: 'utf8' }));
    const started = probe.processes.find(row => row.pid === child.pid)?.started;
    assert.ok(started && probe.listeners.some(row => row.pid === child.pid));
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', KILL.replace('__PID__', String(child.pid)).replace('__STARTED__', started)], { timeout: 12000, windowsHide: true });
    await once(child, 'exit', { signal: AbortSignal.timeout(5000) });
  } finally { child.kill(); }
}
let route;
let killed;
let gatewayService;
let rejected;
const calls = [];
const job = { id: 'bash-1', label: 'dev server', status: 'running', owner: 's1' };
apply({
  connection: { operator: { id: 'operator' }, admit: () => rejected ? { rejection: 403 } : { peer: { id: 'operator' } }, fetch: { register: value => { route = value; return () => {}; } } },
  sessionController: { list: async () => ({ items: [
    { sessionId: 's1', cwd: 'C:\\Projects\\alpha', running: false },
    { sessionId: 's2', cwd: 'C:\\Projects\\alpha', running: false },
    { sessionId: 's3', cwd: 'C:\\Projects\\alpha', running: false },
  ] }) },
  workspaceRegistry: { archivedSessionIds: ['s2'], list: () => [{ id: 'w1', title: 'Alpha', path: 'C:\\Projects\\alpha', sessionIds: ['s1', 's2', 's3'] }] },
  agents: { get: id => id === 's1' ? { status: 'idle' } : undefined, list: () => [] },
  get: key => key === 'jobs' ? { list: () => [job], kill: (...args) => { killed = args; return 'requested'; } } : key === 'devGateways' ? gatewayService : undefined,
  effect: register => register(),
});
assert.equal(route.path, '/api/dsh-task-master');
const snapshot = await route.fetch(new Request('http://localhost/api/dsh-task-master'));
const inventory = await snapshot.json();
assert.equal(snapshot.status, 200, inventory.error);
assert.equal(inventory.sessions[0].id, 's1');
assert.equal(inventory.sessions[0].jobs[0].id, 'bash-1');
assert.equal(inventory.sessions[0].archived, false);
assert.equal(inventory.sessions[1].id, 's2');
assert.equal(inventory.sessions[1].archived, true);
assert.equal(inventory.sessions[1].jobs.length, 0);
assert.equal(inventory.sessions.length, 3); // include non-archived inactive history for All/Search filters
assert.equal(inventory.sessions[2].id, 's3');
assert.equal(inventory.sessions[2].archived, false);
assert.equal(inventory.sessions[2].available, false);
assert.ok(Array.isArray(inventory.processes));
assert.deepEqual(inventory.gateways, [], 'missing optional service leaves the old inventory available');
assert.equal(inventory.gatewayError, null);
const post = input => route.fetch(new Request('http://localhost/api/dsh-task-master', { method: 'POST', body: JSON.stringify(input) }));
const missing = await post({ kind: 'gateway-stop', id: 'g1' });
assert.equal(missing.status, 503);
gatewayService = {
  list: async (...args) => { calls.push(['list', ...args]); return [{ id: 'g1', url: 'http://localhost:3187', status: 'running', workspace: 'Alpha', bundles: [], label: 'Preview', expiresAt: null, ownerSessionId: 's1' }]; },
  stop: async (...args) => { calls.push(['stop', ...args]); return 'stopped'; },
  extend: async (...args) => { calls.push(['extend', ...args]); return 'extended'; },
  logs: async (...args) => { calls.push(['logs', ...args]); return { text: 'ready', next: 5, lossy: false }; },
  prune: async (...args) => { calls.push(['prune', ...args]); return { pruned: true }; },
};
const withGateways = await (await route.fetch(new Request('http://localhost/api/dsh-task-master'))).json();
assert.equal(withGateways.gateways[0].id, 'g1');
assert.deepEqual(calls.at(-1), ['list', { operator: true }]);
gatewayService.list = async () => { throw new Error('gateway unavailable'); };
const degraded = await (await route.fetch(new Request('http://localhost/api/dsh-task-master'))).json();
assert.equal(degraded.gatewayError, 'gateway unavailable');
assert.deepEqual(degraded.gateways, []);
assert.equal(degraded.sessions.length, 3);
rejected = true;
assert.equal((await post({ kind: 'gateway-stop', id: 'g1' })).status, 403);
assert.equal((await post({ kind: 'job', sessionId: 's1', id: 'bash-1' })).status, 403);
assert.equal(calls.filter(call => call[0] === 'stop').length, 0);
rejected = false;
assert.equal((await post({ kind: 'gateway-stop', id: 'g1' })).status, 200);
assert.equal((await post({ kind: 'gateway-extend', id: 'g1', minutes: 30 })).status, 200);
assert.equal((await post({ kind: 'gateway-logs', id: 'g1', from: 0 })).status, 200);
assert.equal((await post({ kind: 'gateway-prune', id: 'g1' })).status, 200);
assert.deepEqual(calls.slice(-4), [
  ['stop', 'g1', { operator: true }],
  ['extend', 'g1', 30, { operator: true }],
  ['logs', 'g1', 0, { operator: true }],
  ['prune', 'g1', { operator: true }],
]);
assert.equal((await post({ kind: 'gateway-extend', id: 'g1', minutes: 0 })).status, 400);
assert.equal((await post({ kind: 'gateway-extend', id: 'g1', minutes: 481 })).status, 400);
assert.equal((await post({ kind: 'gateway-extend', id: 'g1', minutes: 480 })).status, 200);
for (const from of ['0', -1, 0.5, null]) {
  assert.equal((await post({ kind: 'gateway-logs', id: 'g1', from })).status, 400);
}
const response = await route.fetch(new Request('http://localhost/api/dsh-task-master', { method: 'POST', body: JSON.stringify({ kind: 'job', sessionId: 's1', id: 'bash-1' }) }));
assert.equal(response.status, 200);
assert.deepEqual(killed, ['bash-1', 's1', 'Beendet im Task-Manager']);
const denied = await route.fetch(new Request('http://localhost/api/dsh-task-master', { method: 'POST', body: JSON.stringify({ kind: 'job', sessionId: 's1', id: 'bash-2' }) }));
assert.equal(denied.status, 400);
console.log('Task-manager checks passed');
