import type { ProcessScan } from './wire.js';

export function decodeScan(value: unknown): ProcessScan {
  if (!value || typeof value !== 'object') throw new Error('Ungültiger Prozessscan');
  const record = value as Record<string, unknown>;
  const processes: unknown[] = Array.isArray(record.processes) ? record.processes : [];
  const listeners: unknown[] = Array.isArray(record.listeners) ? record.listeners : [];
  for (const value of processes) {
    if (!value || typeof value !== 'object') throw new Error('Ungültiger Prozessscan');
    const row = value as Record<string, unknown>;
    if (!Number.isSafeInteger(row.pid) || !Number.isSafeInteger(row.parent)
      || !(row.started === null || typeof row.started === 'string' && /^\d*$/.test(row.started))
      || ['name', 'path', 'command'].some(key => row[key] != null && typeof row[key] !== 'string')) {
      throw new Error('Ungültige Prozessidentität im Scan');
    }
  }
  for (const value of listeners) {
    if (!value || typeof value !== 'object') throw new Error('Ungültiger Listener im Scan');
    const row = value as Record<string, unknown>;
    if (!Number.isSafeInteger(row.pid) || !Number.isSafeInteger(row.port) || typeof row.address !== 'string') {
      throw new Error('Ungültiger Listener im Scan');
    }
  }
  return { processes, listeners } as ProcessScan;
}
