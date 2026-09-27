import { listen } from '@/modules/app/socket.listeners'

export interface ProjectClosedEvent {
  projectId: string,
  reason: 'removed' | 'left' | 'deleted'
}

/**
 * Events about the user's own memberships, independent of which page is open.
 * Registered once for the lifetime of the app shell.
 */
export const setupMembershipSocketListeners = (handlers: {
  onInvitationsChanged: (payload: { reason?: string }) => void,
  onProjectsChanged: () => void,
  onProjectClosed: (payload: ProjectClosedEvent) => void,
}) => listen({
  invitationsChanged: (payload) => handlers.onInvitationsChanged(payload ?? {}),
  projectsChanged: () => handlers.onProjectsChanged(),
  projectClosed: (payload) => handlers.onProjectClosed(payload),
})

/**
 * The member list of the project currently open has changed.
 *
 * Also refetches after a reconnect: anything broadcast while the socket was
 * down is gone, and the list would otherwise stay stale until a page reload.
 */
export const setupMembersSocketListeners = (onChanged: () => void) => listen({
  membersChanged: () => onChanged(),
  connect: () => onChanged(),
})
