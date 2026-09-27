import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the real Client module's view/filter handlers without launching a browser or an OS process.
let bundle;
const posted = [];
const slots = [];
const hooks = [];
let cursor = 0;
const React = {
  createElement: (tag, props, ...children) => ({ tag, props: props ?? {}, children }),
  useSyncExternalStore: () => {},
  useState(initial) {
    const index = cursor++;
    if (!(index in hooks)) hooks[index] = initial;
    return [hooks[index], value => { hooks[index] = typeof value === 'function' ? value(hooks[index]) : value; }];
  },
  useRef(initial) {
    const index = cursor++;
    if (!(index in hooks)) hooks[index] = { current: initial };
    return hooks[index];
  },
  useCallback: fn => { cursor++; return fn; },
  useEffect: () => { cursor++; },
};
runInNewContext(readFileSync(new URL('./client.js', import.meta.url), 'utf8'), {
  window: { __ModuleLoader__: { load: value => { bundle = value; } }, confirm: () => true },
  fetch: async (_url, options) => {
    if (!options?.body) return { ok: true, json: async () => hooks[0] };
    const body = JSON.parse(options.body);
    posted.push(body);
    return { ok: true, json: async () => ({ result: body.kind === 'gateway-logs' ? { text: 'ready', next: 5, lossy: true } : 'ok' }) };
  },
}, { filename: 'client.js' });
bundle.factory(() => React).apply({
  effect: fn => fn(),
  locale: { register: () => () => {}, bind: () => key => key },
  slots: { inject: (_slot, fn) => fn(), register: (options, Component) => { slots.push([options, Component]); return () => {}; } },
});
const Panel = slots.find(([options]) => options.name === 'main')[1];
const render = () => { cursor = 0; return Panel(); };
function all(node) {
  if (Array.isArray(node)) return node.flatMap(all);
  if (!node || typeof node !== 'object' || !('tag' in node)) return [];
  return [node, ...node.children.flatMap(all)];
}
const select = (tree, predicate) => all(tree).filter(predicate);
const panel = (tree, id) => select(tree, node => node.props.id === `dtm-panel-${id}`)[0];
const rows = tree => select(panel(tree, 'sessions'), node => node.props.className === 'dtm-session');
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
  gateways: [{ id: 'g1', label: 'Preview', status: 'ready', workspace: 'Alpha', bundles: ['demo'], url: 'http://127.0.0.1:3190/api/dsh-dev-gateways/open?id=g1', expiresAt: null, ownerSessionId: 'live-1' }],
};
let tree = render();
assert.equal(rows(tree).length, 4, 'all unarchived sessions, including inactive history, must be shown');
assert.equal(panel(tree, 'processes').props.hidden, true);
const tabs = select(tree, node => node.props.role === 'tab');
assert.equal(tabs.length, 3);
let focused;
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
await select(gateway, node => node.tag === 'button' && node.props['aria-label'] === 'logs: Preview')[0].props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(posted.at(-1))), { kind: 'gateway-logs', id: 'g1', from: 0 });
assert.equal(select(panel(render(), 'gateways'), node => node.tag === 'pre')[0].children[0], 'ready');
await select(panel(render(), 'gateways'), node => node.tag === 'button' && node.props['aria-label'] === 'extend: Preview')[0].props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(posted.at(-1))), { kind: 'gateway-extend', id: 'g1', minutes: 30 });
await select(panel(render(), 'gateways'), node => node.tag === 'button' && node.props['aria-label'] === 'stop: Preview')[0].props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(posted.at(-1))), { kind: 'gateway-stop', id: 'g1' });
hooks[0].gateways[0].status = 'stopped';
await select(panel(render(), 'gateways'), node => node.tag === 'button' && node.props['aria-label'] === 'prune: Preview')[0].props.onClick();
assert.deepEqual(JSON.parse(JSON.stringify(posted.at(-1))), { kind: 'gateway-prune', id: 'g1' });
console.log('Task Master client view/filter/gateway checks passed');
