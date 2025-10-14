import * as service from '../services/TeacherService.js'
import * as classHourService from '../services/ClassHourService.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateTeacher', async (obj) => {
    try {
      await service.update(obj.id, obj.teacher);
      obj.teacher = await service.getById(obj.id);
      io.emit('updateTeacher', obj);
    } catch (error) {
      console.error('Error updating teacher:', error);
    }
  });

  socket.on('sendCreateTeacher', async (obj) => {
    try {
      obj.teacher = await service.create(obj.teacher);
      io.emit('createTeacher', obj);
    } catch (error) {
      console.error('Error creating teacher:', error);
    }
  });

  socket.on('sendDeleteTeacher', async (obj) => {
    try {
      if (await classHourService.isTeacherUsed(obj.id)) {
        return io.emit('deleteTeacher', { error: 'Teacher cannot be deleted because it is used' });
      }

      await service.deleteById(obj.id);
      io.emit('deleteTeacher', obj);
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  });
};

export default handleEvents