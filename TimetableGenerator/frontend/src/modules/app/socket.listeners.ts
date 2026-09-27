import { socket } from './app.socket'

type Handler = (...args: any[]) => void

// Registers listeners and returns a function that removes them.
export const listen = (handlers: Record<string, Handler>) => {
  const entries = Object.entries(handlers)

  for (const [event, handler] of entries) {
    socket.on(event, handler)
  }

  return () => {
    for (const [event, handler] of entries) {
      socket.off(event, handler)
    }
  }
}
