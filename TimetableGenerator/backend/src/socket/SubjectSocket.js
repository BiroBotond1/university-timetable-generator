const subjectService = require('../services/SubjectService.js');
const classHourService = require('../services/ClassHourService.js');

const handleSubjectEvents = (socket, io) => {
  socket.on('sendUpdateSubject', async (obj) => {
    try {
      await subjectService.updateSubject(obj.id, obj.subject);
      obj.subject = await subjectService.getSubjectById(obj.id);
      io.emit('updateSubject', obj);
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  });

  socket.on('sendCreateSubject', async (obj) => {
    try {
      obj.subject = await subjectService.createSubject(obj.subject);
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

      await subjectService.deleteSubject(obj.id);
      io.emit('deleteSubject', obj);
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  });
};

module.exports = {
  handleSubjectEvents
};
