import { after, afterEach, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { connectTestDb, disconnectTestDb, resetTestDb } from './helpers/db.js'
import { startStubEngine } from './helpers/stubEngine.js'
import { makeProject, makeUser } from './helpers/fixtures.js'
import * as projectService from '../src/services/ProjectService.js'
import * as generationService from '../src/services/GenerationService.js'
import * as teacherService from '../src/services/TeacherService.js'
import { model as Project } from '../src/models/Project.js'
import { model as GenerationRun } from '../src/models/GenerationRun.js'
import * as runService from '../src/services/GenerationRunService.js'
import grpc from '@grpc/grpc-js'
import http from 'http'
import { Server } from 'socket.io'
import { io as createClient, type Socket } from 'socket.io-client'
import handleProjectRoomEvents from '../src/socket/ProjectRoomSocket.js'
import handleGenerationEvents from '../src/socket/GenerationSocket.js'

let engine: Awaited<ReturnType<typeof startStubEngine>>

// Started once: rebinding the port per test raced with the previous shutdown.
before(async () => {
  await connectTestDb('generation')
  engine = await startStubEngine()
})

beforeEach(async () => {
  await resetTestDb()
  engine.reset()
})

// Release anything still parked, or it holds the global queue and hangs the
// next test.
afterEach(async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    engine.releaseAll()
    await new Promise(resolve => setTimeout(resolve, 20))
  }
})

after(async () => {
  engine.stop()
  await disconnectTestDb()
})

const statusOf = async (project) =>
  (await Project.findById(project._id)).generationStatus

describe('one generation per project', () => {
  test('a fresh project is idle', { timeout: 20000 }, async () => {
    const project = await makeProject(await makeUser())

    assert.equal(await statusOf(project), 'idle')
    assert.equal(generationService.isGenerating(project._id), false)
  })

  test('a second run on the same project is refused', { timeout: 20000 }, async () => {
    const project = await makeProject(await makeUser())

    const run = generationService.generate(project._id)
    assert.equal(generationService.isGenerating(project._id), true)

    await assert.rejects(
      () => generationService.generate(project._id),
      /already running/
    )

    // Releasing before the call arrives would release nothing.
    await engine.waitForCalls(1)
    engine.releaseAll()
    await run
  })

  test('the status returns to idle when the run finishes', { timeout: 20000 }, async () => {
    const project = await makeProject(await makeUser())

    const run = generationService.generate(project._id)
    await engine.waitForCalls(1)
    engine.releaseAll()
    await run

    assert.equal(await statusOf(project), 'idle')
    assert.equal(generationService.isGenerating(project._id), false)
  })
})

describe('runs from different projects queue', () => {
  test('the second project waits rather than running alongside', { timeout: 20000 }, async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    const runA = generationService.generate(a._id)
    const runB = generationService.generate(b._id)

    // B is still queued behind A.
    await engine.waitForCalls(1)
    assert.equal(engine.served, 1)
    assert.equal(await statusOf(a), 'running')
    assert.equal(await statusOf(b), 'queued')

    engine.releaseAll()
    await engine.waitForCalls(2)
    engine.releaseAll()
    await Promise.all([runA, runB])
  })

  test('the queue is served in request order', { timeout: 20000 }, async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    // The stub identifies a payload by its first teacher.
    await teacherService.create(a._id, { name: 'from-A' })
    await teacherService.create(b._id, { name: 'from-B' })

    const runA = generationService.generate(a._id)
    const runB = generationService.generate(b._id)

    await engine.waitForCalls(1)
    assert.deepEqual(engine.callOrder, ['from-A'])

    engine.releaseAll()
    await engine.waitForCalls(2)
    assert.deepEqual(engine.callOrder, ['from-A', 'from-B'])

    engine.releaseAll()
    await Promise.all([runA, runB])
  })

  test('the engine never handles two at once, but both are served', { timeout: 20000 }, async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    const runA = generationService.generate(a._id)
    const runB = generationService.generate(b._id)

    await engine.waitForCalls(1)
    engine.releaseAll()
    await engine.waitForCalls(2)
    engine.releaseAll()
    await Promise.all([runA, runB])

    assert.equal(engine.maxConcurrent, 1)
    assert.equal(engine.served, 2)
  })
})

