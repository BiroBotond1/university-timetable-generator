import { createRemoteJWKSet, jwtVerify } from 'jose'
import * as userService from '../services/UserService.js'

let jwks = null

/**
 * Built lazily rather than at module scope: this module is imported through the
 * socket wiring before `dotenv/config` has run, so the environment is not
 * populated yet at evaluation time.
 */
const getJwks = () => {
  if (!jwks) {
    // Auth0 publishes its signing keys here; jose caches and rotates them.
    jwks = createRemoteJWKSet(
      new URL(`${process.env.ISSUER_BASE_URL}.well-known/jwks.json`)
    )
  }

  return jwks
}

/**
 * Socket.IO handshake authentication.
 *
 * The HTTP API is guarded by express-oauth2-jwt-bearer, but every mutation in
 * this application travels over Socket.IO, so the socket needs the same gate.
 * The verified subject is placed on `socket.data.auth0Id` and is the only
 * trustworthy identity for a connection -- handlers must never take an
 * identifier from the client payload.
 */
export const socketAuth = async (socket, next) => {
  const token = socket.handshake.auth?.token

  if (!token) {
    return next(new Error('unauthorized: no token supplied'))
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: process.env.ISSUER_BASE_URL,
      audience: process.env.AUDIENCE
    })

    socket.data.auth0Id = payload.sub
    socket.data.token = payload
    // Kept so the sync handler can ask Auth0 for a *verified* email; the
    // client-supplied one cannot be trusted to bind invitations.
    socket.data.rawToken = token

    // Resolved once per connection so project membership checks do not have to
    // look the user up on every event.
    const user = await userService.getOrCreateByAuth0Id(payload.sub)
    socket.data.userId = user._id

    return next()
  } catch (error) {
    console.error('Socket authentication failed:', error.message)
    return next(new Error('unauthorized: invalid token'))
  }
}

export default socketAuth
