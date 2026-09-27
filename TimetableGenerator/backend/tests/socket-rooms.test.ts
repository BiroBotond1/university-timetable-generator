import { after, afterEach, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'http'
import { Server } from 'socket.io'
import { io as createClient, type Socket } from 'socket.io-client'

import { connectTestDb, disconnectTestDb, resetTestDb } from './helpers/db.js'
import { makeProject, makeUser } from './helpers/fixtures.js'
import handleProjectRoomEvents, { userRoomOf } from '../src/socket/ProjectRoomSocket.js'
import { evictFromProject, setIo, toProject, toUser } from '../src/socket/notify.js'
import handleTeacherEvents from '../src/socket/TeacherSocket.js'
import * as projectService from '../src/services/ProjectService.js'

const PORT = 4599

// Real handlers on a real server; only the Auth0 handshake is stubbed.
const startServer = async () => {
  const httpServer = http.createServer()
  const io = new Server(httpServer, { cors: { origin: '*' } })

  io.use((socket, next) => {
    socket.data.userId = socket.handshake.auth.userId
    next()
  })

  setIo(io)

  // Same as socket.ts.
  io.on('connection', (socket) => {
    socket.join(userRoomOf(socket.data.userId))
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

describe('notifications', () => {
  test('an invitee is reached before they belong to any project', async () => {
    const alice = await makeUser()
    const bob = await makeUser()
    await makeProject(alice)

    const bobSocket = await open(String(bob._id))

    let received: unknown = null
    bobSocket.on('invitationsChanged', (payload) => { received = payload })

    toUser(bob._id, 'invitationsChanged', { reason: 'received' })
    await settle()

    assert.deepEqual(received, { reason: 'received' })
  })

  test('a user notification reaches only that user', async () => {
    const alice = await makeUser()
    const bob = await makeUser()

    const aliceSocket = await open(String(alice._id))
    await open(String(bob._id))

    let aliceGot = false
    aliceSocket.on('invitationsChanged', () => { aliceGot = true })

    toUser(bob._id, 'invitationsChanged')
    await settle()

    assert.equal(aliceGot, false)
  })

  test('a project notification reaches members inside it', async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    const socket = await open(String(alice._id))
    await join(socket, String(project._id))

    let got = false
    socket.on('membersChanged', () => { got = true })

    toProject(project._id, 'membersChanged')
    await settle()

    assert.equal(got, true)
  })
})

describe('eviction', () => {
  /** Alice owns the project; Bob is an active collaborator inside it. */
  const collaboratorInside = async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const project = await makeProject(alice)

    await projectService.invite(project._id, 'bob@school.hu', alice._id)
    await projectService.respondToInvitation(project._id, bob._id, true)

    const aliceSocket = await open(String(alice._id))
    const bobSocket = await open(String(bob._id))
    await join(aliceSocket, String(project._id))
    await join(bobSocket, String(project._id))

    return { alice, bob, project, aliceSocket, bobSocket }
  }

  test('a removed member is told, and loses write access on open tabs', async () => {
    const { bob, project, aliceSocket, bobSocket } = await collaboratorInside()

    let closed: unknown = null
    bobSocket.on('projectClosed', (payload) => { closed = payload })

    await projectService.removeMember(project._id, bob._id)
    const evicted = evictFromProject(project._id, bob._id, 'removed')
    await settle()

    assert.equal(evicted, 1)
    assert.deepEqual(closed, { projectId: String(project._id), reason: 'removed' })

    // The tab he still has open must not be able to write.
    let aliceSaw: string | null = null
    aliceSocket.on('createTeacher', (obj) => { aliceSaw = obj.teacher?.name })

    bobSocket.emit('sendCreateTeacher', { teacher: { name: 'AfterRemoval' } })
    await settle()

    assert.equal(aliceSaw, null)
  })

  test('evicting one member leaves the others in place', async () => {
    const { bob, project, aliceSocket } = await collaboratorInside()

    let aliceClosed = false
    aliceSocket.on('projectClosed', () => { aliceClosed = true })

    evictFromProject(project._id, bob._id, 'removed')
    await settle()

    assert.equal(aliceClosed, false)

    let aliceSaw: string | null = null
    aliceSocket.on('createTeacher', (obj) => { aliceSaw = obj.teacher?.name })
    aliceSocket.emit('sendCreateTeacher', { teacher: { name: 'StillWorks' } })
    await settle()

    assert.equal(aliceSaw, 'StillWorks')
  })

  test('deleting a project evicts everyone inside it', async () => {
    const { project, aliceSocket, bobSocket } = await collaboratorInside()

    const reasons: string[] = []
    aliceSocket.on('projectClosed', (p) => reasons.push(p.reason))
    bobSocket.on('projectClosed', (p) => reasons.push(p.reason))

    const evicted = evictFromProject(project._id, null, 'deleted')
    await settle()

    assert.equal(evicted, 2)
    assert.deepEqual(reasons, ['deleted', 'deleted'])
  })
})