describe('cancellation', () => {
  test('cancelling a queued run stops it ever reaching the engine', { timeout: 20000 }, async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    const runA = generationService.generate(a._id)
    const runB = generationService.generate(b._id)

    await engine.waitForCalls(1)
    generationService.cancel(b._id)

    engine.releaseAll()
    await Promise.all([runA, runB])

    assert.equal(engine.served, 1, 'the cancelled run must never reach the engine')
    assert.equal(await statusOf(b), 'idle')
  })

  test('cancelling an idle project reports that there was nothing to cancel', { timeout: 20000 }, async () => {
    const project = await makeProject(await makeUser())

    assert.equal(generationService.cancel(project._id), false)
  })
})

describe('restart recovery', () => {
  test('status left behind by a restart is cleared at boot', { timeout: 20000 }, async () => {
    const project = await makeProject(await makeUser())

    // What a crash mid-run leaves behind.
    await Project.findByIdAndUpdate(project._id, { generationStatus: 'running' })

    assert.equal(await projectService.clearStaleGenerationStatus(), 1)
    assert.equal(await statusOf(project), 'idle')
  })

  test('idle projects are left alone by the boot sweep', { timeout: 20000 }, async () => {
    await makeProject(await makeUser())

    assert.equal(await projectService.clearStaleGenerationStatus(), 0)
  })
})

/** Starts a run and collects every record onUpdate is given, in order. */
const startRecorded = (project, startedBy = null) => {
  const updates: any[] = []
  const run = generationService.generate(project._id, {
    startedBy: startedBy?._id ?? null,
    onUpdate: (record) => updates.push(record),
  })
  return { run, updates, statuses: () => updates.map(u => u.status) }
}

describe('run records', () => {
  test('a finished run is recorded with who started it and when', { timeout: 20000 }, async () => {
    const alice = await makeUser()
    const project = await makeProject(alice)

    const { run, updates, statuses } = startRecorded(project, alice)
    await engine.waitForCalls(1)
    engine.releaseAll()
    await run

    assert.deepEqual(statuses(), ['queued', 'running', 'succeeded'])

    const record = updates.at(-1)
    assert.equal(String(record.startedBy._id), String(alice._id))
    assert.equal(record.startedBy.username, alice.username)
    assert.ok(record.queuedAt <= record.startedAt && record.startedAt <= record.finishedAt)
    assert.equal(record.details, undefined, 'the raw error must not reach the frontend')
  })

  test('a run cancelled while running records who cancelled it', { timeout: 20000 }, async () => {
    const alice = await makeUser()
    const bob = await makeUser()
    const project = await makeProject(alice)

    const { run, updates, statuses } = startRecorded(project, alice)
    await engine.waitForCalls(1)
    generationService.cancel(project._id, bob._id)
    await run

    assert.deepEqual(statuses(), ['queued', 'running', 'cancelled'])
    assert.equal(String(updates.at(-1).cancelledBy._id), String(bob._id))
    assert.ok(updates.at(-1).finishedAt)
  })

  test('a run cancelled in the queue is recorded as cancelled and never started', { timeout: 20000 }, async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    const runA = startRecorded(a, owner)
    const runB = startRecorded(b, owner)

    await engine.waitForCalls(1)
    generationService.cancel(b._id, owner._id)
    engine.releaseAll()
    await Promise.all([runA.run, runB.run])

    assert.deepEqual(runB.statuses(), ['queued', 'cancelled'])
    assert.equal(runB.updates.at(-1).startedAt, null)
    assert.equal(String(runB.updates.at(-1).cancelledBy._id), String(owner._id))
  })

  test('a failed run keeps the engine error, but only on the server', { timeout: 20000 }, async () => {
    const project = await makeProject(await makeUser())

    const { run, updates, statuses } = startRecorded(project)
    await engine.waitForCalls(1)
    engine.failAll(grpc.status.FAILED_PRECONDITION, 'Class 9A needs 41 hours, the week has 40.')
    await run

    assert.deepEqual(statuses(), ['queued', 'running', 'failed'])

    const stored = await GenerationRun.findById(updates.at(-1)._id)
    assert.match(stored.details, /Class 9A needs 41 hours/)
  })

  test('every Generate click leaves exactly one record', { timeout: 20000 }, async () => {
    const project = await makeProject(await makeUser())

    for (let i = 0; i < 3; i += 1) {
      const { run } = startRecorded(project)
      await engine.waitForCalls(i + 1)
      engine.releaseAll()
      await run
    }

    assert.equal(await GenerationRun.countDocuments({ project: project._id }), 3)
  })
})

