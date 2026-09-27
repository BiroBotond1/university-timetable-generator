import type { GenerationRunData, GenerationRunUser } from './generation.type'

export interface OutcomeLook {
  label: string,
  color: string,
  icon: string
}

export const outcomeOf = (run: GenerationRunData): OutcomeLook => {
  switch (run.status) {
    case 'queued': return { label: 'Queued', color: 'info', icon: 'mdi-timer-sand' }
    case 'running': return { label: 'Running', color: 'info', icon: 'mdi-progress-clock' }
    case 'succeeded':
      return run.result?.active === false
        ? { label: 'Hard constraints not met', color: 'warning', icon: 'mdi-alert' }
        : { label: 'Succeeded', color: 'success', icon: 'mdi-check-circle' }
    case 'failed': return { label: 'Failed', color: 'error', icon: 'mdi-alert-circle' }
    case 'cancelled': return { label: 'Cancelled', color: 'grey', icon: 'mdi-cancel' }
    case 'interrupted': return { label: 'Interrupted', color: 'grey', icon: 'mdi-power-plug-off' }
  }
}

// populate() gives null for a user who no longer exists.
export const personName = (user: GenerationRunUser | null) =>
  user?.username || user?.email || 'a former member'

const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

export const formatTime = (iso: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return isToday(date) ? time : `${date.toLocaleDateString()} ${time}`
}

export const formatDuration = (fromIso: string | null, toIso: string | null) => {
  if (!fromIso || !toIso) return ''
  const seconds = Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 1000))
  if (seconds < 60) return `${seconds} s`
  const minutes = Math.floor(seconds / 60)
  return seconds % 60 ? `${minutes} min ${seconds % 60} s` : `${minutes} min`
}

// How long it took from the user's point of view: a run cancelled in the
// queue never started.
export const durationOf = (run: GenerationRunData) =>
  formatDuration(run.startedAt ?? run.queuedAt, run.finishedAt)
