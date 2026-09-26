import * as service from '../services/SubjectService.js'
import * as classHourService from '../services/ClassHourService.js'
import { projectOf } from './ProjectRoomSocket.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateSubject', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      await service.update(projectId, obj.id, obj.subject);
      obj.subject = await service.getById(projectId, obj.id);
      io.emit('updateSubject', obj);
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  });

  socket.on('sendCreateSubject', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      obj.subject = await service.create(projectId, obj.subject);
      obj.subject = await service.getById(projectId, obj.subject._id);
      io.emit('createSubject', obj);
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  });

  socket.on('sendDeleteSubject', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      if (await classHourService.isSubjectUsed(projectId, obj.id)) {
        return io.emit('deleteSubject', { error: 'Subject cannot be deleted because it is used' });
      }

      await service.deleteById(projectId, obj.id);
      io.emit('deleteSubject', obj);
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  });
};

export default handleEvents