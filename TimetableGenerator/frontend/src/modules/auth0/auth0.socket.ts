import type { UserData } from '@/modules/auth0/user.type';
import { socket } from '@/modules/app/app.socket'

export const emitSyncUser = (userData: Partial<UserData>) => {
  socket.emit('sendSyncUser', { user: userData });
};