import * as service from '../services/ClassHourService.js'
import { projectOf, roomOf } from './ProjectRoomSocket.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateClassHour', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      await service.update(projectId, obj.id, obj.classHour);
      obj.classHour = await service.getById(projectId, obj.id);
      io.to(roomOf(projectId)).emit('updateClassHour', obj);
    } catch (error) {
      console.error('Error updating class hour:', error);
    }
  });

  socket.on('sendCreateClassHour', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      obj.classHour = await service.create(projectId, obj.classHour);
      obj.classHour = await service.getById(projectId, obj.classHour._id);
      io.to(roomOf(projectId)).emit('createClassHour', obj);
    } catch (error) {
      console.error('Error creating class hour:', error);
    }
  });

  socket.on('sendDeleteClassHour', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      await service.deleteById(projectId, obj.id);
      io.to(roomOf(projectId)).emit('deleteClassHour', obj);
    } catch (error) {
      console.error('Error deleting class hour:', error);
    }
  });
};

export default handleEvents