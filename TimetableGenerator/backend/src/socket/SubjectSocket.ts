import * as service from '../services/SubjectService.js'
import * as classHourService from '../services/ClassHourService.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateSubject', async (obj) => {
    try {
      await service.update(obj.id, obj.subject);
      obj.subject = await service.getById(obj.id);
      io.emit('updateSubject', obj);
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  });

  socket.on('sendCreateSubject', async (obj) => {
    try {
      obj.subject = await service.create(obj.subject);
      obj.subject = await service.getById(obj.subject._id);
      io.emit('createSubject', obj);
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  });

  socket.on('sendDeleteSubject', async (obj) => {
    try {
      if (await classHourService.isSubjectUsed(obj.id)) {
        return io.emit('deleteSubject', { error: 'Subject cannot be deleted because it is used' });
      }

      await service.deleteById(obj.id);
      io.emit('deleteSubject', obj);
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  });
};

export default handleEvents