window.__ModuleLoader__.load({
  id: '@pascapone/dsh-task-master',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const URL = 'api/dsh-task-master';
    const CSS = `
.dtm{height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;container-type:inline-size}
.dtm *{box-sizing:border-box}.dtm-inner{max-width:1240px;margin:auto;padding:30px 32px 68px}
.dtm-top{display:flex;justify-content:space-between;gap:18px;align-items:start;padding-bottom:25px;border-bottom:.5px solid var(--dsw-alias-border-l3)}
.dtm-eyebrow{display:flex;align-items:center;gap:9px;color:var(--dsw-alias-label-tertiary);font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700}
.dtm-live{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px var(--dsw-alias-bg-layer-2)}
.dtm h1{font-size:25px;line-height:1.2;letter-spacing:-.035em;margin:11px 0 6px;font-weight:680}.dtm-sub{color:var(--dsw-alias-label-secondary);margin:0;max-width:580px}
.dtm-action,.dtm-filter,.dtm-stop{font:inherit;border:0;cursor:pointer;color:var(--dsw-alias-label-primary)}.dtm-action{background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-elevation-soft);padding:8px 13px;border-radius:10px;white-space:nowrap}.dtm-action:hover,.dtm-stop:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dtm-action:disabled,.dtm-stop:disabled{cursor:not-allowed;opacity:.42}.dtm :is(button):focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dtm-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:23px 0 29px}.dtm-stat{background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l3);border-radius:14px;padding:15px 18px}.dtm-stat strong{display:block;font-size:25px;letter-spacing:-.04em;line-height:1.2;font-variant-numeric:tabular-nums}.dtm-stat span{color:var(--dsw-alias-label-secondary);font-size:11px;letter-spacing:.02em}
.dtm-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:28px 0 11px}.dtm-heading h2{margin:0;font-size:15px;font-weight:650;letter-spacing:-.02em}.dtm-count{font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dtm-list{background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l3);border-radius:14px;overflow:hidden}.dtm-row{display:flex;align-items:center;gap:14px;min-height:63px;padding:12px 16px;border-top:.5px solid var(--dsw-alias-border-l3)}.dtm-row:first-child{border-top:0}.dtm-identity{min-width:0;flex:1}.dtm-name{font-weight:590;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dtm-detail{font-size:11px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dtm-meta{min-width:118px;text-align:right}.dtm-port{font:12px/1.5 'SF Mono',Consolas,monospace;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}.dtm-tag{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font-size:11px;font-weight:560}.dtm-tag:before{content:'';width:6px;height:6px;background:currentColor;border-radius:50%}.dtm-tag.confirmed{color:var(--dsw-alias-state-success-primary)}.dtm-tag.suspected{color:var(--dsw-alias-state-warn-primary)}.dtm-tag.unknown{color:var(--dsw-alias-label-tertiary)}
.dtm-stop{border-radius:8px;padding:7px 9px;white-space:nowrap;background:var(--dsw-alias-bg-layer-2);min-width:68px}.dtm-stop.danger{color:var(--dsw-alias-state-error-primary)}.dtm-stop.danger:hover{background:var(--dsw-alias-interactive-bg-hover-danger)}
.dtm-session{padding:14px 16px;border-top:.5px solid var(--dsw-alias-border-l3)}.dtm-session:first-child{border-top:0}.dtm-session-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.dtm-session-name{font-weight:620;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dtm-resources{padding:9px 0 0 12px;margin:10px 0 0 3px;border-left:1px solid var(--dsw-alias-border-l3)}.dtm-resource{display:flex;align-items:center;gap:12px;min-height:35px}.dtm-resource .dtm-detail{flex:1}.dtm-resource .dtm-stop{font-size:11px;padding:5px 9px}.dtm-pid{font:11px Consolas,monospace;color:var(--dsw-alias-label-tertiary)}
.dtm-filters{display:flex;gap:4px;overflow:auto;padding:3px 0 10px}.dtm-filter{white-space:nowrap;border-radius:8px;padding:6px 10px;background:transparent;color:var(--dsw-alias-label-secondary)}.dtm-filter:hover{background:var(--dsw-alias-interactive-bg-hover)}.dtm-filter[aria-pressed=true]{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dtm-empty{color:var(--dsw-alias-label-secondary);padding:23px 16px}.dtm-notice{padding:11px 14px;border-radius:10px;margin:16px 0 0;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);border:.5px solid var(--dsw-alias-border-l3)}.dtm-notice.error{color:var(--dsw-alias-state-error-primary)}.dtm-foot{color:var(--dsw-alias-label-tertiary);font-size:11px;margin-top:17px}
@container (max-width:700px){.dtm-inner{padding:18px 16px 48px}.dtm-stats{gap:7px}.dtm-stat{padding:12px}.dtm-stat strong{font-size:20px}.dtm-row{flex-wrap:wrap;gap:7px 11px}.dtm-identity{flex-basis:calc(100% - 86px)}.dtm-meta{order:3;flex:1;text-align:left}.dtm-row>.dtm-stop{order:2}.dtm-session-head{flex-wrap:wrap}.dtm h1{font-size:22px}}
@container (max-width:400px){.dtm-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.dtm-stat span{font-size:10px}.dtm-top{align-items:center}.dtm-action{padding:7px 9px}.dtm-sub{font-size:12px}}
`;
    const dict = {
      en: { panel: 'Task Master', eyebrow: 'LIVE SYSTEM VIEW', title: 'Task Master', subtitle: 'See what is still running. Ownership is shown only when DSH can prove it.', refresh: 'Refresh', sessions: 'Active sessions', resources: 'Managed tasks', listeners: 'Listening processes', confirmed: 'Confirmed', suspected: 'Suspected', unknown: 'Unknown', all: 'All', stop: 'Stop', stopTurn: 'Stop turn', stopping: 'Stopping…', protected: 'Protected', noSessions: 'No active sessions or managed tasks.', noPorts: 'No listening processes in this category.', scanError: 'OS process scan failed', loadError: 'Could not load the task manager.', note: 'Suspected means a path mentions the workspace, not proof of session ownership. Unknown processes may belong to other apps. Stop affects the selected PID only.', ask: 'Stop this process? It may belong to another application. Its PID and start time will be checked again.', askOwned: 'Stop this DSH-managed task?', failed: 'Could not stop the target.', active: 'Running', idle: 'Idle', updated: 'Last checked', workspace: 'Workspace', session: 'Session', job: 'Job', terminal: 'Terminal', port: 'TCP listener', agent: 'Agent' },
      de: { panel: 'Task-Master', eyebrow: 'SYSTEM · LIVE', title: 'Task-Master', subtitle: 'Was läuft noch? Eine Zuordnung gilt nur als bestätigt, wenn DSH den Besitzer kennt.', refresh: 'Aktualisieren', sessions: 'Aktive Sessions', resources: 'Verwaltete Aufgaben', listeners: 'Lauschende Prozesse', confirmed: 'Bestätigt', suspected: 'Vermutet', unknown: 'Unbekannt', all: 'Alle', stop: 'Beenden', stopTurn: 'Turn stoppen', stopping: 'Beendet…', protected: 'Geschützt', noSessions: 'Keine aktiven Sessions oder verwalteten Aufgaben.', noPorts: 'Keine lauschenden Prozesse in dieser Kategorie.', scanError: 'OS-Prozessscan fehlgeschlagen', loadError: 'Task-Master konnte nicht geladen werden.', note: 'Vermutet bedeutet nur: Ein Pfad erwähnt das Workspace. Unbekannte Prozesse können anderen Apps gehören. Beenden betrifft nur die ausgewählte PID.', ask: 'Diesen Prozess beenden? Er könnte zu einer anderen App gehören. PID und Startzeit werden nochmals geprüft.', askOwned: 'Diese verwaltete Aufgabe beenden?', failed: 'Ziel konnte nicht beendet werden.', active: 'Arbeitet', idle: 'Bereit', updated: 'Letzte Prüfung', workspace: 'Workspace', session: 'Session', job: 'Job', terminal: 'Terminal', port: 'TCP-Port', agent: 'Agent' },
    };
    function icon(size, active) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, style: { opacity: active ? 1 : .82 } },
        h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 3 }),
        h('path', { d: 'M6.5 13h2.2l1.7-4 2.7 7 1.8-3h2.6' }));
    }
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register('@pascapone/dsh-task-master', dict), 'task-manager: language');
        const t = ctx.locale.bind('@pascapone/dsh-task-master');
        function Panel() {
          React.useSyncExternalStore(cb => ctx.locale.subscribe(cb), () => ctx.locale.getSnapshot());
          const [data, setData] = React.useState(null);
          const [error, setError] = React.useState('');
          const [filter, setFilter] = React.useState('all');
          const [busy, setBusy] = React.useState('');
          const refresh = React.useCallback(async (signal) => {
            try {
              const response = await fetch(URL, { signal });
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              const result = await response.json();
              if (!signal?.aborted) { setData(result); setError(''); }
            } catch (failure) { if (!signal?.aborted) setError(failure.message); }
          }, []);
          React.useEffect(() => {
            const controller = new AbortController();
            refresh(controller.signal);
            const timer = setInterval(() => { if (!document.hidden) refresh(controller.signal); }, 8000);
            return () => { controller.abort(); clearInterval(timer); };
          }, [refresh]);
          async function stop(target, key) {
            if (!window.confirm(target.kind === 'process' ? t('ask') : t('askOwned'))) return;
            setBusy(key);
            try {
              const response = await fetch(URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(target) });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error ?? `HTTP ${response.status}`);
              await refresh();
              setTimeout(() => { refresh(); }, 1200);
            } catch (failure) { setError(`${t('failed')} ${failure.message}`); }
            finally { setBusy(''); }
          }
          const sessions = data?.sessions ?? [];
          const processes = data?.processes ?? [];
          const filtered = filter === 'all' ? processes : processes.filter(item => item.confidence === filter);
          const count = sessions.reduce((n, item) => n + item.jobs.length + item.terminals.length, 0);
          const stopButton = (target, key, disabled) => h('button', { type: 'button', className: 'dtm-stop' + (target.kind === 'process' ? ' danger' : ''), disabled: disabled || !!busy, onClick: () => stop(target, key) }, disabled ? t('protected') : busy === key ? t('stopping') : t('stop'));
          return h('div', { className: 'dtm' }, h('style', null, CSS), h('div', { className: 'dtm-inner' },
            h('header', { className: 'dtm-top' }, h('div', null,
              h('div', { className: 'dtm-eyebrow' }, h('span', { className: 'dtm-live' }), t('eyebrow')),
              h('h1', null, t('title')), h('p', { className: 'dtm-sub' }, t('subtitle'))),
              h('button', { type: 'button', className: 'dtm-action', onClick: () => refresh() }, '↻  ', t('refresh'))),
            h('div', { className: 'dtm-stats' },
              [[sessions.length, t('sessions')], [count, t('resources')], [processes.length, t('listeners')]].map(([n, label]) =>
                h('div', { className: 'dtm-stat', key: label }, h('strong', null, data ? n : '—'), h('span', null, label)))),
            error && h('div', { className: 'dtm-notice error', role: 'alert' }, t('loadError'), ' ', error),
            data?.scanError && h('div', { className: 'dtm-notice error', role: 'alert' }, t('scanError'), ': ', data.scanError),
            h('div', { className: 'dtm-heading' }, h('h2', null, t('sessions')), h('span', { className: 'dtm-count' }, sessions.length)),
            h('section', { className: 'dtm-list', 'aria-label': t('sessions') }, sessions.length ? sessions.map(session =>
              h('div', { className: 'dtm-session', key: session.id },
                h('div', { className: 'dtm-session-head' },
                  h('div', { className: 'dtm-identity' }, h('div', { className: 'dtm-session-name', title: session.workspace ?? session.id }, session.workspace ?? session.id), h('div', { className: 'dtm-detail' }, t('session'), ' · ', session.id)),
                  h('span', { className: 'dtm-tag ' + (session.running ? 'confirmed' : 'unknown') }, t(session.running ? 'active' : 'idle')),
                  session.running && stopButton({ kind: 'turn', sessionId: session.id }, 'turn:' + session.id)),
                (session.jobs.length > 0 || session.terminals.length > 0) && h('div', { className: 'dtm-resources' },
                  session.jobs.map(job => h('div', { className: 'dtm-resource', key: job.id }, h('span', { className: 'dtm-tag confirmed' }, t('job')), h('span', { className: 'dtm-detail', title: job.label }, job.label, ' · ', job.status), stopButton({ kind: 'job', sessionId: session.id, id: job.id }, 'job:' + job.id))),
                  session.terminals.map(terminal => h('div', { className: 'dtm-resource', key: terminal.source + terminal.id }, h('span', { className: 'dtm-tag confirmed' }, t('terminal')), h('span', { className: 'dtm-detail' }, terminal.label, terminal.pid ? ` · PID ${terminal.pid}` : ''), stopButton({ kind: terminal.source, sessionId: session.id, id: terminal.id }, terminal.source + terminal.id))))))
              : h('div', { className: 'dtm-empty' }, t('noSessions'))),
            h('div', { className: 'dtm-heading' }, h('h2', null, t('listeners')), h('span', { className: 'dtm-count' }, processes.length)),
            h('div', { className: 'dtm-filters', role: 'group', 'aria-label': t('listeners') }, ['all', 'confirmed', 'suspected', 'unknown'].map(value =>
              h('button', { type: 'button', className: 'dtm-filter', key: value, 'aria-pressed': filter === value, onClick: () => setFilter(value) }, t(value), value !== 'all' ? ` · ${processes.filter(item => item.confidence === value).length}` : ''))),
            h('section', { className: 'dtm-list', 'aria-label': t('listeners') }, filtered.length ? filtered.map(item =>
              h('div', { className: 'dtm-row', key: item.pid + ':' + item.started },
                h('div', { className: 'dtm-identity' }, h('div', { className: 'dtm-name' }, item.name || `PID ${item.pid}`), h('div', { className: 'dtm-detail' }, 'PID ', item.pid, item.workspace ? ` · ${item.workspace}` : '', item.sessionId ? ` · ${t('session')} ${item.sessionId}` : '')),
                h('div', { className: 'dtm-meta' }, h('div', { className: 'dtm-port', title: item.ports.join(', ') }, item.ports[0], item.ports.length > 1 ? ` +${item.ports.length - 1}` : ''), h('span', { className: 'dtm-tag ' + item.confidence }, t(item.confidence))),
                stopButton({ kind: 'process', pid: item.pid, started: item.started }, 'pid:' + item.pid, item.protected)))
              : h('div', { className: 'dtm-empty' }, t('noPorts'))),
            h('div', { className: 'dtm-foot' }, t('note'), data && ` · ${t('updated')}: ${new Date(data.scannedAt).toLocaleTimeString()}`)
          ));
        }
        function Icon({ size, active }) { return icon(size, active); }
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'dsh-task-master' }, Panel));
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'dsh-task-master', order: 12, label: () => t('panel') }, Icon));
      },
    };
  },
});
