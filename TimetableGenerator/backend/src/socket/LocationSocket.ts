import * as service from '../services/LocationService.js'
import * as subjectService from '../services/SubjectService.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateLocation', async (obj) => {
    try {
      await service.update(obj.id, obj.location);
      obj.location = await service.getById(obj.id);
      io.emit('updateLocation', obj);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  });

  socket.on('sendCreateLocation', async (obj) => {
    try {
      obj.location = await service.create(obj.location);
      io.emit('createLocation', obj);
    } catch (error) {
      console.error('Error creating location:', error);
    }
  });

  socket.on('sendDeleteLocation', async (obj) => {
    try {
      if (await subjectService.isLocationUsed(obj.id)) {
        return io.emit('deleteLocation', { error: 'Location cannot be deleted because it is used' });
      }

      await service.deleteById(obj.id);
      io.emit('deleteLocation', obj);
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  });
};

export default handleEvents