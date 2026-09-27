import * as service from '../services/UserService.js'
import * as auth0Service from '../services/Auth0Service.js'
import * as projectService from '../services/ProjectService.js'

const handleEvents = (socket, io) => {
  socket.on('sendSyncUser', async (obj) => {
    try {
      const userInfo = await auth0Service.fetchUserInfo(socket.data.rawToken);
      const verifiedEmail = auth0Service.getVerifiedEmail(userInfo);

      // Never trust an auth0Id from the payload.
      const user = await service.syncUser({
        ...obj.user,
        email: verifiedEmail ?? obj.user?.email,
        auth0Id: socket.data.auth0Id
      });

      if (verifiedEmail) {
        const bound = await projectService.bindPendingInvitations(user._id, verifiedEmail);

        if (bound > 0) {
          socket.emit('invitationsChanged', { reason: 'bound' });
        }
      }

      socket.emit('syncUserDone', user);
    } catch (error) {
      console.error('Error syncing user:', error);
      socket.emit('syncUserFailed', { message: 'Could not sync user' });
    }
  });
}

export default handleEvents
