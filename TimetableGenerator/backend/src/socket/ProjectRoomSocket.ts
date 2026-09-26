import * as projectService from '../services/ProjectService.js'

/**
 * Binds a connection to one project.
 *
 * The client announces which project it is looking at; membership is verified
 * against the identity established during the handshake, never against
 * anything the client claims about itself. The resulting project id is the
 * only one the entity handlers will act on.
 *
 * The room join is what step 4 uses to stop broadcasting every mutation to
 * every connected client.
 */
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

/**
 * The project this connection is working in, or null when it has not joined
 * one. Entity handlers must refuse to act when this is null rather than
 * falling back to any kind of global scope.
 */
export const projectOf = (socket) => socket.data.projectId ?? null;

export default handleEvents
