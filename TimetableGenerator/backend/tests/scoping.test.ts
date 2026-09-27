import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { connectTestDb, disconnectTestDb, resetTestDb } from './helpers/db.js'
import { makeProject, makeSchool, makeUser } from './helpers/fixtures.js'
import * as projectService from '../src/services/ProjectService.js'
import * as teacherService from '../src/services/TeacherService.js'
import * as classHourService from '../src/services/ClassHourService.js'
import * as locationService from '../src/services/LocationService.js'
import { model as Teacher } from '../src/models/Teacher.js'
import ClassHour from '../src/models/ClassHour.js'

before(() => connectTestDb('scoping'))
beforeEach(() => resetTestDb())
after(() => disconnectTestDb())

/** Two projects owned by the same user, each with its own school. */
const twoSchools = async () => {
  const owner = await makeUser()
  const a = await makeProject(owner, 'School A')
  const b = await makeProject(owner, 'School B')

  return { owner, a, b, schoolA: await makeSchool(a._id), schoolB: await makeSchool(b._id) }
}

describe('reads are scoped to one project', () => {
  test('listing returns only the calling project\'s entities', async () => {
    const { a } = await twoSchools()

    const teachers = await teacherService.getAll(a._id)

    assert.equal(teachers.length, 1)
    assert.equal(String(teachers[0].project), String(a._id))
  })

  test('an entity cannot be read by id from another project', async () => {
    const { a, schoolB } = await twoSchools()

    assert.equal(await teacherService.getById(a._id, schoolB.teacher._id), null)
  })

  test('an entity can be read by id from its own project', async () => {
    const { a, schoolA } = await twoSchools()

    assert.notEqual(await teacherService.getById(a._id, schoolA.teacher._id), null)
  })
})

describe('writes cannot cross the project boundary', () => {
  test('updating another project\'s entity does nothing', async () => {
    const { a, schoolB } = await twoSchools()

    const result = await teacherService.update(a._id, schoolB.teacher._id, { name: 'HACKED' })

    assert.equal(result, null)
    assert.equal((await Teacher.findById(schoolB.teacher._id)).name, 'Kovacs')
  })

  test('deleting another project\'s entity does nothing', async () => {
    const { a, schoolB } = await twoSchools()

    const result = await teacherService.deleteById(a._id, schoolB.teacher._id)

    assert.equal(result, null)
    assert.notEqual(await Teacher.findById(schoolB.teacher._id), null)
  })

  test('writing a catalog into another project\'s entity does nothing', async () => {
    const { a, schoolB } = await twoSchools()

    await teacherService.addCatalog(a._id, schoolB.teacher._id, [[{ subject: 'X' }]])

    const victim = await Teacher.findById(schoolB.teacher._id)
    assert.equal((victim.catalog ?? []).length, 0)
  })

  test('an entity cannot be moved to another project through its payload', async () => {
    const { a, b, schoolA } = await twoSchools()

    await teacherService.update(a._id, schoolA.teacher._id, { name: 'Nagy', project: b._id })

    const teacher = await Teacher.findById(schoolA.teacher._id)
    assert.equal(String(teacher.project), String(a._id), 'project must not be reassignable')
    assert.equal(teacher.name, 'Nagy', 'other fields should still update')
  })
})

describe('usage checks respect the project', () => {
  test('a teacher in use reports used only within its own project', async () => {
    const { a, b, schoolA } = await twoSchools()

    assert.ok(await classHourService.isTeacherUsed(a._id, schoolA.teacher._id))
    assert.ok(!(await classHourService.isTeacherUsed(b._id, schoolA.teacher._id)))
  })
})

describe('bulk removal is scoped', () => {
  test('removeAll empties only the calling project', async () => {
    const { a, b } = await twoSchools()

    await teacherService.removeAll(a._id)

    assert.equal((await teacherService.getAll(a._id)).length, 0)
    assert.equal((await teacherService.getAll(b._id)).length, 1)
  })
})

describe('deleting a project cascades', () => {
  test('everything in the project goes, and only that project', async () => {
    const { a, b } = await twoSchools()

    await projectService.remove(a._id)

    assert.equal(await Teacher.countDocuments({ project: a._id }), 0)
    assert.equal(await ClassHour.countDocuments({ project: a._id }), 0)
    assert.equal(await locationService.getAll(a._id).then(l => l.length), 0)

    assert.equal(await Teacher.countDocuments({ project: b._id }), 1)
    assert.equal(await ClassHour.countDocuments({ project: b._id }), 1)
  })
})