describe('run records after a restart', () => {
  test('runs a restart left open are closed as interrupted', { timeout: 20000 }, async () => {
    const project = await makeProject(await makeUser())

    const queued = await runService.create(project._id)
    const running = await runService.create(project._id)
    await runService.update(project._id, running._id, { status: 'running', startedAt: new Date() })
    const done = await runService.create(project._id)
    await runService.update(project._id, done._id, { status: 'succeeded', finishedAt: new Date() })

    assert.equal(await runService.closeInterrupted(), 2)

    for (const run of [queued, running]) {
      const stored = await GenerationRun.findById(run._id)
      assert.equal(stored.status, 'interrupted')
      assert.equal(stored.message, 'The server restarted during this run.')
      assert.ok(stored.finishedAt)
    }
    assert.equal((await GenerationRun.findById(done._id)).status, 'succeeded')
  })
})

describe('what a run tells the user', () => {
  const failWith = async (code: number, details: string) => {
    const project = await makeProject(await makeUser())
    const { run, updates } = startRecorded(project)
    await engine.waitForCalls(1)
    engine.failAll(code, details)
    await run
    return { record: updates.at(-1), stored: await GenerationRun.findById(updates.at(-1)._id) }
  }

  test('an input the engine cannot schedule shows the engine\'s own words', { timeout: 20000 }, async () => {
    const { record } = await failWith(grpc.status.FAILED_PRECONDITION, 'Teacher Kovacs needs 41 hours, the week has 40.')

    assert.equal(record.status, 'failed')
    assert.equal(record.message, 'Teacher Kovacs needs 41 hours, the week has 40.')
  })

  test('an engine that is not running is named as such', { timeout: 20000 }, async () => {
    const { record } = await failWith(grpc.status.UNAVAILABLE, 'No connection established')

    assert.equal(record.message, 'The timetable engine is not running.')
  })

  test('an internal error gets a plain sentence, and the error is kept aside', { timeout: 20000 }, async () => {
    const { record, stored } = await failWith(grpc.status.INTERNAL, '[json.exception.parse_error.101] parse error')

    assert.equal(record.message, 'Generation failed because of an internal error.')
    assert.match(stored.details, /parse_error/)
  })

  test('a finished run keeps the engine\'s verdict and fitness', { timeout: 20000 }, async () => {
    const project = await makeProject(await makeUser())
    const { run, updates } = startRecorded(project)
    await engine.waitForCalls(1)
    engine.releaseAll({
      classCatalogs: {}, teacherCatalogs: {}, locationCatalogs: {},
      active: false, fitnesClas: 1500, fitnesTeacher: -40, fitnesLocation: 2000, elapsedTime: 12.5,
    })
    await run

    const record = updates.at(-1)
    assert.equal(record.status, 'succeeded')
    assert.equal(record.message, null)
    assert.deepEqual(
      { ...record.result.toObject() },
      { active: false, fitnessClass: 1500, fitnessTeacher: -40, fitnessLocation: 2000, elapsedTime: 12.5 }
    )
  })
})

