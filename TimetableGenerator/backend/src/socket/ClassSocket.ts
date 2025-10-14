import * as service from '../services/ClassService.js'
import * as classHourService from '../services/ClassHourService.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateClass', async (obj) => {
    try {
      await service.update(obj.id, obj.class);
      obj.class = await service.getById(obj.id);
      io.emit('updateClass', obj);
    } catch (error) {
      console.error('Error updating class:', error);
    }
  });

  socket.on('sendCreateClass', async (obj) => {
    try {
      obj.class = await service.create(obj.class);
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

      await service.deleteById(obj.id);
      io.emit('deleteClass', obj);
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  });
};

export default handleEvents