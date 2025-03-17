const classService = require('../services/ClassService.js');
const classHourService = require('../services/ClassHourService.js');

const handleClassEvents = (socket, io) => {
  socket.on('sendUpdateClass', async (obj) => {
    try {
      await classService.updateClass(obj.id, obj.class);
      obj.class = await classService.getClassById(obj.id);
      io.emit('updateClass', obj);
    } catch (error) {
      console.error('Error updating class:', error);
    }
  });

  socket.on('sendCreateClass', async (obj) => {
    try {
      obj.class = await classService.createClass(obj.class);
      io.emit('createClass', obj);
    } catch (error) {
      console.error('Error creating class:', error);
    }
  });

  socket.on('sendDeleteClass', async (obj) => {
    try {
      if (await classHourService.isClassUsed(obj.id)) {
        return io.emit('deleteClass', { error: 'Class cannot be deleted because it is used' });
      }

      await classService.deleteClass(obj.id);
      io.emit('deleteClass', obj);
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  });
};

module.exports = {
  handleClassEvents
};
