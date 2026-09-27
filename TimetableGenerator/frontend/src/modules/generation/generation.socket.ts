import { socket } from '@/modules/app/app.socket'
import { listen } from '@/modules/app/socket.listeners'
import type { GenerationRunData } from './generation.type'

// Each event carries the run's record. One without a record means this tab's
// state is stale, and so does a reconnect: events sent while disconnected are
// lost.
export const setupGenerationSocketListeners = (handlers: {
  onRun: (run: GenerationRunData) => void,
  onStale: () => void,
}) => {
  const onRecord = (run: GenerationRunData | null) => run ? handlers.onRun(run) : handlers.onStale()

  return listen({
    GenerationQueued: onRecord,
    GenerationStarted: onRecord,
    GenerationFinished: onRecord,
    GenerationCancelled: onRecord,
    // A run is already going for this project.
    GenerationRefused: () => handlers.onStale(),
    connect: () => handlers.onStale(),
  })
}

export const emitGenerationStarted = () => {
  socket.emit('sendGenerationStarted');
}

export const emitGenerationCancelled = () => {
  socket.emit('sendGenerationCancelled');
}
