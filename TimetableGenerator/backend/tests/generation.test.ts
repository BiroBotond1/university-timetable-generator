import { after, afterEach, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { connectTestDb, disconnectTestDb, resetTestDb } from './helpers/db.js'
import { startStubEngine } from './helpers/stubEngine.js'
import { makeProject, makeUser } from './helpers/fixtures.js'
import * as projectService from '../src/services/ProjectService.js'
import * as generationService from '../src/services/GenerationService.js'
import { model as Project } from '../src/models/Project.js'

let engine: Awaited<ReturnType<typeof startStubEngine>>

// Started once for the file: rebinding the port between tests raced with the
// previous server's shutdown.
before(async () => {
  await connectTestDb('generation')
  engine = await startStubEngine()
})

beforeEach(async () => {
  await resetTestDb()
  engine.reset()
})

// Nothing may stay parked, or the next test inherits an open call.
afterEach(() => engine.releaseAll())

after(async () => {
  engine.stop()
  await disconnectTestDb()
})

const statusOf = async (project) =>
  (await Project.findById(project._id)).generationStatus

describe('one generation per project', () => {
  test('a fresh project is idle', async () => {
    const project = await makeProject(await makeUser())

    assert.equal(await statusOf(project), 'idle')
    assert.equal(generationService.isGenerating(project._id), false)
  })

  test('a second run on the same project is refused', async () => {
    const project = await makeProject(await makeUser())

    const run = generationService.generate(project._id)
    assert.equal(generationService.isGenerating(project._id), true)

    await assert.rejects(
      () => generationService.generate(project._id),
      /already running/
    )

    engine.releaseAll()
    await run
  })

  test('the status returns to idle when the run finishes', async () => {
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
  test('the second project waits rather than running alongside', async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    const runA = generationService.generate(a._id)
    const runB = generationService.generate(b._id)

    // Exactly one call has reached the engine: B is still behind A.
    await engine.waitForCalls(1)
    assert.equal(engine.served, 1)
    assert.equal(await statusOf(a), 'running')
    assert.equal(await statusOf(b), 'queued')

    engine.releaseAll()
    await engine.waitForCalls(2)
    engine.releaseAll()
    await Promise.all([runA, runB])
  })

  test('the engine never handles two at once, but both are served', async () => {
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
  test('cancelling a queued run stops it ever reaching the engine', async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    const runA = generationService.generate(a._id)
    const runB = generationService.generate(b._id)

    // A is at the engine, B is queued behind it.
    await engine.waitForCalls(1)
    generationService.cancel(b._id)

    engine.releaseAll()
    await Promise.all([runA, runB])

    assert.equal(engine.served, 1, 'the cancelled run must never reach the engine')
    assert.equal(await statusOf(b), 'idle')
  })

  test('cancelling an idle project reports that there was nothing to cancel', async () => {
    const project = await makeProject(await makeUser())

    assert.equal(generationService.cancel(project._id), false)
  })
})

describe('restart recovery', () => {
  test('status left behind by a restart is cleared at boot', async () => {
    const project = await makeProject(await makeUser())

    // what a crash mid-run would leave in the database
    await Project.findByIdAndUpdate(project._id, { generationStatus: 'running' })

    assert.equal(await projectService.clearStaleGenerationStatus(), 1)
    assert.equal(await statusOf(project), 'idle')
  })

  test('idle projects are left alone by the boot sweep', async () => {
    await makeProject(await makeUser())

    assert.equal(await projectService.clearStaleGenerationStatus(), 0)
  })
})
