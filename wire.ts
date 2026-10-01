import type { DevGateways, GatewayPublic } from '@pascapone/dsh-dev-gateways';

export interface OsProcess {
  pid: number; parent: number; started: string | null;
  name?: string | null; path?: string | null; command?: string | null;
}
export interface ProcessScan {
  processes: OsProcess[];
  listeners: { pid: number; address: string; port: number }[];
}
export interface SessionRow {
  id: string; running: boolean; available: boolean; archived: boolean; workspace: string | null;
  jobs: { id: string; label: string; status: string }[];
  terminals: { id: string; label: string; source: 'terminal' | 'browser-terminal'; pid: number | null }[];
}
export interface ProcessRow {
  pid: number; started: string; name?: string | null; ports: string[];
  confidence: 'confirmed' | 'suspected' | 'unknown'; protected: boolean;
  sessionId: string | null; workspace: string | null; jobId: string | null; jobStatus: string | null;
}
export interface Inventory {
  sessions: SessionRow[]; processes: ProcessRow[]; scannedAt: number;
  scanError: string | null; gateways: GatewayPublic[]; gatewayError: string | null; gatewayEnabled: boolean;
}
// The Client also accepts legacy inventories lacking optional gateway/ownership fields.
export type ClientGateway = Pick<GatewayPublic, 'id'> & Partial<Pick<GatewayPublic,
  'label' | 'kind' | 'workspace' | 'bundles' | 'ownerKind' | 'ownerSessionId' | 'url' |
  'retainData' | 'startCommand' | 'dataDir' | 'cleanupPending' | 'cleanupOnArchive' | 'cleanupError' | 'reason'>> & {
    status: string; expiresAt?: number | null;
  };
export type ClientInventory = Pick<Inventory, 'scannedAt'> & {
  sessions: (Omit<SessionRow, 'workspace'> & { workspace?: string | null })[];
  processes: (Omit<ProcessRow, 'sessionId' | 'workspace' | 'jobId' | 'jobStatus'> & Partial<Pick<ProcessRow, 'sessionId' | 'workspace' | 'jobId' | 'jobStatus'>>)[];
  gateways?: ClientGateway[] | null; gatewayEnabled?: boolean;
  scanError?: string | null; gatewayError?: string | null;
};
export type StopTarget =
  | { kind: 'turn'; sessionId: string }
  | { kind: 'job' | 'terminal' | 'browser-terminal'; sessionId: string; id: string }
  | { kind: 'process'; pid: number; started: string };
export type GatewayAction = 'gateway-stop' | 'gateway-extend' | 'gateway-logs' | 'gateway-prune';
export type GatewayLogs = ReturnType<DevGateways['logs']>;
export type GatewayTarget = { kind: GatewayAction; id: string; minutes?: number; from?: number };
