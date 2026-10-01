import type { Context } from '@deepseek-ai/cordis';
import type { SessionId } from '@deepseek-ai/dsh-session';
declare module '@deepseek-ai/dsh-jobs/view' {
    interface JobView {
        readonly processRoot?: {
            readonly pid: number;
            readonly started: string;
        };
    }
}
export type SessionSource = Pick<Awaited<ReturnType<Context['sessionController']['list']>>['items'][number], 'sessionId' | 'cwd' | 'running'>;
export type InventoryContext = Pick<Context, 'workspaceRegistry' | 'agents' | 'get'>;
export type JobOwner = {
    pid: number;
    started: string;
    sessionId: SessionId;
    jobId: string;
    status: string;
};
