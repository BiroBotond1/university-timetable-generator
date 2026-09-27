import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { connectTestDb, disconnectTestDb, resetTestDb } from './helpers/db.js'
import { makeProject, makeSchool, makeUser } from './helpers/fixtures.js'
import * as impexp from '../src/services/ImportExportService.js'
import * as constraintService from '../src/services/ConstraintService.js'
import * as teacherService from '../src/services/TeacherService.js'
import * as subjectService from '../src/services/SubjectService.js'
import * as classHourService from '../src/services/ClassHourService.js'

before(() => connectTestDb('importexport'))
beforeEach(() => resetTestDb())
after(() => disconnectTestDb())

// Project A with a school, an empty project B, and A exported to a file.
const exported = async () => {
  const owner = await makeUser()
  const a = await makeProject(owner, 'A')
  const b = await makeProject(owner, 'B')
  const school = await makeSchool(a._id)

  await teacherService.addCatalog(a._id, school.teacher._id, [
    [{ class: '9.A', subject: 'Fizika', teacher: '', location: 'Lab 1' }],
  ])
  await constraintService.updateByName(a._id, 'EvenHoursInClass', false)

  return { a, b, school, file: await impexp.getTimetableData(a._id) }
}

describe('export', () => {
  test('carries no database bookkeeping, at any depth', async () => {
    const { file } = await exported()
    const parsed = JSON.parse(file)

    assert.ok(!parsed.teachers.some(t => 'project' in t), 'project leaked at top level')
    assert.ok(
      !parsed.classHours.some(ch => 'project' in ch.class),
      'project leaked inside a populated reference'
    )
    assert.ok(!file.includes('"__v"'), '__v leaked')
  })

  test('keeps _id, because references inside the file are expressed with it', async () => {
    const { file } = await exported()

    assert.ok(JSON.parse(file).teachers[0]._id)
  })

  test('writes ids as id strings, including inside populated references', async () => {
    const { school, file } = await exported()
    const parsed = JSON.parse(file)
    const HEX_ID = /^[0-9a-f]{24}$/

    // This payload is also what the engine receives; an ObjectId copied with a
    // spread used to arrive as {} and make Database::Fill throw.
    assert.equal(parsed.teachers[0]._id, String(school.teacher._id))
    assert.match(parsed.classHours[0]._id, HEX_ID)
    assert.match(parsed.classHours[0].teacher._id, HEX_ID)
    assert.match(parsed.classHours[0].class._id, HEX_ID)
    assert.match(parsed.subjects[0].locations[0]._id, HEX_ID)
  })

  test('carries the constraint states as top-level booleans', async () => {
    const { file } = await exported()

    assert.equal(JSON.parse(file).EvenHoursInClass, false)
    assert.equal(JSON.parse(file).NoHoleHoursInClass, true)
  })
})

describe('import into a different project', () => {
  test('regenerates ids rather than reusing the file\'s', async () => {
    const { b, school, file } = await exported()

    await impexp.doImport(b._id, file)

    const teachers = await teacherService.getAll(b._id)
    assert.notEqual(String(teachers[0]._id), String(school.teacher._id))
    assert.equal(String(teachers[0].project), String(b._id))
  })

  test('remaps every reference to the newly created rows', async () => {
    const { b, school, file } = await exported()

    await impexp.doImport(b._id, file)

    const teachers = await teacherService.getAll(b._id)
    const subjects = await subjectService.getAll(b._id)
    const classHours = await classHourService.getAll(b._id)

    assert.equal(String(classHours[0].teacher._id), String(teachers[0]._id))
    assert.equal(classHours[0].class.name, '9.A')
    assert.notEqual(String(classHours[0].class._id), String(school.clas._id))
    assert.equal(subjects[0].locations[0].name, 'Lab 1')
  })

  test('preserves scalars, nested arrays and catalogs', async () => {
    const { b, file } = await exported()

    await impexp.doImport(b._id, file)

    const teacher = (await teacherService.getAll(b._id))[0]
    const classHour = (await classHourService.getAll(b._id))[0]

    assert.equal(classHour.number, 3)
    assert.equal(classHour.weight, 5)
    assert.deepEqual(teacher.inappropriateDates, [[0, 0]])
    // Catalogs hold entity names, not ids, so they need no remapping.
    assert.equal(teacher.catalog[0][0].subject, 'Fizika')
  })

  test('applies the constraint states from the file', async () => {
    const { b, file } = await exported()

    await impexp.doImport(b._id, file)

    const constraints = await constraintService.getAll(b._id)
    assert.equal(constraints.find(c => c.name === 'EvenHoursInClass').active, false)
  })

  test('leaves the source project untouched', async () => {
    const { a, b, file } = await exported()

    await impexp.doImport(b._id, file)

    assert.equal((await teacherService.getAll(a._id)).length, 1)
  })
})

describe('several entities of each kind', () => {
  test('each class hour keeps pointing at its own teacher', async () => {
    const owner = await makeUser()
    const a = await makeProject(owner, 'A')
    const b = await makeProject(owner, 'B')

    const first = await makeSchool(a._id)
    const second = await teacherService.create(a._id, { name: 'Nagy' })
    await classHourService.create(a._id, {
      number: 2, class: first.clas._id, subject: first.subject._id, teacher: second._id, weight: 1,
    })

    await impexp.doImport(b._id, await impexp.getTimetableData(a._id))

    const teachers = await teacherService.getAll(b._id)
    const byTeacher = (await classHourService.getAll(b._id))
      .map(ch => ch.teacher?.name)
      .sort()

    assert.equal(teachers.length, 2)
    assert.deepEqual(byTeacher, ['Kovacs', 'Nagy'])
  })
})

describe('repeated and round-trip imports', () => {
  test('importing the same file twice replaces rather than duplicating', async () => {
    const { b, file } = await exported()

    await impexp.doImport(b._id, file)
    await impexp.doImport(b._id, file)

    assert.equal((await teacherService.getAll(b._id)).length, 1)
  })

  test('the data is there the instant doImport resolves', async () => {
    const { b, file } = await exported()

    await impexp.doImport(b._id, file)

    assert.equal((await classHourService.getAll(b._id)).length, 1)
  })

  test('A -> B -> A keeps the shape', async () => {
    const { a, b, file } = await exported()

    await impexp.doImport(b._id, file)
    await impexp.doImport(a._id, await impexp.getTimetableData(b._id))

    const classHours = await classHourService.getAll(a._id)
    assert.equal(classHours.length, 1)
    assert.equal(classHours[0].subject.name, 'Fizika')
    assert.equal(classHours[0].teacher.name, 'Kovacs')
  })

  test('importing an empty school empties the project', async () => {
    const { a, b, file } = await exported()

    await impexp.doImport(b._id, file)
    await impexp.doImport(b._id, JSON.stringify({ classes: [], classHours: [], locations: [], subjects: [], teachers: [] }))

    assert.equal((await teacherService.getAll(b._id)).length, 0)
    assert.equal((await teacherService.getAll(a._id)).length, 1)
  })
})
