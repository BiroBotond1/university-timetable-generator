import * as service from '../services/LocationService.js'
import * as subjectService from '../services/SubjectService.js'
import { projectOf } from './ProjectRoomSocket.js'

const handleEvents = (socket, io) => {
  socket.on('sendUpdateLocation', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      await service.update(projectId, obj.id, obj.location);
      obj.location = await service.getById(projectId, obj.id);
      io.emit('updateLocation', obj);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  });

  socket.on('sendCreateLocation', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      obj.location = await service.create(projectId, obj.location);
      io.emit('createLocation', obj);
    } catch (error) {
      console.error('Error creating location:', error);
    }
  });

  socket.on('sendDeleteLocation', async (obj) => {
    try {
      const projectId = projectOf(socket);
      if (!projectId) return;

      if (await subjectService.isLocationUsed(projectId, obj.id)) {
        return io.emit('deleteLocation', { error: 'Location cannot be deleted because it is used' });
      }

      await service.deleteById(projectId, obj.id);
      io.emit('deleteLocation', obj);
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  });
};

export default handleEvents