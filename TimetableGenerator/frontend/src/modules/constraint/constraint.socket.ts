import type { ConstraintData } from './constraint.type';
import { socket } from '@/modules/app/app.socket'
import { listen } from '@/modules/app/socket.listeners'

export const setupConstraintSocketListeners = (
  hardConstraints: Ref<ConstraintData[]>,
  softConstraints: Ref<ConstraintData[]>
) => {
  return listen({
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

export const emitUpdateConstraint = (constraintData: Partial<ConstraintData>) => {
  socket.emit('sendUpdateConstraint', { constraint: constraintData });
};
