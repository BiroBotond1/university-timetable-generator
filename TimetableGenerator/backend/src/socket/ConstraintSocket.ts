import * as service from '../services/ConstraintService.js'
import { projectOf, roomOf } from './ProjectRoomSocket.js'

const handleEvents = async (socket, io) => {
  socket.on('sendUpdateConstraint', async (data) => {
    const projectId = projectOf(socket);
    if (!projectId) return;

    try {
      await service.update(projectId, data.constraint._id, data.constraint);
      io.to(roomOf(projectId)).emit('updateConstraint', data);
    } catch (error) {
      console.error('Error updating constraint:', error);
    }
  });
};

export default handleEvents
