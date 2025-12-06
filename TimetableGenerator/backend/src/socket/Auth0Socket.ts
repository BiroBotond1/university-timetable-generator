import * as service from '../services/UserService.js'

const handleEvents = (socket, io) => {
  socket.on('sendSyncUser', async (obj) => {
    try {
      obj.user = await service.syncUser(obj.user);
    } catch (error) {
      console.error('Error syncing user:', error);
    }
  });
}

export default handleEvents