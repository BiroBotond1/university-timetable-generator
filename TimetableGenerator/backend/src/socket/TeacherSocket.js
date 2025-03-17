const teacherService = require('../services/TeacherService.js');
const classHourService = require('../services/ClassHourService.js');

const handleTeacherEvents = (socket, io) => {
  socket.on('sendUpdateTeacher', async (obj) => {
    try {
      await teacherService.updateTeacher(obj.id, obj.teacher);
      obj.teacher = await teacherService.getTeacherById(obj.id);
      io.emit('updateTeacher', obj);
    } catch (error) {
      console.error('Error updating teacher:', error);
    }
  });

  socket.on('sendCreateTeacher', async (obj) => {
    try {
      obj.teacher = await teacherService.createTeacher(obj.teacher);
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

      await teacherService.deleteTeacher(obj.id);
      io.emit('deleteTeacher', obj);
    } catch (error) {
      console.error('Error deleting teacher:', error);
    }
  });
};

module.exports = {
  handleTeacherEvents
};
