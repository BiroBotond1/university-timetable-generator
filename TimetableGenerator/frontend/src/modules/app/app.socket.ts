import { io } from 'socket.io-client'

// The connection is not opened at import time: the server now requires a valid
// Auth0 token in the handshake, so we wait until one can be obtained.
export const socket = io('http://localhost:3000', { autoConnect: false })

/**
 * Opens the socket with a freshly minted access token. Safe to call more than
 * once -- an already-connected socket is left alone. The token is resolved on
 * every (re)connection attempt so that a reconnect after expiry gets a new one.
 */
export const connectSocket = (getToken: () => Promise<string>) => {
  socket.auth = async (cb: (data: Record<string, unknown>) => void) => {
    try {
      cb({ token: await getToken() })
    } catch (error) {
      console.error('Could not obtain an access token for the socket:', error)
      cb({})
    }
  }

  if (!socket.connected) {
    socket.connect()
  }
}

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect()
  }
}

socket.on('connect_error', (error) => {
  console.error('Socket connection failed:', error.message)
})

// Remembered so the room can be re-entered after a reconnect; the server drops
// its socket.data when the connection goes away.
let currentProjectId: string | null = null

interface JoinResult { ok: boolean, role?: string, error?: string }

/**
 * Binds this connection to a project. The server verifies membership against
 * the handshake identity, so a rejection here is authoritative.
 */
export const joinProject = (projectId: string) => {
  currentProjectId = projectId

  return new Promise<JoinResult>((resolve) => {
    socket.emit('joinProject', { projectId }, (result: JoinResult) => {
      if (!result?.ok) {
        console.error('Could not join project:', result?.error)
      }
      resolve(result ?? { ok: false })
    })
  })
}

export const leaveProject = () => {
  currentProjectId = null
  socket.emit('leaveProject')
}

socket.on('connect', () => {
  if (currentProjectId) {
    joinProject(currentProjectId)
  }
})
