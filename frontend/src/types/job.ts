export type JobStatus = 'queued' | 'running' | 'done' | 'failed'

export interface Job {
  id: string
  user_id: string
  target_id: string
  status: JobStatus
  tools_used: string[]
  created_at: string
  started_at: string | null
  finished_at: string | null
}

export interface CreateJobPayload {
  target_id: string
  tools_used: string[]
}
