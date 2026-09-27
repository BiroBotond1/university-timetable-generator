import * as projectService from '../services/ProjectService.js'

// Binds a connection to one project, after checking membership against the
// handshake identity rather than anything the client sends.
const handleEvents = (socket, io) => {
  socket.on('joinProject', async (obj, ack) => {
    try {
      const user = await projectService.getMembership(
        obj?.projectId,
        socket.data.userId
      );

      if (!user) {
        socket.data.projectId = null;
        return ack?.({ ok: false, error: 'Not a member of this project' });
      }

      if (socket.data.projectId) {
        socket.leave(roomOf(socket.data.projectId));
      }

      socket.data.projectId = obj.projectId;
      socket.data.projectRole = user.role;
      socket.join(roomOf(obj.projectId));

      return ack?.({ ok: true, role: user.role });
    } catch (error) {
      console.error('Error joining project:', error);
      return ack?.({ ok: false, error: 'Could not join project' });
    }
  });

  socket.on('leaveProject', () => {
    if (socket.data.projectId) {
      socket.leave(roomOf(socket.data.projectId));
    }

    socket.data.projectId = null;
    socket.data.projectRole = null;
  });
};

export const roomOf = (projectId) => `project:${projectId}`;

// Joined on connect, so invitations reach users who aren't in any project yet.
export const userRoomOf = (userId) => `user:${String(userId)}`;

// Handlers must do nothing when this returns null.
export const projectOf = (socket) => socket.data.projectId ?? null;

export default handleEvents
