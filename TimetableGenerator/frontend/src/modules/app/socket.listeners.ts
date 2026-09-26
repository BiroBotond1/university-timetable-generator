import { socket } from './app.socket'

type Handler = (...args: any[]) => void

/**
 * Registers socket listeners and hands back a teardown function.
 *
 * Listeners used to be attached in onMounted and never removed, so they piled
 * up on every navigation and kept firing for a project the user had left. The
 * teardown makes that hard to forget: there is no way to register without
 * getting one back.
 */
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
