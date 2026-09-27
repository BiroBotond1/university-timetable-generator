import { createRemoteJWKSet, jwtVerify } from 'jose'
import * as userService from '../services/UserService.js'

let jwks = null

// Built lazily: this module loads before dotenv/config has run.
const getJwks = () => {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${process.env.ISSUER_BASE_URL}.well-known/jwks.json`)
    )
  }

  return jwks
}

// Identity comes only from the verified token (socket.data.auth0Id), never
// from anything the client sends.
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
    // Used to fetch the verified email from Auth0.
    socket.data.rawToken = token

    const user = await userService.getOrCreateByAuth0Id(payload.sub)
    socket.data.userId = user._id

    return next()
  } catch (error) {
    console.error('Socket authentication failed:', error.message)
    return next(new Error('unauthorized: invalid token'))
  }
}

export default socketAuth
