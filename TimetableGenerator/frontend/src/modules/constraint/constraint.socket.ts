import type { ConstraintData } from './constraint.type';
import { socket } from '@/modules/app/app.socket'
import { useAppStore } from '../app/app.store';

const appStore = useAppStore()

export const setupConstraintSocketListeners = (
  hardConstraints: Ref<ConstraintData[]>,
  softConstraints: Ref<ConstraintData[]>
) => {
  socket.on('GenerationStarted', async () => {
    appStore.generating = true
  })

  socket.on('GenerationCancelled', async () => {
    appStore.generating = false
  })

  socket.on('GenerationFinished', async () => {
    appStore.generating = false
    appStore.notification = true
    setTimeout(() => appStore.notification = false, 5000);
  })

  socket.on('updateConstraint', async (constraintData) => {
    updateConstraints(hardConstraints, constraintData.constraint)
    updateConstraints(softConstraints, constraintData.constraint)
  })
};

const updateConstraints = async (constraints: Ref<ConstraintData[]>, updatedConstraint: ConstraintData) => {
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