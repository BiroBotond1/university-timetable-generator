import mongoose from 'mongoose'

import { model as User } from '../../src/models/User.js'
import { model as Project } from '../../src/models/Project.js'
import { model as ProjectMember } from '../../src/models/ProjectMember.js'
import { model as Teacher } from '../../src/models/Teacher.js'
import { model as Location } from '../../src/models/Location.js'
import { model as Subject } from '../../src/models/Subject.js'
import { model as Class } from '../../src/models/Class.js'
import { model as Constraint } from '../../src/models/Constraint.js'
import ClassHour from '../../src/models/ClassHour.js'
import { model as GenerationRun } from '../../src/models/GenerationRun.js'

const models = [User, Project, ProjectMember, Teacher, Location, Subject, Class, Constraint, ClassHour, GenerationRun]

// dropDatabase drops indexes too, and some tests rely on them.
const syncIndexes = async () => {
  for (const model of models) {
    await model.syncIndexes()
  }
}

// One database per file, because files run in parallel.
// Needs MongoDB: `yarn deps:up` from TimetableGenerator/.
export const connectTestDb = async (name: string) => {
  await mongoose.connect(`mongodb://localhost/timetabledb_test_${name}`)
  await mongoose.connection.dropDatabase()
  await syncIndexes()
}

export const resetTestDb = async () => {
  await mongoose.connection.dropDatabase()
  await syncIndexes()
}

export const disconnectTestDb = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
}
