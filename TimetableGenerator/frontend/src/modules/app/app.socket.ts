import { io } from 'socket.io-client'

// Not opened at import time: the handshake needs an Auth0 token.
export const socket = io('http://localhost:3000', { autoConnect: false })

// The token is fetched on every (re)connect, so a reconnect after expiry gets a
// fresh one.
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

// Re-joined after a reconnect; the server forgets it when a connection drops.
let currentProjectId: string | null = null

interface JoinResult { ok: boolean, role?: string, error?: string }

export const joinProject = (projectId: string) => {
  currentProjectId = projectId

  return new Promise<JoinResult>((resolve) => {
    // Buffered until connected; time out rather than hang a navigation.
    const timer = setTimeout(
      () => resolve({ ok: false, error: 'Timed out joining the project' }),
      10000
    )

    socket.emit('joinProject', { projectId }, (result: JoinResult) => {
      clearTimeout(timer)

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
