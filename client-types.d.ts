import type { Context } from '@deepseek-ai/cordis';
import type { ClientModuleLoaderTarget } from '@deepseek-ai/dsh-client-modules/client';
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client';
import type {} from '@deepseek-ai/dsh-client-ui-layout/client';
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client';
import type {} from '@deepseek-ai/dsh-client-locale/client';
import type {} from '@deepseek-ai/dsh-client-ui-slots';
declare global {
  interface Window { __ModuleLoader__: ClientModuleLoaderTarget }
  type TaskMasterClientContext = Pick<Context, 'effect' | 'slots' | 'locale'>;
  type TaskMasterInventory = import('./wire.js').ClientInventory;
  type TaskMasterDictionaryRegistration = (namespace: '@pascapone/dsh-task-master', dictionaries: Record<'en' | 'de', Record<import('@deepseek-ai/dsh-client-ui-slots').LocaleNamespaceMap['@pascapone/dsh-task-master'], string>>) => () => void;
  type TaskMasterTarget = import('./wire.js').StopTarget;
  type TaskMasterGatewayTarget = import('./wire.js').GatewayTarget;
  type TaskMasterGatewayAction = import('./wire.js').GatewayAction;
  type TaskMasterLogs = Omit<import('./wire.js').GatewayLogs, 'hasMore' | 'lossy'> & Partial<Pick<import('./wire.js').GatewayLogs, 'hasMore' | 'lossy'>>;
}
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { '@pascapone/dsh-task-master': "title" | "sessions" | "processes" | "refresh" | "checked" | "search" | "sessionFilters" | "processFilters" | "all" | "running" | "idle" | "inactive" | "archived" | "showArchived" | "withTasks" | "confirmed" | "suspected" | "unknown" | "job" | "terminal" | "tasks" | "stop" | "stopping" | "protected" | "stopTurn" | "emptySessions" | "emptyProcesses" | "scanError" | "loadError" | "note" | "ask" | "askOwned" | "failed" | "gateways" | "emptyGateways" | "gatewayError" | "projectServer" | "dshGateway" | "operator" | "agentOwner" | "command" | "tempData" | "onArchive" | "kept" | "manual" | "pendingCleanup" | "blockedCleanup" | "localAccess" | "refreshLogs" | "open" | "logs" | "moreLogs" | "noLogs" | "lostLogs" | "extend" | "minutes" | "expires" | "gatewayStop" | "prune" | "gatewayPrune" | "gatewayFailed" }
}
