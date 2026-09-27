import { listen } from '@/modules/app/socket.listeners'

export interface ProjectClosedEvent {
  projectId: string,
  reason: 'removed' | 'left' | 'deleted'
}

export const setupMembershipSocketListeners = (handlers: {
  onInvitationsChanged: (payload: { reason?: string }) => void,
  onProjectsChanged: () => void,
  onProjectClosed: (payload: ProjectClosedEvent) => void,
}) => listen({
  invitationsChanged: (payload) => handlers.onInvitationsChanged(payload ?? {}),
  projectsChanged: () => handlers.onProjectsChanged(),
  projectClosed: (payload) => handlers.onProjectClosed(payload),
})

// Also reloads after a reconnect: events sent while disconnected are lost.
export const setupMembersSocketListeners = (onChanged: () => void) => listen({
  membersChanged: () => onChanged(),
  connect: () => onChanged(),
})
