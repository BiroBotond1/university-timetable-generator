import { roomOf, userRoomOf } from './ProjectRoomSocket.js'

/**
 * Lets code outside the socket handlers -- chiefly the REST project
 * controller -- push events to connected clients.
 *
 * Membership changes arrive over REST, but the people affected are sitting on
 * sockets: an invitee who should see the invitation appear, collaborators
 * whose member list is now stale, a removed member who must lose access.
 */
let io = null

export const setIo = (instance) => {
  io = instance
}

/** Every open tab of one user, whichever project (if any) it is in. */
export const toUser = (userId, event, payload = {}) => {
  if (!io || !userId) return
  io.to(userRoomOf(userId)).emit(event, payload)
}

/** Everyone currently working in the project. */
export const toProject = (projectId, event, payload = {}) => {
  if (!io || !projectId) return
  io.to(roomOf(projectId)).emit(event, payload)
}

/**
 * Takes sockets out of a project and tells them why.
 *
 * Membership is verified when a socket joins a project, not on every event, so
 * without this a removed collaborator would keep write access on any tab they
 * already had open -- as would every member of a deleted project. Clearing
 * `socket.data.projectId` is what actually revokes it: every entity handler
 * refuses to act without one.
 *
 * With no userId, evicts everyone (the project was deleted).
 */
export const evictFromProject = (projectId, userId = null, reason = 'removed') => {
  if (!io) return 0

  let evicted = 0

  for (const socket of io.of('/').sockets.values()) {
    if (String(socket.data.projectId) !== String(projectId)) continue
    if (userId && String(socket.data.userId) !== String(userId)) continue

    socket.leave(roomOf(projectId))
    socket.data.projectId = null
    socket.data.projectRole = null
    socket.emit('projectClosed', { projectId: String(projectId), reason })

    evicted += 1
  }

  return evicted
}
