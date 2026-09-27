import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { connectTestDb, disconnectTestDb, resetTestDb } from './helpers/db.js'
import { makeProject, makeUser } from './helpers/fixtures.js'
import * as projectService from '../src/services/ProjectService.js'
import * as constraintService from '../src/services/ConstraintService.js'
import { model as Constraint } from '../src/models/Constraint.js'

before(() => connectTestDb('constraints'))
beforeEach(() => resetTestDb())
after(() => disconnectTestDb())

/**
 * These names are the JSON keys the C++ engine reads out of the payload
 * (TimetableConfig.cpp). If this list and the engine ever disagree, generation
 * fails at runtime with no compile-time warning -- which is the whole reason
 * this assertion exists.
 */
const ENGINE_WIRE_KEYS = [
  'OneTypeOfCourseOnADayClass',
  'ClassCoursesStartsAtEight',
  'NoHoleHoursInClass',
  'EvenHoursInClass',
  'NoHoleHoursInTeacher',
  'EvenHoursInTeacher',
  'CoursesWeightInClass',
]

describe('seeding', () => {
  test('a new project starts with the full constraint set, all active', async () => {
    const owner = await makeUser()
    const project = await makeProject(owner)

    const constraints = await constraintService.getAll(project._id)

    assert.equal(constraints.length, 7)
    assert.equal(constraints.filter(c => c.hard).length, 3)
    assert.ok(constraints.every(c => c.active === true))
  })

  test('the seeded names are exactly the keys the engine reads', async () => {
    const owner = await makeUser()
    const project = await makeProject(owner)

    const names = (await constraintService.getAll(project._id)).map(c => c.name).sort()

    assert.deepEqual(names, [...ENGINE_WIRE_KEYS].sort())
  })

  test('re-seeding neither duplicates nor resets a toggle', async () => {
    const owner = await makeUser()
    const project = await makeProject(owner)

    await constraintService.updateByName(project._id, 'NoHoleHoursInTeacher', false)
    await constraintService.seedForProject(project._id)

    const constraints = await constraintService.getAll(project._id)

    assert.equal(constraints.length, 7)
    assert.equal(constraints.find(c => c.name === 'NoHoleHoursInTeacher').active, false)
  })
})

describe('isolation between projects', () => {
  test('each project gets its own rows', async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    const ids = [
      ...(await constraintService.getAll(a._id)),
      ...(await constraintService.getAll(b._id)),
    ].map(c => String(c._id))

    assert.equal(new Set(ids).size, 14)
  })

  test('toggling a constraint in one project leaves the other alone', async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    await constraintService.updateByName(a._id, 'NoHoleHoursInTeacher', false)

    const inA = (await constraintService.getAll(a._id)).find(c => c.name === 'NoHoleHoursInTeacher')
    const inB = (await constraintService.getAll(b._id)).find(c => c.name === 'NoHoleHoursInTeacher')

    assert.equal(inA.active, false)
    assert.equal(inB.active, true)
  })

  test('another project\'s constraint cannot be updated', async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    const target = (await constraintService.getAll(b._id))[0]

    assert.equal(await constraintService.update(a._id, target._id, { active: false }), null)
  })
})

describe('deletion', () => {
  test('constraints cascade with the project', async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    await projectService.remove(a._id)

    assert.equal(await Constraint.countDocuments({ project: a._id }), 0)
    assert.equal(await Constraint.countDocuments({ project: b._id }), 7)
  })
})
