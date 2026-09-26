import type { ConstraintData } from './constraint.type';
import { socket } from '@/modules/app/app.socket'
import { listen } from '@/modules/app/socket.listeners'
import { useAppStore } from '../app/app.store';

export const setupConstraintSocketListeners = (
  hardConstraints: Ref<ConstraintData[]>,
  softConstraints: Ref<ConstraintData[]>
) => {
  // Resolved here rather than at module scope: at import time Pinia may not be
  // installed yet.
  const appStore = useAppStore()

  return listen({
    GenerationStarted: () => {
      appStore.generating = true
    },

    GenerationCancelled: () => {
      appStore.generating = false
    },

    // The server refused because a run is already going -- the button was
    // showing stale state, so correct it.
    GenerationRefused: (payload) => {
      appStore.generating = true
      console.warn(payload?.message)
    },

    GenerationFinished: () => {
      appStore.generating = false
      appStore.notification = true
      setTimeout(() => appStore.notification = false, 5000);
    },

    updateConstraint: (constraintData) => {
      updateConstraints(hardConstraints, constraintData.constraint)
      updateConstraints(softConstraints, constraintData.constraint)
    },
  })
};

const updateConstraints = (constraints: Ref<ConstraintData[]>, updatedConstraint: ConstraintData) => {
  const index = constraints.value.findIndex(constraint => constraint._id === updatedConstraint._id);
  if (index !== -1) {
    constraints.value[index] = updatedConstraint;
  }
}

export const emitGenerationStarted = () => {
  socket.emit('sendGenerationStarted');
}

export const emitGenerationCancelled = () => {
  socket.emit('sendGenerationCancelled');
}

export const emitUpdateConstraint = (constraintData: Partial<ConstraintData>) => {
  socket.emit('sendUpdateConstraint', { constraint: constraintData });
};
