import type { UserData, SyncedUser } from '@/modules/auth0/user.type';
import { socket } from '@/modules/app/app.socket'

export const emitSyncUser = (userData: Partial<UserData>) => {
  socket.emit('sendSyncUser', { user: userData });
};

export const setupUserSocketListeners = (
  onSynced: (user: SyncedUser) => void
) => {
  const handleSynced = (user: SyncedUser) => onSynced(user)
  const handleFailed = (error: { message: string }) =>
    console.error('User sync failed:', error.message)

  socket.on('syncUserDone', handleSynced);
  socket.on('syncUserFailed', handleFailed);

  return () => {
    socket.off('syncUserDone', handleSynced);
    socket.off('syncUserFailed', handleFailed);
  }
};
