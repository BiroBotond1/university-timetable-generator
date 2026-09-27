import { after, afterEach, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'http'
import { Server } from 'socket.io'
import { io as createClient, type Socket } from 'socket.io-client'

import { connectTestDb, disconnectTestDb, resetTestDb } from './helpers/db.js'
import { makeProject, makeUser } from './helpers/fixtures.js'
import handleProjectRoomEvents from '../src/socket/ProjectRoomSocket.js'
import handleTeacherEvents from '../src/socket/TeacherSocket.js'
import * as projectService from '../src/services/ProjectService.js'

const PORT = 4599

/**
 * The real socket handlers on a real server. Only the handshake is stubbed:
 * socketAuth verifies a token against Auth0, which a test cannot mint, so the
 * identity it would establish is injected directly. Everything downstream --
 * membership checks, room joins, broadcasts -- is the production code.
 */
const startServer = async () => {
  const httpServer = http.createServer()
  const io = new Server(httpServer, { cors: { origin: '*' } })

  io.use((socket, next) => {
    socket.data.userId = socket.handshake.auth.userId
    next()
  })

  io.on('connection', (socket) => {
    handleProjectRoomEvents(socket, io)
    handleTeacherEvents(socket, io)
  })

  await new Promise<void>(resolve => httpServer.listen(PORT, resolve))

  return {
    stop: () => new Promise<void>(resolve => {
      io.close()
      httpServer.close(() => resolve())
    }),
  }
}

const connect = (userId: string) => new Promise<Socket>((resolve) => {
  const socket = createClient(`http://localhost:${PORT}`, {
    auth: { userId },
    reconnection: false,
  })
  socket.on('connect', () => resolve(socket))
})

const join = (socket: Socket, projectId: string) =>
  new Promise<{ ok: boolean, role?: string, error?: string }>(resolve =>
    socket.emit('joinProject', { projectId }, resolve))

/** Give the server a moment to process an emit and broadcast the result. */
const settle = () => new Promise(resolve => setTimeout(resolve, 250))

let server: Awaited<ReturnType<typeof startServer>>
const openSockets: Socket[] = []

before(() => connectTestDb('sockets'))
beforeEach(async () => {
  await resetTestDb()
  server = await startServer()
})
afterEach(async () => {
  openSockets.splice(0).forEach(socket => socket.close())
  await server.stop()
})
after(() => disconnectTestDb())

const open = async (userId: string) => {
  const socket = await connect(userId)
  openSockets.push(socket)
  return socket
}

describe('joining a project', () => {
  test('a member is admitted and told their role', async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    const result = await join(await open(String(alice._id)), String(project._id))

    assert.equal(result.ok, true)
    assert.equal(result.role, 'owner')
  })

  test('a non-member is refused', async () => {
    const alice = await makeUser()
    const bob = await makeUser()
    const project = await makeProject(alice)

    const result = await join(await open(String(bob._id)), String(project._id))

    assert.equal(result.ok, false)
  })
})

describe('broadcasts stay inside the project', () => {
  test('a mutation reaches the acting project and not a neighbouring one', async () => {
    const alice = await makeUser()
    const bob = await makeUser()
    const projectA = await makeProject(alice, 'A')
    const projectB = await makeProject(bob, 'B')

    const aliceSocket = await open(String(alice._id))
    const bobSocket = await open(String(bob._id))

    await join(aliceSocket, String(projectA._id))
    await join(bobSocket, String(projectB._id))

    let aliceSaw: string | null = null
    let bobSaw: string | null = null
    aliceSocket.on('createTeacher', (obj) => { aliceSaw = obj.teacher?.name })
    bobSocket.on('createTeacher', (obj) => { bobSaw = obj.teacher?.name })

    aliceSocket.emit('sendCreateTeacher', { teacher: { name: 'OnlyForA' } })
    await settle()

    assert.equal(aliceSaw, 'OnlyForA')
    assert.equal(bobSaw, null, 'the other project must not see this')
  })

  test('two members of the same project both receive it', async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const project = await makeProject(alice)

    await projectService.invite(project._id, 'bob@school.hu', alice._id)
    await projectService.respondToInvitation(project._id, bob._id, true)

    const aliceSocket = await open(String(alice._id))
    const bobSocket = await open(String(bob._id))
    await join(aliceSocket, String(project._id))
    await join(bobSocket, String(project._id))

    let bobSaw: string | null = null
    bobSocket.on('createTeacher', (obj) => { bobSaw = obj.teacher?.name })

    aliceSocket.emit('sendCreateTeacher', { teacher: { name: 'Shared' } })
    await settle()

    assert.equal(bobSaw, 'Shared')
  })
})

describe('a connection with no project', () => {
  test('cannot create anything', async () => {
    const alice = await makeUser()
    await makeProject(alice)

    const socket = await open(String(alice._id))

    let echoed: unknown = null
    socket.on('createTeacher', (obj) => { echoed = obj })

    socket.emit('sendCreateTeacher', { teacher: { name: 'Stray' } })
    await settle()

    assert.equal(echoed, null)
  })

  test('cannot create after leaving the project', async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    const socket = await open(String(alice._id))
    await join(socket, String(project._id))
    socket.emit('leaveProject')
    await settle()

    let echoed: unknown = null
    socket.on('createTeacher', (obj) => { echoed = obj })

    socket.emit('sendCreateTeacher', { teacher: { name: 'AfterLeaving' } })
    await settle()

    assert.equal(echoed, null)
  })
})
