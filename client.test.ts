import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

import type { ClientBundleRegistration } from '@deepseek-ai/dsh-client-modules/client';
import type { ClientInventory, ClientGateway } from './wire.js';
type FixtureKeyEvent = { key: string; preventDefault(): void; currentTarget: { parentElement: { querySelector(selector: string): { focus(): void } } } };
type FixtureProps = Record<string, unknown> & {
  'aria-label'?: string;
  onClick(): unknown;
  onChange(event: { target: { checked?: boolean; value?: string } }): unknown;
  onKeyDown(event: FixtureKeyEvent): unknown;
};
type FixtureElement = { tag: unknown; props: FixtureProps; children: unknown[] };
type FixtureInventory = ClientInventory & { gateways: (ClientGateway & { loginUrl?: string; serverUrl?: string })[] };
// Exercise the real Client module's view/filter handlers without launching a browser or an OS process.
let bundle!: ClientBundleRegistration;
const posted: Record<string, unknown>[] = [];
const slots: [{ name: string }, (...args: unknown[]) => unknown][] = [];
const hooks = [] as unknown as unknown[] & { 0: FixtureInventory };
let cursor = 0;
const React = {
  createElement: (tag: unknown, props: FixtureProps | null, ...children: unknown[]): FixtureElement => ({ tag, props: (props ?? {}) as FixtureProps, children }),
  useSyncExternalStore: () => {},
  useState(initial: unknown) {
    const index = cursor++;
    if (!(index in hooks)) hooks[index] = initial;
    return [hooks[index], (value: unknown) => { hooks[index] = typeof value === 'function' ? (value as (previous: unknown) => unknown)(hooks[index]) : value; }];
  },
  useRef(initial: unknown) {
    const index = cursor++;
    if (!(index in hooks)) hooks[index] = { current: initial };
    return hooks[index];
  },
  useCallback: (fn: unknown) => { cursor++; return fn; },
  useEffect: () => { cursor++; },
};
runInNewContext(readFileSync(new URL('./lib/client.js', import.meta.url), 'utf8'), {
  window: { __ModuleLoader__: { load: (value: ClientBundleRegistration) => { bundle = value; } }, confirm: () => true },
  fetch: async (_url: unknown, options?: { body?: string }) => {
    if (!options?.body) return { ok: true, json: async () => hooks[0] };
    const body = JSON.parse(options.body) as Record<string, unknown>;
    posted.push(body);
    return { ok: true, json: async () => ({ result: body.kind === 'gateway-logs' ? { text: body.from === 0 ? 'ready' : body.from === 5 ? '\nnext' : '', next: body.from === 0 ? 5 : 10, hasMore: body.from === 0, lossy: body.from === 0 } : 'ok' }) };
  },
}, { filename: 'client.js' });
(bundle.factory((() => React) as unknown as Parameters<ClientBundleRegistration['factory']>[0]) as { apply(ctx: unknown): void }).apply({
  effect: (fn: () => unknown) => fn(),
  locale: { register: () => () => {}, bind: () => (key: string) => key },
  slots: { inject: (_slot: string, fn: () => unknown) => fn(), register: (options: { name: string }, Component: (...args: unknown[]) => unknown) => { slots.push([options, Component]); return () => {}; } },
});
const Panel = slots.find(([options]) => options.name === 'main')![1];
const render = () => { cursor = 0; return Panel(); };
function all(node: unknown): FixtureElement[] {
  if (Array.isArray(node)) return node.flatMap(all);
  if (!node || typeof node !== 'object' || !('tag' in node)) return [];
  return [node as FixtureElement, ...(node as FixtureElement).children.flatMap(all)];
}
const select = (tree: unknown, predicate: (node: FixtureElement) => unknown) => all(tree).filter(predicate);
const panel = (tree: unknown, id: string) => select(tree, node => node.props.id === `dtm-panel-${id}`)[0];
const rows = (tree: unknown) => select(panel(tree, 'sessions'), node => node.props.className === 'dtm-session');
render();
hooks[0] = {
  scannedAt: Date.now(), scanError: null,
  sessions: [
    { id: 'live-1', workspace: 'Alpha', running: true, available: true, archived: false, jobs: [{ id: 'job-1', label: 'Server', status: 'running' }], terminals: [] },
    { id: 'idle-2', workspace: 'Beta', running: false, available: true, archived: false, jobs: [], terminals: [] },
    { id: 'archive-3', workspace: 'Gamma', running: false, available: false, archived: true, jobs: [], terminals: [] },
    { id: 'cold-4', workspace: 'Delta', running: false, available: false, archived: false, jobs: [], terminals: [] },
    { id: 'turn-5', workspace: 'Epsilon', running: true, available: true, archived: false, jobs: [], terminals: [] },
  ],
  processes: [{ pid: 42, started: '12345678901234567', name: 'example', ports: ['127.0.0.1:8000'], confidence: 'unknown', protected: false, workspace: null }],
  gateways: [{ id: 'g1', label: 'Preview', status: 'ready', workspace: 'Alpha', bundles: ['demo'], url: 'http://127.0.0.1:3190/api/dsh-dev-gateways/open?id=g1', expiresAt: null, kind: 'project', ownerKind: 'agent', ownerSessionId: 'live-1', dataDir: 'C:\\temp\\gateway\\data', cleanupOnArchive: true, startCommand: 'npm run dev', serverUrl: 'http://127.0.0.1:3200/', loginUrl: 'http://127.0.0.1:3200/?token=DO-NOT-RENDER' }],
};
let tree = render();
assert.equal(rows(tree).length, 4, 'all unarchived sessions, including inactive history, must be shown');
assert.equal(panel(tree, 'processes').props.hidden, true);
const tabs = select(tree, node => node.props.role === 'tab');
assert.equal(tabs.length, 3);
let focused: string | undefined;
tabs[1].props.onKeyDown({ key: 'ArrowRight', preventDefault() {}, currentTarget: { parentElement: { querySelector: selector => ({ focus: () => { focused = selector; } }) } } });
assert.equal(focused, '[data-task-master-tab="gateways"]');
assert.equal(panel(render(), 'gateways').props.hidden, false);
tabs[2].props.onKeyDown({ key: 'ArrowRight', preventDefault() {}, currentTarget: { parentElement: { querySelector: selector => ({ focus: () => { focused = selector; } }) } } });
assert.equal(focused, '[data-task-master-tab="sessions"]');
tabs[0].props.onKeyDown({ key: 'End', preventDefault() {}, currentTarget: { parentElement: { querySelector: selector => ({ focus: () => { focused = selector; } }) } } });
assert.equal(focused, '[data-task-master-tab="gateways"]');
tabs[0].props.onClick();
tabs[1].props.onClick();
tree = render();
assert.equal(panel(tree, 'sessions').props.hidden, true);
assert.equal(panel(tree, 'processes').props.hidden, false);
assert.equal(select(panel(tree, 'processes'), node => node.props.className === 'dtm-process').length, 1);
tabs[0].props.onClick();
tree = render();
select(tree, node => node.tag === 'button' && node.props.className === 'dtm-chip' && node.children[0] === 'running')[0].props.onClick();
tree = render();
assert.equal(rows(tree).length, 2, 'running status must include a turn even without jobs');
select(tree, node => node.tag === 'button' && node.props.className === 'dtm-chip' && node.children[0] === 'inactive')[0].props.onClick();
assert.equal(rows(render()).length, 1, 'inactive status must include cold, unarchived history');
select(tree, node => node.tag === 'button' && node.props.className === 'dtm-chip' && node.children[0] === 'all')[0].props.onClick();
const checkboxes = select(render(), node => node.tag === 'input' && node.props.type === 'checkbox');
checkboxes[1].props.onChange({ target: { checked: true } });
tree = render();
assert.equal(rows(tree).length, 5, 'show archived must reveal archived sessions');
select(tree, node => node.tag === 'input' && node.props.type === 'search')[0].props.onChange({ target: { value: 'gamma' } });
tree = render();
assert.equal(rows(tree).length, 1, 'workspace search must filter sessions');
select(tree, node => node.tag === 'input' && node.props.type === 'search')[0].props.onChange({ target: { value: '' } });
select(render(), node => node.tag === 'input' && node.props.type === 'checkbox')[0].props.onChange({ target: { checked: true } });
assert.equal(rows(render()).length, 2, 'activity must include managed tasks and running turns');
select(render(), node => node.props.id === 'dtm-tab-processes')[0].props.onClick();
tree = render();
select(tree, node => node.tag === 'button' && node.props.className === 'dtm-chip' && node.children[0] === 'confirmed')[0].props.onClick();
assert.equal(select(panel(render(), 'processes'), node => node.props.className === 'dtm-process').length, 0, 'confidence filter must hide non-matching listeners');
tree = render();
select(tree, node => node.props.id === 'dtm-tab-gateways')[0].props.onClick();
tree = render();
const gateway = panel(tree, 'gateways');
assert.equal(gateway.props.hidden, false);
assert.equal(select(gateway, node => node.props.className === 'dtm-gateway').length, 1);
assert.equal(select(gateway, node => node.tag === 'a')[0].props.href, 'http://127.0.0.1:3190/api/dsh-dev-gateways/open?id=g1');
assert.match(JSON.stringify(gateway), /projectServer/);
assert.match(JSON.stringify(gateway), /agentOwner: live-1/);
assert.match(JSON.stringify(gateway), /command: npm run dev/);
assert.match(JSON.stringify(gateway), /tempData: C:.*onArchive/);
hooks[0].gateways[0].cleanupPending = true;
assert.match(JSON.stringify(panel(render(), 'gateways')), /pendingCleanup/);
hooks[0].gateways[0].cleanupError = 'EBUSY';
assert.match(JSON.stringify(panel(render(), 'gateways')), /blockedCleanup/);
assert.ok(select(panel(render(), 'gateways'), node => node.props.role === 'alert' && node.children.includes('EBUSY')).length);
delete hooks[0].gateways[0].cleanupError;
delete hooks[0].gateways[0].cleanupPending;
assert.doesNotMatch(JSON.stringify(gateway), /DO-NOT-RENDER/);
assert.match(JSON.stringify(gateway), /localAccess/);
const safeUrl = hooks[0].gateways[0].url;
for (const url of ['javascript:alert(1)', 'http://127.0.0.1:3200/?token=secret', 'http://evil.example/api/dsh-dev-gateways/open?id=g1']) {
  hooks[0].gateways[0].url = url;
  assert.equal(select(panel(render(), 'gateways'), node => node.tag === 'a').length, 0, 'only a token-free local controller link is rendered');
}
hooks[0].gateways[0].url = safeUrl;
hooks[0].gateways[0].kind = 'dsh';
hooks[0].gateways[0].ownerKind = 'operator';
assert.match(JSON.stringify(panel(render(), 'gateways')), /dshGateway/);
assert.ok(select(panel(render(), 'gateways'), node => node.children.includes('operator')).length);
const minuteInput = select(gateway, node => node.tag === 'input' && node.props.type === 'number')[0];
assert.equal(minuteInput.props.max, 480);
minuteInput.props.onChange({ target: { value: '481' } });
let extendButton = select(panel(render(), 'gateways'), node => node.props['aria-label'] === 'extend: Preview')[0];
assert.equal(extendButton.props.disabled, true);
const postCount = posted.length;
await extendButton.props.onClick();
assert.equal(posted.length, postCount, 'out-of-bounds extension must not submit');
minuteInput.props.onChange({ target: { value: '30' } });
await select(gateway, node => node.tag === 'button' && node.props['aria-label'] === 'logs: Preview')[0].props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(posted.at(-1)!)), { kind: 'gateway-logs', id: 'g1', from: 0 });
assert.equal(select(panel(render(), 'gateways'), node => node.tag === 'pre')[0].children[0], 'ready');
await select(panel(render(), 'gateways'), node => node.tag === 'button' && node.children.includes('moreLogs'))[0].props.onClick();
assert.equal(posted.at(-1)!.from, 5);
assert.equal(select(panel(render(), 'gateways'), node => node.tag === 'pre')[0].children[0], 'ready\nnext');
assert.equal(select(panel(render(), 'gateways'), node => node.tag === 'button' && node.children.includes('moreLogs')).length, 0);
assert.ok(select(panel(render(), 'gateways'), node => node.children.includes('lostLogs')).length, 'lossy warning survives pagination');
await select(panel(render(), 'gateways'), node => node.tag === 'button' && node.children.includes('refreshLogs'))[0].props.onClick();
assert.equal(posted.at(-1)!.from, 10);
assert.equal(select(panel(render(), 'gateways'), node => node.tag === 'pre')[0].children[0], 'ready\nnext');
await select(panel(render(), 'gateways'), node => node.tag === 'button' && node.props['aria-label'] === 'extend: Preview')[0].props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(posted.at(-1)!)), { kind: 'gateway-extend', id: 'g1', minutes: 30 });
await select(panel(render(), 'gateways'), node => node.tag === 'button' && node.props['aria-label'] === 'stop: Preview')[0].props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(posted.at(-1)!)), { kind: 'gateway-stop', id: 'g1' });
for (const state of ['stopping', 'stopped', 'failed', 'unknown']) {
  hooks[0].gateways[0].status = state;
  for (const action of ['extend', 'stop']) {
    const button = select(panel(render(), 'gateways'), node => node.props['aria-label'] === `${action}: Preview`)[0];
    assert.equal(button.props.disabled, true, `${action} must be disabled for ${state}`);
    const count = posted.length;
    await button.props.onClick();
    assert.equal(posted.length, count, `${action} handler must guard ${state}`);
  }
}
for (const state of ['starting', 'ready']) {
  hooks[0].gateways[0].status = state;
  for (const action of ['extend', 'stop']) {
    assert.equal(select(panel(render(), 'gateways'), node => node.props['aria-label'] === `${action}: Preview`)[0].props.disabled, false);
  }
}
hooks[0].gateways[0].status = 'failed';
hooks[0].gateways[0].reason = 'Server exited: missing entrypoint';
assert.ok(select(panel(render(), 'gateways'), node => node.props.role === 'status' && node.children.includes('Server exited: missing entrypoint')).length, 'failure reason must be visible');
hooks[0].gateways[0].status = 'stopped';
await select(panel(render(), 'gateways'), node => node.tag === 'button' && node.props['aria-label'] === 'prune: Preview')[0].props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(posted.at(-1)!)), { kind: 'gateway-prune', id: 'g1' });
hooks[0].processes[0] = { ...hooks[0].processes[0], confidence: 'confirmed', sessionId: 'live-1', jobId: 'job-1', jobStatus: 'running' };
const linkedProcess = panel(render(), 'processes');
assert.match(JSON.stringify(linkedProcess), /job job-1/);
const linkedStop = select(linkedProcess, node => node.tag === 'button' && node.props['aria-label'] === 'stop job job-1')[0];
assert.equal(linkedStop.props.disabled, false);
await linkedStop.props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(posted.at(-1)!)), { kind: 'job', sessionId: 'live-1', id: 'job-1' }, 'linked process stops via the owner-fenced job, never raw PID');
hooks[0].processes[0].jobStatus = 'stopping';
assert.equal(select(panel(render(), 'processes'), node => node.props['aria-label']?.includes('job job-1'))[0].props.disabled, true);
console.log('Task Master client view/filter/gateway checks passed');
