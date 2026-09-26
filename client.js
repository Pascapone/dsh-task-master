window.__ModuleLoader__.load({
  id: '@pascapone/dsh-task-master',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const URL = 'api/dsh-task-master';
    const CSS = `
.dtm{height:100%;min-height:0;min-width:0;display:flex;flex-direction:column;container-type:inline-size;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:13px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.dtm *{box-sizing:border-box}.dtm button,.dtm input{font:inherit}.dtm button{cursor:pointer}.dtm button:disabled{opacity:.45;cursor:not-allowed}.dtm :is(button,input,[tabindex]):focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dtm-head{flex:none;background:var(--dsw-alias-bg-base);border-bottom:1px solid var(--dsw-alias-border-l3)}
.dtm-toolbar{min-height:36px;padding:3px 10px;display:flex;align-items:center;gap:10px}.dtm-title{font-size:14px;font-weight:620;white-space:nowrap;letter-spacing:-.01em}.dtm-spacer{flex:1}.dtm-time{color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap}
.dtm-refresh{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:17px!important;line-height:1}.dtm-refresh:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dtm-tabs{display:flex;align-items:end;gap:19px;padding:0 10px;overflow-x:auto;scrollbar-width:thin}.dtm-tab{flex:none;display:flex;align-items:center;gap:6px;min-height:34px;padding:6px 2px 7px;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);white-space:nowrap}.dtm-tab:hover{color:var(--dsw-alias-label-primary)}.dtm-tab[aria-selected=true]{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-state-business-primary)}.dtm-tab-count{font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dtm-panel{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}.dtm-panel[hidden]{display:none}
.dtm-controls{position:sticky;top:0;z-index:2;display:flex;align-items:center;flex-wrap:wrap;gap:5px 14px;min-height:38px;padding:4px 10px;background:var(--dsw-alias-bg-base);border-bottom:1px solid var(--dsw-alias-border-l3)}
.dtm-search{flex:0 1 190px;min-width:115px;height:27px;padding:3px 8px;border:1px solid var(--dsw-alias-border-l3);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);outline:none}.dtm-search::placeholder{color:var(--dsw-alias-label-tertiary)}
.dtm-segment{display:flex;align-items:center;gap:2px;min-width:0;overflow-x:auto;scrollbar-width:none}.dtm-segment::-webkit-scrollbar{display:none}.dtm-chip{flex:none;min-height:26px;padding:3px 7px;border:1px solid transparent;border-radius:5px;background:transparent;color:var(--dsw-alias-label-secondary);white-space:nowrap}.dtm-chip:hover{background:var(--dsw-alias-interactive-bg-hover)}.dtm-chip[aria-pressed=true]{border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}.dtm-chip-count{font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dtm-check{display:inline-flex;align-items:center;gap:5px;min-height:27px;color:var(--dsw-alias-label-secondary);white-space:nowrap;cursor:pointer}.dtm-check input{width:14px;height:14px;margin:0;accent-color:var(--dsw-alias-state-business-primary)}.dtm-filter-count{margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums}
.dtm-session,.dtm-process{border-bottom:1px solid var(--dsw-alias-border-l3)}.dtm-session-main,.dtm-process-main{display:flex;align-items:center;gap:9px;min-height:37px;padding:4px 10px}.dtm-session-main:hover,.dtm-process-main:hover,.dtm-resource:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dtm-identity{display:flex;align-items:baseline;gap:8px;flex:1;min-width:0}.dtm-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:550}.dtm-id,.dtm-pid{flex:none;color:var(--dsw-alias-label-tertiary);font:11px/1.4 'SF Mono',Consolas,monospace;white-space:nowrap}.dtm-identity .dtm-id{font-size:11px}
.dtm-state{display:inline-flex;align-items:center;gap:6px;flex:none;min-width:67px;color:var(--dsw-alias-label-secondary);font-size:11px;white-space:nowrap}.dtm-state:before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}.dtm-state.running,.dtm-state.confirmed{color:var(--dsw-alias-state-success-primary)}.dtm-state.suspected{color:var(--dsw-alias-state-warn-primary)}.dtm-state.archived,.dtm-state.inactive,.dtm-state.unknown{color:var(--dsw-alias-label-tertiary)}
.dtm-task-count{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px;min-width:38px;text-align:right}.dtm-task-count:empty{min-width:38px}.dtm-stop{flex:none;min-width:55px;min-height:26px;padding:3px 7px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);text-align:center;white-space:nowrap}.dtm-stop:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.dtm-stop.danger:hover{color:var(--dsw-alias-state-error-primary)}
.dtm-resource{display:flex;align-items:center;gap:9px;min-height:30px;padding:2px 10px 2px 27px}.dtm-resource-type{width:66px;flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px}.dtm-resource-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dtm-resource .dtm-stop{min-height:24px;font-size:11px}
.dtm-port{flex:none;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11px/1.5 'SF Mono',Consolas,monospace;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}.dtm-process .dtm-state{min-width:78px}.dtm-workspace{flex:0 1 150px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:11px}
.dtm-empty{padding:17px 10px;color:var(--dsw-alias-label-secondary)}.dtm-notice{padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);font-size:11px}.dtm-notice.error{color:var(--dsw-alias-state-error-primary)}
@container (max-width:700px){.dtm-controls{gap:4px 9px}.dtm-search{flex:1 1 140px}.dtm-filter-count{margin-left:0}.dtm-process-main{flex-wrap:wrap}.dtm-process .dtm-identity{flex-basis:calc(100% - 75px)}.dtm-process .dtm-stop{order:1}.dtm-port{order:2}.dtm-workspace{order:3}.dtm-process .dtm-state{order:4;margin-left:auto}.dtm-process-main{gap:3px 8px;padding-top:6px;padding-bottom:6px}.dtm-task-count{min-width:28px}}
@container (max-width:470px){.dtm-controls .dtm-search{flex-basis:100%}.dtm-controls .dtm-filter-count{flex-basis:100%}.dtm-session-main{gap:5px}.dtm-session .dtm-state{min-width:58px}.dtm-session .dtm-task-count{display:none}.dtm-resource{padding-left:18px}.dtm-resource-type{width:53px}.dtm-time{display:none}}
@media (pointer:coarse){.dtm-stop,.dtm-refresh,.dtm-chip,.dtm-tab,.dtm-check{min-height:44px}.dtm-search{height:38px}.dtm-session-main,.dtm-process-main{min-height:44px}.dtm-resource{min-height:44px}}
`;
    const dict = {
      en: {
        title: 'Task Master', sessions: 'Sessions', processes: 'Processes', refresh: 'Refresh', checked: 'Checked',
        search: 'Find workspace or session', sessionFilters: 'Session status', processFilters: 'Process ownership',
        all: 'All', running: 'Running', idle: 'Idle', inactive: 'Inactive', archived: 'Archived', showArchived: 'Show archived', withTasks: 'Has activity',
        confirmed: 'Confirmed', suspected: 'Suspected', unknown: 'Unknown', job: 'Job', terminal: 'Terminal', tasks: 'tasks',
        stop: 'Stop', stopping: 'Stopping…', protected: 'Protected', stopTurn: 'Stop running turn',
        emptySessions: 'No sessions match these filters.', emptyProcesses: 'No listening processes match this filter.',
        scanError: 'OS process scan failed', loadError: 'Could not load Task Master.',
        note: 'Suspected means a path mentions the workspace, not proof of ownership. Unknown processes may belong to other apps. Stop affects only the selected PID.',
        ask: 'Stop this process? It may belong to another application. Its PID and start time will be checked again.',
        askOwned: 'Stop this DSH-managed task?', failed: 'Could not stop the target.',
      },
      de: {
        title: 'Task Master', sessions: 'Sessions', processes: 'Prozesse', refresh: 'Aktualisieren', checked: 'Geprüft',
        search: 'Workspace oder Session suchen', sessionFilters: 'Session-Status', processFilters: 'Prozesszuordnung',
        all: 'Alle', running: 'Läuft', idle: 'Bereit', inactive: 'Inaktiv', archived: 'Archiviert', showArchived: 'Archivierte anzeigen', withTasks: 'Mit Aktivität',
        confirmed: 'Bestätigt', suspected: 'Vermutet', unknown: 'Unbekannt', job: 'Job', terminal: 'Terminal', tasks: 'Aufgaben',
        stop: 'Stoppen', stopping: 'Stoppt…', protected: 'Geschützt', stopTurn: 'Laufenden Turn stoppen',
        emptySessions: 'Keine Sessions für diese Filter.', emptyProcesses: 'Keine lauschenden Prozesse für diesen Filter.',
        scanError: 'OS-Prozessscan fehlgeschlagen', loadError: 'Task Master konnte nicht geladen werden.',
        note: 'Vermutet bedeutet nur: Ein Pfad erwähnt das Workspace. Unbekannte Prozesse können anderen Apps gehören. Stoppen betrifft nur die ausgewählte PID.',
        ask: 'Diesen Prozess stoppen? Er könnte zu einer anderen App gehören. PID und Startzeit werden erneut geprüft.',
        askOwned: 'Diese DSH-Aufgabe stoppen?', failed: 'Ziel konnte nicht gestoppt werden.',
      },
    };
    function Icon({ size, active }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, style: { opacity: active ? 1 : .82 } },
        h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 3 }),
        h('path', { d: 'M6.5 13h2.2l1.7-4 2.7 7 1.8-3h2.6' }));
    }
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register('@pascapone/dsh-task-master', dict), 'task-master: language');
        const t = ctx.locale.bind('@pascapone/dsh-task-master');
        function Panel() {
          React.useSyncExternalStore(cb => ctx.locale.subscribe(cb), () => ctx.locale.getSnapshot());
          const [data, setData] = React.useState(null);
          const [error, setError] = React.useState('');
          const [tab, setTab] = React.useState('sessions');
          const [sessionStatus, setSessionStatus] = React.useState('all');
          const [showArchived, setShowArchived] = React.useState(false);
          const [withTasks, setWithTasks] = React.useState(false);
          const [query, setQuery] = React.useState('');
          const [ownership, setOwnership] = React.useState('all');
          const [busy, setBusy] = React.useState('');
          const currentRequest = React.useRef(null);
          const followupTimer = React.useRef(null);
          const refresh = React.useCallback(async (signal = currentRequest.current?.signal) => {
            try {
              const response = await fetch(URL, { signal });
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              const result = await response.json();
              if (!signal?.aborted) { setData(result); setError(''); }
            } catch (failure) { if (!signal?.aborted) setError(failure.message); }
          }, []);
          React.useEffect(() => {
            const controller = new AbortController();
            currentRequest.current = controller;
            refresh(controller.signal);
            const timer = setInterval(() => { if (!document.hidden) refresh(controller.signal); }, 8000);
            return () => { controller.abort(); clearInterval(timer); clearTimeout(followupTimer.current); currentRequest.current = null; };
          }, [refresh]);
          async function stop(target, key) {
            if (!window.confirm(target.kind === 'process' ? t('ask') : t('askOwned'))) return;
            setBusy(key);
            try {
              const response = await fetch(URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(target) });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error ?? `HTTP ${response.status}`);
              await refresh();
              clearTimeout(followupTimer.current);
              followupTimer.current = setTimeout(() => refresh(), 1200);
            } catch (failure) { setError(`${t('failed')} ${failure.message}`); }
            finally { setBusy(''); }
          }
          function switchTab(event, next) {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const target = event.key === 'Home' ? 'sessions' : event.key === 'End' ? 'processes'
              : next === 'sessions' ? 'processes' : 'sessions';
            setTab(target);
            event.currentTarget.parentElement.querySelector(`[data-task-master-tab="${target}"]`)?.focus();
          }
          const sessions = data?.sessions ?? [];
          const processes = data?.processes ?? [];
          const scope = sessions.filter(item => showArchived || !item.archived);
          const normalized = query.trim().toLocaleLowerCase();
          const visible = scope.filter(item =>
            (sessionStatus === 'all' || (sessionStatus === 'running' ? item.running
              : sessionStatus === 'idle' ? item.available && !item.running && !item.archived
              : !item.available && !item.archived)) &&
            (!withTasks || item.running || item.jobs.length + item.terminals.length > 0) &&
            (!normalized || `${item.workspace ?? ''} ${item.id}`.toLocaleLowerCase().includes(normalized)));
          const shownProcesses = ownership === 'all' ? processes : processes.filter(item => item.confidence === ownership);
          const tabButton = (id, label, count) => h('button', {
            type: 'button', role: 'tab', id: `dtm-tab-${id}`, key: id, 'data-task-master-tab': id,
            'aria-controls': `dtm-panel-${id}`, 'aria-selected': tab === id,
            tabIndex: tab === id ? 0 : -1, className: 'dtm-tab', onClick: () => setTab(id),
            onKeyDown: event => switchTab(event, id),
          }, label, h('span', { className: 'dtm-tab-count' }, count));
          const chip = (value, selected, choose, label, count) => h('button', {
            key: value, type: 'button', className: 'dtm-chip', 'aria-pressed': selected === value, onClick: () => choose(value),
          }, label, count === undefined ? null : h('span', { className: 'dtm-chip-count' }, ` ${count}`));
          const stopButton = (target, key, disabled, label, disabledLabel = t('protected')) => h('button', {
            type: 'button', className: 'dtm-stop' + (target.kind === 'process' ? ' danger' : ''),
            disabled: disabled || !!busy, title: disabled ? disabledLabel : label,
            'aria-label': disabled ? `${disabledLabel}: ${label}` : label,
            onClick: () => stop(target, key),
          }, disabled ? disabledLabel : busy === key ? t('stopping') : t('stop'));
          const status = (kind, label) => h('span', { className: `dtm-state ${kind}` }, label);
          return h('div', { className: 'dtm' }, h('style', null, CSS),
            h('header', { className: 'dtm-head' },
              h('div', { className: 'dtm-toolbar' },
                h('span', { className: 'dtm-title' }, t('title')),
                h('span', { className: 'dtm-spacer' }),
                data && h('time', { className: 'dtm-time', dateTime: new Date(data.scannedAt).toISOString() }, t('checked'), ' ', new Date(data.scannedAt).toLocaleTimeString()),
                h('button', { type: 'button', className: 'dtm-refresh', title: t('refresh'), 'aria-label': t('refresh'), onClick: () => refresh() }, '↻')),
              h('div', { className: 'dtm-tabs', role: 'tablist', 'aria-label': t('title') },
                tabButton('sessions', t('sessions'), scope.length), tabButton('processes', t('processes'), processes.length))),
            h('section', { id: 'dtm-panel-sessions', role: 'tabpanel', 'aria-labelledby': 'dtm-tab-sessions', className: 'dtm-panel', hidden: tab !== 'sessions', tabIndex: 0 },
              h('div', { className: 'dtm-controls' },
                h('input', { type: 'search', className: 'dtm-search', value: query, onChange: event => setQuery(event.target.value), placeholder: t('search'), 'aria-label': t('search') }),
                h('div', { className: 'dtm-segment', role: 'group', 'aria-label': t('sessionFilters'), title: t('sessionFilters') },
                  ['all', 'running', 'idle', 'inactive'].map(value => chip(value, sessionStatus, setSessionStatus, t(value)))),
                h('label', { className: 'dtm-check' }, h('input', { type: 'checkbox', checked: withTasks, onChange: event => setWithTasks(event.target.checked) }), t('withTasks')),
                h('label', { className: 'dtm-check' }, h('input', { type: 'checkbox', checked: showArchived, onChange: event => setShowArchived(event.target.checked) }), t('showArchived'),
                  h('span', { className: 'dtm-chip-count' }, sessions.filter(item => item.archived).length)),
                h('span', { className: 'dtm-filter-count', 'aria-live': 'polite' }, `${visible.length} / ${scope.length}`)),
              error && h('div', { className: 'dtm-notice error', role: 'alert' }, t('loadError'), ' ', error),
              visible.length ? visible.map(session => {
                const count = session.jobs.length + session.terminals.length;
                const state = session.archived ? 'archived' : session.running ? 'running' : session.available ? 'idle' : 'inactive';
                return h('div', { className: 'dtm-session', key: session.id },
                  h('div', { className: 'dtm-session-main' },
                    h('div', { className: 'dtm-identity', title: `${session.workspace ?? session.id} · ${session.id}` },
                      h('span', { className: 'dtm-name' }, session.workspace ?? session.id),
                      h('span', { className: 'dtm-id', title: session.id }, session.id.slice(-8))),
                    status(state, t(state)),
                    h('span', { className: 'dtm-task-count' }, count ? `${count} ${t('tasks')}` : ''),
                    session.running ? stopButton({ kind: 'turn', sessionId: session.id }, `turn:${session.id}`, false, `${t('stopTurn')}: ${session.id}`)
                      : h('span', { className: 'dtm-stop', 'aria-hidden': true })),
                  session.jobs.map(job => h('div', { className: 'dtm-resource', key: `job:${job.id}` },
                    h('span', { className: 'dtm-resource-type' }, t('job')),
                    h('span', { className: 'dtm-resource-name', title: job.label }, job.label),
                    stopButton({ kind: 'job', sessionId: session.id, id: job.id }, `job:${job.id}`, job.status !== 'running', `${t('stop')} ${t('job')}: ${job.label}`, t('stopping')))),
                  session.terminals.map(terminal => h('div', { className: 'dtm-resource', key: `${terminal.source}:${terminal.id}` },
                    h('span', { className: 'dtm-resource-type' }, t('terminal')),
                    h('span', { className: 'dtm-resource-name', title: terminal.label }, terminal.label, terminal.pid ? ` · PID ${terminal.pid}` : ''),
                    stopButton({ kind: terminal.source, sessionId: session.id, id: terminal.id }, `${terminal.source}:${terminal.id}`, false, `${t('stop')} ${t('terminal')}: ${terminal.label}`))));
              }) : h('div', { className: 'dtm-empty' }, t('emptySessions'))),
            h('section', { id: 'dtm-panel-processes', role: 'tabpanel', 'aria-labelledby': 'dtm-tab-processes', className: 'dtm-panel', hidden: tab !== 'processes', tabIndex: 0 },
              h('div', { className: 'dtm-controls' },
                h('div', { className: 'dtm-segment', role: 'group', 'aria-label': t('processFilters') },
                  ['all', 'confirmed', 'suspected', 'unknown'].map(value => chip(value, ownership, setOwnership, t(value), value === 'all' ? processes.length : processes.filter(item => item.confidence === value).length))),
                h('span', { className: 'dtm-filter-count', 'aria-live': 'polite' }, `${shownProcesses.length} / ${processes.length}`)),
              error && h('div', { className: 'dtm-notice error', role: 'alert' }, t('loadError'), ' ', error),
              data?.scanError && h('div', { className: 'dtm-notice error', role: 'alert' }, t('scanError'), ': ', data.scanError),
              shownProcesses.length ? shownProcesses.map(item => h('div', { className: 'dtm-process', key: `${item.pid}:${item.started}` },
                h('div', { className: 'dtm-process-main' },
                  h('div', { className: 'dtm-identity', title: `${item.name || item.pid} · PID ${item.pid}` },
                    h('span', { className: 'dtm-name' }, item.name || `PID ${item.pid}`), h('span', { className: 'dtm-pid' }, `PID ${item.pid}`)),
                  h('span', { className: 'dtm-workspace', title: item.workspace ?? '' }, item.workspace ?? ''),
                  h('span', { className: 'dtm-port', title: item.ports.join(', ') }, item.ports[0], item.ports.length > 1 ? ` +${item.ports.length - 1}` : ''),
                  status(item.confidence, t(item.confidence)),
                  stopButton({ kind: 'process', pid: item.pid, started: item.started }, `pid:${item.pid}`, item.protected, `${t('stop')} PID ${item.pid} · ${item.ports.join(', ')}`))))
                : h('div', { className: 'dtm-empty' }, t('emptyProcesses')),
              h('p', { className: 'dtm-notice' }, t('note'))));
        }
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'dsh-task-master' }, Panel));
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'dsh-task-master', order: 12, label: () => t('title') }, Icon));
      },
    };
  },
});
