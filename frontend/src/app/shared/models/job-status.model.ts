export interface JobStatus {
  id: number;
  jobName: string;
  startedAt: string;
  completedAt: string | null;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'QUEUED';
  message: string | null;
  rowsProcessed: number | null;
  rowsFailed: number | null;
}
