import { decodeScan } from './scan.js';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
export const inject = ['connection', 'sessionController', 'workspaceRegistry', 'agents'];
const run = promisify(execFile);
const ROUTE = '/api/dsh-task-master';
export const SCAN = `$ErrorActionPreference = 'Stop'
$rootPids = @()
$processes = @(Get-CimInstance Win32_Process -Property ProcessId,ParentProcessId,CreationDate,Name,ExecutablePath,CommandLine | ForEach-Object {
  @{ pid = $_.ProcessId; parent = $_.ParentProcessId; started = $_.CreationDate.ToUniversalTime().Ticks.ToString(); name = $_.Name; path = $_.ExecutablePath; command = $_.CommandLine }
})
$listeners = @(Get-NetTCPConnection -State Listen | ForEach-Object {
  @{ pid = $_.OwningProcess; address = $_.LocalAddress; port = $_.LocalPort }
})
$owners = @($listeners | ForEach-Object { $_.pid } | Select-Object -Unique)
foreach ($entry in $processes) {
  if ($entry.pid -in $owners -or $entry.pid -in $rootPids) {
    try { $entry.started = (Get-Process -Id $entry.pid -ErrorAction Stop).StartTime.ToUniversalTime().Ticks.ToString() }
    catch { $entry.started = $null }
  }
}
ConvertTo-Json -InputObject @{ processes = $processes; listeners = $listeners } -Compress -Depth 4`;
// Keep one Windows process handle open while checking its creation time and terminating it.
export const KILL = `$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class TaskManagerStop {
  [DllImport("kernel32.dll", SetLastError=true)] public static extern IntPtr OpenProcess(uint access, bool inherit, int pid);
  [DllImport("kernel32.dll", SetLastError=true)] public static extern bool GetProcessTimes(IntPtr handle, out long created, out long exited, out long kernel, out long user);
  [DllImport("kernel32.dll", SetLastError=true)] public static extern bool TerminateProcess(IntPtr handle, uint exitCode);
  [DllImport("kernel32.dll")] public static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
  [DllImport("kernel32.dll")] public static extern bool CloseHandle(IntPtr handle);
}
'@
$handle = [TaskManagerStop]::OpenProcess(0x101001, $false, __PID__)
if ($handle -eq [IntPtr]::Zero) { throw 'Prozess nicht mehr erreichbar' }
try {
  [long]$created = 0; [long]$exited = 0; [long]$kernel = 0; [long]$user = 0
  if (-not [TaskManagerStop]::GetProcessTimes($handle, [ref]$created, [ref]$exited, [ref]$kernel, [ref]$user)) { throw 'Prozessidentität nicht lesbar' }
  if ([DateTime]::FromFileTimeUtc($created).Ticks.ToString() -ne '__STARTED__') { throw 'Prozessidentität hat sich geändert' }
  if (-not [TaskManagerStop]::TerminateProcess($handle, 1)) { throw 'Prozess konnte nicht beendet werden' }
  if ([TaskManagerStop]::WaitForSingleObject($handle, 2000) -ne 0) { throw 'Prozessende nicht bestätigt' }
} finally { [void][TaskManagerStop]::CloseHandle($handle) }`;
export function workspaceHint(process, workspaces) {
    const text = `${process.path ?? ''} ${process.command ?? ''}`.toLowerCase().replaceAll('/', '\\');
    const matches = workspaces.filter(workspace => {
        const path = workspace.path.toLowerCase().replaceAll('/', '\\').replace(/\\+$/, '');
        return text.includes(path + '\\') || text.includes(path + '"') || text.includes(path + "'");
    });
    return matches.length === 1 ? matches[0] : undefined;
}
export function protectedProcess(process, byPid, self = globalThis.process.pid) {
    if (!process || !Number.isSafeInteger(process?.pid) || process.pid <= 4 || !process.started)
        return true;
    if (/\\windows\\|\\program files\\windowsapps\\/i.test(process.path ?? ''))
        return true;
    if (/deepseek-harness|[\\/]apps[\\/]cli[\\/]lib[\\/]bin\.js\s+web|\bdsh(?:\.exe)?\s+web\b/i.test(process.command ?? ''))
        return true;
    // Protect this Gateway and its ancestors; walking only earlier parents avoids recycled PIDs.
    let current = byPid.get(self);
    const seen = new Set();
    while (current && !seen.has(current.pid)) {
        if (process.pid === current.pid)
            return true;
        seen.add(current.pid);
        const parent = byPid.get(current.parent);
        current = parent?.started && current.started && BigInt(parent.started) < BigInt(current.started) ? parent : undefined;
    }
    return false;
}
async function scanWindows(rootPids = []) {
    const script = SCAN.replace('$rootPids = @()', `$rootPids = @(${[...new Set(rootPids)].join(',')})`);
    const { stdout } = await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
        windowsHide: true, timeout: 12000, maxBuffer: 4 * 1024 * 1024,
    });
    const value = JSON.parse(stdout);
    return decodeScan(value);
}
// A job owns its Windows launcher, not every PID that happens to use the same port or workspace.
export function jobForProcess(process, byPid, roots) {
    const seen = new Set();
    let current = process;
    while (current?.started && !seen.has(current.pid)) {
        seen.add(current.pid);
        const root = roots.get(current.pid);
        if (root !== undefined)
            return root?.started === current.started ? root : undefined;
        const parent = byPid.get(current.parent);
        current = parent?.started && BigInt(parent.started) < BigInt(current.started) ? parent : undefined;
    }
}
export function inventory(ctx, sessions, scan) {
    const workspaces = ctx.workspaceRegistry.list();
    const archivedIds = new Set(ctx.workspaceRegistry.archivedSessionIds ?? []);
    const byPid = new Map(scan.processes.map(process => [process.pid, process]));
    const workspaceOf = (id) => workspaces.find(workspace => workspace.sessionIds.includes(id));
    const rows = [];
    const ownedPids = new Map();
    const roots = new Map();
    const sessionRows = [];
    for (const session of sessions) {
        const agent = ctx.agents.get(session.sessionId);
        const jobs = ctx.get('jobs')?.list(session.sessionId).filter(job => job.owner === session.sessionId && (job.status === 'running' || job.status === 'stopping')) ?? [];
        const terminals = agent ? (ctx.get('terminals')?.list(agent) ?? []).filter(terminal => terminal.status.kind === 'running') : [];
        const browser = agent ? (ctx.get('terminalController')?.list(session.sessionId) ?? []).filter(terminal => terminal.state === 'running') : [];
        sessionRows.push({
            id: session.sessionId, running: session.running, available: !!agent,
            archived: archivedIds.has(session.sessionId),
            workspace: workspaceOf(session.sessionId)?.title ?? session.cwd ?? null,
            jobs: jobs.map(job => ({ id: job.id, label: job.label, status: job.status })),
            terminals: [
                ...terminals.map(terminal => ({ id: terminal.sessionId, label: terminal.name ?? terminal.type, source: 'terminal', pid: terminal.pid ?? null })),
                ...browser.map(terminal => ({ id: terminal.id, label: terminal.title, source: 'browser-terminal', pid: null })),
            ],
        });
        for (const terminal of terminals)
            if (terminal.pid)
                ownedPids.set(terminal.pid, session.sessionId);
        for (const job of jobs) {
            const root = job.processRoot;
            if (!root || !Number.isSafeInteger(root?.pid) || root.pid <= 0 || !/^\d{15,20}$/.test(root.started))
                continue;
            const owner = { ...root, sessionId: session.sessionId, jobId: job.id, status: job.status };
            roots.set(root.pid, roots.has(root.pid) ? null : owner);
        }
    }
    const grouped = new Map();
    for (const listener of scan.listeners) {
        if (!Number.isSafeInteger(listener.pid) || !Number.isSafeInteger(listener.port))
            continue;
        const ports = grouped.get(listener.pid) ?? new Set();
        ports.add(`${listener.address}:${listener.port}`);
        grouped.set(listener.pid, ports);
    }
    for (const [pid, ports] of grouped) {
        const process = byPid.get(pid);
        if (!process?.started)
            continue;
        const job = jobForProcess(process, byPid, roots);
        const terminalOwner = ownedPids.get(pid);
        const conflict = job && terminalOwner && job.sessionId !== terminalOwner;
        const sessionId = conflict ? null : job?.sessionId ?? terminalOwner;
        const workspace = sessionId ? workspaceOf(sessionId) : workspaceHint(process, workspaces);
        rows.push({ pid, started: process.started, name: process.name, ports: [...ports].sort(),
            confidence: sessionId ? 'confirmed' : workspace ? 'suspected' : 'unknown',
            sessionId: sessionId ?? null, workspace: workspace?.title ?? null,
            jobId: conflict ? null : job?.jobId ?? null, jobStatus: conflict ? null : job?.status ?? null,
            protected: protectedProcess(process, byPid),
        });
    }
    rows.sort((left, right) => left.ports[0].localeCompare(right.ports[0], undefined, { numeric: true }));
    return { sessions: sessionRows, processes: rows, scannedAt: Date.now() };
}
async function stop(ctx, raw) {
    const input = raw && typeof raw === 'object' ? raw : undefined;
    if (!input || typeof input !== 'object' || typeof input.sessionId !== 'string' && input.kind !== 'process')
        throw new Error('Ungültiges Ziel');
    const { kind, id } = input;
    const sessionId = input.sessionId;
    if (kind === 'job') {
        if (typeof id !== 'string' || !ctx.get('jobs')?.list(sessionId).some(job => job.owner === sessionId && job.id === id && job.status === 'running'))
            throw new Error('Job ist nicht mehr aktiv');
        return ctx.get('jobs').kill(id, sessionId, 'Beendet im Task-Manager');
    }
    if (kind === 'terminal' || kind === 'browser-terminal') {
        const agent = ctx.agents.get(sessionId);
        if (!agent || typeof id !== 'string')
            throw new Error('Session ist nicht mehr aktiv');
        if (kind === 'terminal') {
            if (!ctx.get('terminals')?.list(agent).some(terminal => terminal.sessionId === id && terminal.status.kind === 'running'))
                throw new Error('Terminal ist nicht mehr aktiv');
            await ctx.get('terminals').kill(agent, id, 'Beendet im Task-Manager');
        }
        else {
            if (!ctx.get('terminalController')?.list(sessionId).some(terminal => terminal.id === id && terminal.state === 'running'))
                throw new Error('Terminal ist nicht mehr aktiv');
            await ctx.get('terminalController').close(agent, id);
        }
        return 'Beendet';
    }
    if (kind === 'turn') {
        const agent = ctx.agents.get(sessionId);
        if (!agent || agent.status !== 'running')
            throw new Error('Turn ist nicht mehr aktiv');
        ctx.sessionController.cancel({ sessionId });
        return 'Abbruch angefordert';
    }
    if (kind === 'process') {
        const pid = input.pid;
        if (typeof pid !== 'number' || !Number.isSafeInteger(pid) || pid <= 4 || typeof input.started !== 'string' || !/^\d{15,20}$/.test(input.started))
            throw new Error('Ungültige Prozessidentität');
        const scan = await scanWindows();
        const byPid = new Map(scan.processes.map(process => [process.pid, process]));
        const process = byPid.get(pid);
        if (process?.started !== input.started || protectedProcess(process, byPid) || !scan.listeners.some(listener => listener.pid === pid))
            throw new Error('Prozess ist nicht mehr sicher auswählbar');
        const terminals = ctx.get('terminals');
        for (const agent of ctx.agents.list()) {
            const terminal = terminals?.list(agent).find(entry => entry.pid === pid && entry.status.kind === 'running');
            if (terminal) {
                await terminals.kill(agent, terminal.sessionId, 'Beendet im Task-Manager');
                return 'Beendet';
            }
        }
        await run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', KILL.replace('__PID__', String(pid)).replace('__STARTED__', input.started)], {
            windowsHide: true, timeout: 12000, maxBuffer: 64 * 1024,
        });
        return 'Beendet';
    }
    throw new Error('Unbekannte Aktion');
}
export function apply(ctx) {
    ctx.effect(() => ctx.connection.fetch.register({
        path: ROUTE, methods: ['GET', 'POST'], requestBody: 'buffered',
        async fetch(request) {
            try {
                if (request.method === 'POST') {
                    const admission = ctx.connection.admit(request);
                    if ('rejection' in admission)
                        return Response.json({ error: 'Betreiberzugriff erforderlich' }, { status: admission.rejection });
                    if (admission.peer.id !== ctx.connection.operator.id)
                        return Response.json({ error: 'Betreiberzugriff erforderlich' }, { status: 403 });
                    const value = await request.json();
                    const input = value && typeof value === 'object' ? value : undefined;
                    if (['gateway-stop', 'gateway-extend', 'gateway-logs', 'gateway-prune'].includes(typeof input?.kind === 'string' ? input.kind : '')) {
                        const gateways = ctx.get('devGateways');
                        if (!gateways)
                            return Response.json({ error: 'Dev-Gateway-Dienst nicht verfügbar' }, { status: 503 });
                        if (!input || typeof input.id !== 'string' || !input.id.trim())
                            throw new Error('Ungültige Gateway-ID');
                        const operator = { operator: true };
                        let result;
                        if (input.kind === 'gateway-stop')
                            result = await gateways.stop(input.id, operator);
                        if (input.kind === 'gateway-prune')
                            result = await gateways.prune(input.id, operator);
                        if (input.kind === 'gateway-extend') {
                            if (typeof input.minutes !== 'number' || !Number.isSafeInteger(input.minutes) || input.minutes <= 0 || input.minutes > 480)
                                throw new Error('Ungültige Verlängerung');
                            result = await gateways.extend(input.id, input.minutes, operator);
                        }
                        if (input.kind === 'gateway-logs') {
                            if (typeof input.from !== 'number' || !Number.isSafeInteger(input.from) || input.from < 0)
                                throw new Error('Ungültiger Log-Cursor');
                            result = await gateways.logs(input.id, input.from, operator);
                        }
                        return Response.json({ result }, { headers: { 'cache-control': 'no-store' } });
                    }
                    return Response.json({ result: await stop(ctx, input) }, { headers: { 'cache-control': 'no-store' } });
                }
                const sessions = [...(await ctx.sessionController.list({}, request.signal)).items];
                const visible = new Set(sessions.map(session => session.sessionId));
                for (const agent of ctx.agents.list())
                    if (!visible.has(agent.id))
                        sessions.push({
                            sessionId: agent.id, cwd: agent.session.header.cwd, running: agent.status === 'running',
                        });
                const jobs = ctx.get('jobs');
                const rootPids = jobs ? sessions.flatMap(session => jobs.list(session.sessionId)
                    .filter(job => job.owner === session.sessionId && ['running', 'stopping'].includes(job.status))
                    .map(job => job.processRoot?.pid).filter((pid) => typeof pid === 'number' && Number.isSafeInteger(pid) && pid > 0)) : [];
                let scan = { processes: [], listeners: [] }, scanError = null;
                try {
                    scan = await scanWindows(rootPids);
                }
                catch (error) {
                    scanError = error instanceof Error ? error.message : String(error);
                }
                let gateways = [], gatewayError = null;
                const service = ctx.get('devGateways');
                try {
                    if (service)
                        gateways = await service.list({ operator: true });
                    if (!Array.isArray(gateways))
                        throw new Error('Ungültiges Gateway-Inventar');
                }
                catch (error) {
                    gateways = [];
                    gatewayError = error instanceof Error ? error.message : String(error);
                }
                return Response.json({ ...inventory(ctx, sessions, scan), scanError, gateways, gatewayError, gatewayEnabled: !!service }, { headers: { 'cache-control': 'no-store' } });
            }
            catch (error) {
                return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
            }
        },
    }));
}
