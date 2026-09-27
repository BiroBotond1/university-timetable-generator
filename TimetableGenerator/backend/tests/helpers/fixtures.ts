import { model as User } from '../../src/models/User.js'
import * as projectService from '../../src/services/ProjectService.js'
import * as teacherService from '../../src/services/TeacherService.js'
import * as locationService from '../../src/services/LocationService.js'
import * as classService from '../../src/services/ClassService.js'
import * as subjectService from '../../src/services/SubjectService.js'
import * as classHourService from '../../src/services/ClassHourService.js'

let counter = 0

export const makeUser = async (email?: string) => {
  counter += 1

  return await User.create({
    auth0Id: `auth0|test-${counter}`,
    username: `user${counter}`,
    email: email ?? `user${counter}@school.hu`,
  })
}

export const makeProject = async (owner, name = 'Test School') => {
  return await projectService.create(name, owner._id)
}

// One room, teacher, class and subject, tied together by a class hour.
export const makeSchool = async (projectId) => {
  const location = await locationService.create(projectId, {
    name: 'Lab 1',
    reservedDates: [[1, 2]],
  })

  const teacher = await teacherService.create(projectId, {
    name: 'Kovacs',
    inappropriateDates: [[0, 0]],
  })

  const clas = await classService.create(projectId, {
    name: '9.A',
    location: 'Room 12',
  })

  const subject = await subjectService.create(projectId, {
    name: 'Fizika',
    locations: [location._id],
  })

  const classHour = await classHourService.create(projectId, {
    number: 3,
    class: clas._id,
    subject: subject._id,
    teacher: teacher._id,
    weight: 5,
  })

  return { location, teacher, clas, subject, classHour }
}
