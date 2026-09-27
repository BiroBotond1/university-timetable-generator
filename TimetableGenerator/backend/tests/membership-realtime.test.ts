import { after, afterEach, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'http'
import { Server } from 'socket.io'
import { io as createClient, type Socket } from 'socket.io-client'

import { connectTestDb, disconnectTestDb, resetTestDb } from './helpers/db.js'
import { makeProject, makeUser } from './helpers/fixtures.js'
import handleProjectRoomEvents, { userRoomOf } from '../src/socket/ProjectRoomSocket.js'
import handleTeacherEvents from '../src/socket/TeacherSocket.js'
import { setIo } from '../src/socket/notify.js'
import * as controller from '../src/controllers/ProjectController.js'
import * as projectService from '../src/services/ProjectService.js'

/**
 * Membership changes arrive over REST but have to show up live on other
 * people's screens. These tests call the real REST controllers and then look
 * at what each connected tab actually received, so "the owner's list updates
 * when someone accepts" is observed rather than assumed.
 *
 * Only the Auth0 handshake is stubbed; rooms, notifier and handlers are the
 * production code.
 */

const PORT = 4601

const startServer = async () => {
  const httpServer = http.createServer()
  const io = new Server(httpServer, { cors: { origin: '*' } })

  io.use((socket, next) => {
    socket.data.userId = socket.handshake.auth.userId
    next()
  })

  setIo(io)

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

interface Tab {
  socket: Socket,
  events: Array<{ event: string, payload: any }>,
  got: (event: string) => any[],
}

const openSockets: Socket[] = []

/** A browser tab: a connection that records everything it is sent. */
const openTab = (user) => new Promise<Tab>((resolve) => {
  const socket = createClient(`http://localhost:${PORT}`, {
    auth: { userId: String(user._id) },
    reconnection: false,
  })
  openSockets.push(socket)

  const events: Tab['events'] = []
  socket.onAny((event, payload) => events.push({ event, payload }))

  socket.on('connect', () => resolve({
    socket,
    events,
    got: (event) => events.filter(e => e.event === event).map(e => e.payload),
  }))
})

/** What the route guard does when a project page is opened. */
const enterProject = (tab: Tab, project) =>
  new Promise<any>(resolve =>
    tab.socket.emit('joinProject', { projectId: String(project._id) }, resolve))

const settle = () => new Promise(resolve => setTimeout(resolve, 250))

/** Invokes a controller the way Express would, and captures the response. */
const call = async (handler, req) => {
  let statusCode = 200
  let body = null
  const res = {
    status(code) { statusCode = code; return res },
    json(value) { body = value; return res },
  }

  await handler({ params: {}, body: {}, ...req }, res)

  return { statusCode, body }
}

const asOwner = (user, project) => ({
  context: { user, projectId: String(project._id), role: 'owner' },
  params: { projectId: String(project._id) },
})

const asMember = (user, project, role = 'collaborator') => ({
  context: { user, projectId: String(project._id), role },
  params: { projectId: String(project._id) },
})

/** Alice owns the project and has it open; Bob is invited but has not answered. */
const pendingInvitation = async () => {
  const alice = await makeUser()
  const bob = await makeUser('bob@school.hu')
  const project = await makeProject(alice)

  await projectService.invite(project._id, 'bob@school.hu', alice._id)

  const aliceTab = await openTab(alice)
  await enterProject(aliceTab, project)
  const bobTab = await openTab(bob)

  return { alice, bob, project, aliceTab, bobTab }
}

/** As above, but Bob has accepted and has the project open. */
const collaboratorInside = async () => {
  const setup = await pendingInvitation()
  await projectService.respondToInvitation(setup.project._id, setup.bob._id, true)
  await enterProject(setup.bobTab, setup.project)
  return setup
}

let server: Awaited<ReturnType<typeof startServer>>

before(() => connectTestDb('realtime'))
beforeEach(async () => {
  await resetTestDb()
  server = await startServer()
})
afterEach(async () => {
  openSockets.splice(0).forEach(socket => socket.close())
  await server.stop()
})
after(() => disconnectTestDb())

describe('inviting', () => {
  test('the invitee\'s badge updates, and the owner\'s list shows the pending row', async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const project = await makeProject(alice)

    const aliceTab = await openTab(alice)
    await enterProject(aliceTab, project)
    const bobTab = await openTab(bob)

    const { statusCode } = await call(controller.invite, {
      ...asOwner(alice, project),
      body: { email: 'bob@school.hu' },
    })
    await settle()

    assert.equal(statusCode, 201)
    assert.deepEqual(bobTab.got('invitationsChanged'), [{ reason: 'received' }])
    assert.equal(aliceTab.got('membersChanged').length, 1)
  })
})

describe('answering an invitation', () => {
  test('accepting updates the owner\'s member list live', async () => {
    const { bob, project, aliceTab, bobTab } = await pendingInvitation()

    await call(controller.respondToInvitation, {
      ...asMember(bob, project),
      body: { accept: true },
    })
    await settle()

    assert.equal(aliceTab.got('membersChanged').length, 1, 'owner list must refresh')
    assert.deepEqual(bobTab.got('invitationsChanged'), [{ reason: 'accepted' }])
    assert.equal(bobTab.got('projectsChanged').length, 1, 'the project appears in his list')
  })

  test('declining updates the owner\'s list, and does not add a project', async () => {
    const { bob, project, aliceTab, bobTab } = await pendingInvitation()

    await call(controller.respondToInvitation, {
      ...asMember(bob, project),
      body: { accept: false },
    })
    await settle()

    assert.equal(aliceTab.got('membersChanged').length, 1)
    assert.deepEqual(bobTab.got('invitationsChanged'), [{ reason: 'declined' }])
    assert.equal(bobTab.got('projectsChanged').length, 0)
  })

  test('withdrawing an invitation clears it from the invitee\'s badge', async () => {
    const { alice, project, aliceTab, bobTab } = await pendingInvitation()
    const [pending] = (await projectService.listMembers(project._id, { includePending: true }))
      .filter(m => m.status === 'pending')

    await call(controller.revokeInvitation, {
      ...asOwner(alice, project),
      params: { projectId: String(project._id), memberId: String(pending._id) },
    })
    await settle()

    assert.deepEqual(bobTab.got('invitationsChanged'), [{ reason: 'revoked' }])
    assert.equal(aliceTab.got('membersChanged').length, 1)
  })
})

describe('leaving', () => {
  test('a collaborator leaving updates the owner\'s list live', async () => {
    const { bob, project, aliceTab } = await collaboratorInside()

    const { statusCode } = await call(controller.leaveProject, asMember(bob, project))
    await settle()

    assert.equal(statusCode, 200)
    assert.equal(aliceTab.got('membersChanged').length, 1, 'owner list must refresh')
    assert.equal(await projectService.getMembership(project._id, bob._id), null)
  })

  test('every tab the leaver has open is taken out of the project', async () => {
    const { bob, project, aliceTab, bobTab } = await collaboratorInside()
    const bobSecondTab = await openTab(bob)
    await enterProject(bobSecondTab, project)

    await call(controller.leaveProject, asMember(bob, project))
    await settle()

    const closed = { projectId: String(project._id), reason: 'left' }
    assert.deepEqual(bobTab.got('projectClosed'), [closed])
    assert.deepEqual(bobSecondTab.got('projectClosed'), [closed])
    assert.ok(bobTab.got('projectsChanged').length >= 1)

    // and neither tab can write any more
    bobSecondTab.socket.emit('sendCreateTeacher', { teacher: { name: 'AfterLeaving' } })
    await settle()
    assert.equal(aliceTab.got('createTeacher').length, 0)
  })

  test('the owner cannot leave, and nobody is told anything changed', async () => {
    const { alice, project, aliceTab, bobTab } = await collaboratorInside()

    const { statusCode, body } = await call(controller.leaveProject, asOwner(alice, project))
    await settle()

    assert.equal(statusCode, 400)
    assert.match(body.error, /transfer ownership first/)
    assert.equal(aliceTab.got('projectClosed').length, 0)
    assert.equal(bobTab.got('membersChanged').length, 0)
  })
})

describe('removing', () => {
  test('the removed member is taken out; the rest of the project sees the change', async () => {
    const { alice, bob, project, aliceTab, bobTab } = await collaboratorInside()

    await call(controller.removeMember, {
      ...asOwner(alice, project),
      params: { projectId: String(project._id), userId: String(bob._id) },
    })
    await settle()

    assert.deepEqual(bobTab.got('projectClosed'), [{ projectId: String(project._id), reason: 'removed' }])
    assert.equal(aliceTab.got('membersChanged').length, 1)
    assert.equal(aliceTab.got('projectClosed').length, 0)
  })
})

describe('transferring ownership', () => {
  test('both people\'s member views and project lists refresh', async () => {
    const { alice, bob, project, aliceTab, bobTab } = await collaboratorInside()

    const { statusCode } = await call(controller.transferOwnership, {
      ...asOwner(alice, project),
      body: { userId: String(bob._id) },
    })
    await settle()

    assert.equal(statusCode, 200)
    assert.equal(aliceTab.got('membersChanged').length, 1)
    assert.equal(bobTab.got('membersChanged').length, 1)
    assert.equal(aliceTab.got('projectsChanged').length, 1)
    assert.equal(bobTab.got('projectsChanged').length, 1)

    assert.equal((await projectService.getMembership(project._id, bob._id)).role, 'owner')
    assert.equal((await projectService.getMembership(project._id, alice._id)).role, 'collaborator')
  })

  test('the previous owner can leave once ownership has moved', async () => {
    const { alice, bob, project, bobTab } = await collaboratorInside()

    await call(controller.transferOwnership, {
      ...asOwner(alice, project),
      body: { userId: String(bob._id) },
    })

    const { statusCode } = await call(controller.leaveProject, asMember(alice, project))
    await settle()

    assert.equal(statusCode, 200)
    assert.ok(bobTab.got('membersChanged').length >= 2, 'new owner sees the transfer and the departure')
  })
})

describe('deleting the project', () => {
  test('everyone inside is taken out and told why', async () => {
    const { alice, project, aliceTab, bobTab } = await collaboratorInside()

    await call(controller.deleteById, asOwner(alice, project))
    await settle()

    const closed = { projectId: String(project._id), reason: 'deleted' }
    assert.deepEqual(aliceTab.got('projectClosed'), [closed])
    assert.deepEqual(bobTab.got('projectClosed'), [closed])
    assert.equal(bobTab.got('projectsChanged').length, 1)
  })
})
