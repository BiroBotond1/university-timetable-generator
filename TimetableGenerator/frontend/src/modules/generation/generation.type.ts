export type GenerationRunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'interrupted'

export interface GenerationRunUser {
  _id: string,
  username?: string,
  email?: string
}

export interface GenerationRunResult {
  // Every hard constraint holds.
  active: boolean,
  fitnessClass: number,
  fitnessTeacher: number,
  fitnessLocation: number,
  // Seconds the engine spent annealing.
  elapsedTime: number
}

export interface GenerationRunData {
  _id: string,
  project: string,
  startedBy: GenerationRunUser | null,
  cancelledBy: GenerationRunUser | null,
  status: GenerationRunStatus,
  queuedAt: string,
  startedAt: string | null,
  finishedAt: string | null,
  // Written for the user; set on failed and interrupted runs.
  message: string | null,
  result: GenerationRunResult | null
}
