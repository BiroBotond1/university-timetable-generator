import { roomOf, userRoomOf } from './ProjectRoomSocket.js'

let io = null

export const setIo = (instance) => {
  io = instance
}

export const toUser = (userId, event, payload = {}) => {
  if (!io || !userId) return
  io.to(userRoomOf(userId)).emit(event, payload)
}

export const toProject = (projectId, event, payload = {}) => {
  if (!io || !projectId) return
  io.to(roomOf(projectId)).emit(event, payload)
}

// Membership is only checked when a socket joins a project, so a removed member
// would keep write access on tabs they already have open. Clearing projectId
// revokes it: entity handlers refuse to act without one.
// With no userId, evicts everyone (the project was deleted).
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
