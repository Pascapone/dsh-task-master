import type { Context } from '@deepseek-ai/cordis';
import type {} from '@deepseek-ai/dsh-agent';
import type {} from '@deepseek-ai/dsh-api-session-controller';
import type {} from '@deepseek-ai/dsh-api-terminal-controller';
import type {} from '@deepseek-ai/dsh-terminal';
import type {} from '@deepseek-ai/dsh-jobs';
import type {} from '@deepseek-ai/dsh-client-connection';
import type {} from '@deepseek-ai/dsh-workspace';
import type {} from '@pascapone/dsh-dev-gateways';
import type { SessionId } from '@deepseek-ai/dsh-session';

// Optional Development extension, verified in packages/jobs/jobs/src/view.ts.
// Published rc.2 omits it; its absence must never imply process ownership.
declare module '@deepseek-ai/dsh-jobs/view' {
  interface JobView { readonly processRoot?: { readonly pid: number; readonly started: string } }
}
export type SessionSource = Pick<Awaited<ReturnType<Context['sessionController']['list']>>['items'][number], 'sessionId' | 'cwd' | 'running'>;
export type InventoryContext = Pick<Context, 'workspaceRegistry' | 'agents' | 'get'>;
export type JobOwner = { pid: number; started: string; sessionId: SessionId; jobId: string; status: string };
