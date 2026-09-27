import * as service from '../services/UserService.js'
import * as auth0Service from '../services/Auth0Service.js'
import * as projectService from '../services/ProjectService.js'

const handleEvents = (socket, io) => {
  socket.on('sendSyncUser', async (obj) => {
    try {
      // Ask Auth0 for the authoritative profile; the client payload is only a
      // hint and must not decide which invitations a user can claim.
      const userInfo = await auth0Service.fetchUserInfo(socket.data.rawToken);
      const verifiedEmail = auth0Service.getVerifiedEmail(userInfo);

      // The identifier comes from the verified handshake token, never from the
      // client payload -- otherwise a client could claim to be any user.
      const user = await service.syncUser({
        ...obj.user,
        email: verifiedEmail ?? obj.user?.email,
        auth0Id: socket.data.auth0Id
      });

      if (verifiedEmail) {
        const bound = await projectService.bindPendingInvitations(user._id, verifiedEmail);

        // Invitations sent before this person had an account only become
        // visible now, so the badge needs to refresh.
        if (bound > 0) {
          socket.emit('invitationsChanged', { reason: 'bound' });
        }
      }

      // The client needs its own Mongo _id to own or join projects.
      socket.emit('syncUserDone', user);
    } catch (error) {
      console.error('Error syncing user:', error);
      socket.emit('syncUserFailed', { message: 'Could not sync user' });
    }
  });
}

export default handleEvents
