import * as service from '../services/ClassService.js'
import * as classHourService from '../services/ClassHourService.js'
import { projectOf, roomOf } from './ProjectRoomSocket.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateClass', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      await service.update(projectId, obj.id, obj.class);
      obj.class = await service.getById(projectId, obj.id);
      io.to(roomOf(projectId)).emit('updateClass', obj);
    } catch (error) {
      console.error('Error updating class:', error);
    }
  });

  socket.on('sendCreateClass', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      obj.class = await service.create(projectId, obj.class);
      io.to(roomOf(projectId)).emit('createClass', obj);
    } catch (error) {
      console.error('Error creating class:', error);
    }
  });

  socket.on('sendDeleteClass', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      if (await classHourService.isClassUsed(projectId, obj.id)) {
        return socket.emit('deleteClass', { error: 'Class cannot be deleted because it is used' });
      }

      await service.deleteById(projectId, obj.id);
      io.to(roomOf(projectId)).emit('deleteClass', obj);
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  });
};

export default handleEvents