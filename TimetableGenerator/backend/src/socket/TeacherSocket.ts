import * as service from '../services/TeacherService.js'
import * as classHourService from '../services/ClassHourService.js'
import { projectOf, roomOf } from './ProjectRoomSocket.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateTeacher', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      await service.update(projectId, obj.id, obj.teacher);
      obj.teacher = await service.getById(projectId, obj.id);
      io.to(roomOf(projectId)).emit('updateTeacher', obj);
    } catch (error) {
      console.error('Error updating teacher:', error);
    }
  });

  socket.on('sendCreateTeacher', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      obj.teacher = await service.create(projectId, obj.teacher);
      io.to(roomOf(projectId)).emit('createTeacher', obj);
    } catch (error) {
      console.error('Error creating teacher:', error);
    }
  });

  socket.on('sendDeleteTeacher', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      if (await classHourService.isTeacherUsed(projectId, obj.id)) {
        return socket.emit('deleteTeacher', { error: 'Teacher cannot be deleted because it is used' });
      }

      await service.deleteById(projectId, obj.id);
      io.to(roomOf(projectId)).emit('deleteTeacher', obj);
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  });
};

export default handleEvents