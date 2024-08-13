const locationService = require('../services/LocationService.js');
const subjectService = require('../services/SubjectService.js');

const handleLocationEvents = (socket, io) => {
  socket.on('sendUpdateLocation', async (obj) => {
    try {
      await locationService.updateLocation(obj.id, obj.location);
      obj.location = await locationService.getLocationById(obj.id);
      io.emit('updateLocation', obj);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  });

  socket.on('sendCreateLocation', async (obj) => {
    try {
      obj.location = await locationService.createLocation(obj.location);
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

      await locationService.deleteLocation(obj.id);
      io.emit('deleteLocation', obj);
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  });
};

module.exports = {
  handleLocationEvents
};
