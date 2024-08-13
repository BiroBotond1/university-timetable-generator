const classHourService = require('../services/ClassHourService.js');

const handleClassHourEvents = (socket, io) => {
  socket.on('sendUpdateClassHour', async (obj) => {
    try {
      await classHourService.updateClassHour(obj.id, obj.classHour);
      obj.classHour = await classHourService.getClassHourById(obj.id);
      io.emit('updateClassHour', obj);
    } catch (error) {
      console.error('Error updating class hour:', error);
    }
  });

  socket.on('sendCreateClassHour', async (obj) => {
    try {
      obj.classHour = await classHourService.createClassHour(obj.classHour);
      io.emit('createClassHour', obj);
    } catch (error) {
      console.error('Error creating class hour:', error);
    }
  });

  socket.on('sendDeleteClassHour', async (obj) => {
    try {
      await classHourService.deleteClassHour(obj.id);
      io.emit('deleteClassHour', obj);
    } catch (error) {
      console.error('Error deleting class hour:', error);
    }
  });
};

module.exports = {
  handleClassHourEvents
};
