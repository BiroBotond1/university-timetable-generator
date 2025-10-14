import * as service from '../services/ClassHourService.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateClassHour', async (obj) => {
    try {
      await service.update(obj.id, obj.classHour);
      obj.classHour = await service.getById(obj.id);
      io.emit('updateClassHour', obj);
    } catch (error) {
      console.error('Error updating class hour:', error);
    }
  });

  socket.on('sendCreateClassHour', async (obj) => {
    try {
      obj.classHour = await service.create(obj.classHour);
      io.emit('createClassHour', obj);
    } catch (error) {
      console.error('Error creating class hour:', error);
    }
  });

  socket.on('sendDeleteClassHour', async (obj) => {
    try {
      await service.deleteById(obj.id);
      io.emit('deleteClassHour', obj);
    } catch (error) {
      console.error('Error deleting class hour:', error);
    }
  });
};

export default handleEvents