// Real ProjectRoom and Generation handlers on a real socket server, here rather
// than beside the other socket tests because this file owns the stub engine's
// port. Only the Auth0 handshake is stubbed.
describe('the whole project sees each run', () => {
  const PORT = 4603
  let httpServer: http.Server
  let io: Server
  const sockets: Socket[] = []

  before(async () => {
    httpServer = http.createServer()
    io = new Server(httpServer)
    io.use((socket, next) => {
      socket.data.userId = socket.handshake.auth.userId
      next()
    })
    io.on('connection', (socket) => {
      handleProjectRoomEvents(socket, io)
      handleGenerationEvents(socket, io)
    })
    await new Promise<void>(resolve => httpServer.listen(PORT, resolve))
  })

  afterEach(() => {
    sockets.splice(0).forEach(socket => socket.disconnect())
  })

  after(() => new Promise<void>(resolve => {
    io.close()
    httpServer.close(() => resolve())
  }))

  /** A browser tab with the project open, recording every event it receives. */
  const openTab = (user, project) => new Promise<{ socket: Socket, events: Array<{ event: string, payload: any }> }>((resolve) => {
    const socket = createClient(`http://localhost:${PORT}`, {
      auth: { userId: String(user._id) },
      reconnection: false,
    })
    sockets.push(socket)

    const events: Array<{ event: string, payload: any }> = []
    socket.onAny((event, payload) => events.push({ event, payload }))
    socket.on('connect', () =>
      socket.emit('joinProject', { projectId: String(project._id) }, () => resolve({ socket, events })))
  })

  const waitFor = (tab, event: string) => new Promise<any>((resolve) => {
    const seen = tab.events.find(e => e.event === event)
    if (seen) return resolve(seen.payload)
    tab.socket.once(event, resolve)
  })

  const settle = () => new Promise(resolve => setTimeout(resolve, 250))

  /** Alice owns the school, Bob collaborates on it; Carol owns another. */
  const twoMembersAndAStranger = async () => {
    const alice = await makeUser()
    const bob = await makeUser('bob@school.hu')
    const carol = await makeUser()
    const project = await makeProject(alice)
    const other = await makeProject(carol, 'Other School')

    await projectService.invite(project._id, 'bob@school.hu', alice._id)
    await projectService.respondToInvitation(project._id, bob._id, true)

    return {
      alice, bob, carol, project,
      aliceTab: await openTab(alice, project),
      bobTab: await openTab(bob, project),
      carolTab: await openTab(carol, other),
    }
  }

  test('every member\'s tab follows the run to its failure, and no one else\'s', { timeout: 20000 }, async () => {
    const { alice, aliceTab, bobTab, carolTab } = await twoMembersAndAStranger()

    aliceTab.socket.emit('sendGenerationStarted')
    await engine.waitForCalls(1)
    engine.failAll(grpc.status.FAILED_PRECONDITION, 'Class 9A needs 41 hours, the week has 40.')

    const finished = await waitFor(bobTab, 'GenerationFinished')
    await waitFor(aliceTab, 'GenerationFinished')

    for (const tab of [aliceTab, bobTab]) {
      assert.deepEqual(tab.events.map(e => e.event), ['GenerationQueued', 'GenerationStarted', 'GenerationFinished'])
    }
    assert.equal(finished.status, 'failed')
    assert.equal(finished.message, 'Class 9A needs 41 hours, the week has 40.')
    assert.equal(finished.startedBy.username, alice.username)
    assert.equal(finished.details, undefined)

    await settle()
    assert.deepEqual(carolTab.events, [])
  })

  test('a member can cancel another member\'s run, and everyone sees who did', { timeout: 20000 }, async () => {
    const { bob, aliceTab, bobTab } = await twoMembersAndAStranger()

    aliceTab.socket.emit('sendGenerationStarted')
    await engine.waitForCalls(1)
    bobTab.socket.emit('sendGenerationCancelled')

    const cancelled = await waitFor(aliceTab, 'GenerationCancelled')
    assert.equal(cancelled.status, 'cancelled')
    assert.equal(cancelled.cancelledBy.username, bob.username)
  })
})
