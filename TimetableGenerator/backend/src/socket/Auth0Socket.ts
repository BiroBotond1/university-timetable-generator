import * as service from '../services/UserService.js'

const handleEvents = (socket, io) => {
  socket.on('sendSyncUser', async (obj) => {
    try {
      // The identifier comes from the verified handshake token, never from the
      // client payload -- otherwise a client could claim to be any user.
      const user = await service.syncUser({
        ...obj.user,
        auth0Id: socket.data.auth0Id
      });

      // The client needs its own Mongo _id to own or join projects.
      socket.emit('syncUserDone', user);
    } catch (error) {
      console.error('Error syncing user:', error);
      socket.emit('syncUserFailed', { message: 'Could not sync user' });
    }
  });
}

export default handleEvents
