import * as constraintService from './ConstraintService.js'
import * as classService from './ClassService.js'
import * as locationService from './LocationService.js'
import * as subjectService from './SubjectService.js'
import * as teacherService from './TeacherService.js'
import * as classHourService from './ClassHourService.js'

// Drops _id, __v and project so the row can be re-created in another project.
const strip = (doc) => {
  const plain = typeof doc?.toObject === 'function' ? doc.toObject() : { ...doc };

  delete plain._id;
  delete plain.__v;
  delete plain.project;

  return plain;
}

// Removes __v and project at every depth. _id is kept: references inside the
// file use it, and import rewrites it.
const forExport = (value) => {
  if (Array.isArray(value)) return value.map(forExport);

  if (value && typeof value === 'object') {
    const plain = typeof value.toObject === 'function' ? value.toObject() : { ...value };

    delete plain.__v;
    delete plain.project;

    for (const key of Object.keys(plain)) {
      plain[key] = forExport(plain[key]);
    }

    return plain;
  }

  return value;
}

const idOf = (ref) => String(ref?._id ?? ref ?? '');

export async function getTimetableData(projectId)
{
  const object = {};

  // Fetch constraints and add to object
  const constraints = await constraintService.getAll(projectId);
  constraints.forEach((constraint) => {
    object[constraint.name] = constraint.active;
  });

  // Fetch other data and add to object
  object.classes = forExport(await classService.getAll(projectId));
  object.classHours = forExport(await classHourService.getAll(projectId));
  object.locations = forExport(await locationService.getAll(projectId));
  object.subjects = forExport(await subjectService.getAll(projectId));
  object.teachers = forExport(await teacherService.getAll(projectId));

  return JSON.stringify(object);
}

// Creates every entity afresh and rewrites references through old-id -> new-id
// maps, so the same file can be loaded into any project. Order matters: subjects
// reference locations, class hours reference everything else.
export async function doImport(projectId, data)
{
  const dataObj = JSON.parse(data)

  // Dependents first, so nothing points at a deleted row.
  await classHourService.removeAll(projectId)
  await subjectService.removeAll(projectId)
  await classService.removeAll(projectId)
  await teacherService.removeAll(projectId)
  await locationService.removeAll(projectId)

  const locationIds = new Map()
  for (const location of dataObj.locations ?? []) {
    const created = await locationService.create(projectId, strip(location))
    locationIds.set(idOf(location), created._id)
  }

  const teacherIds = new Map()
  for (const teacher of dataObj.teachers ?? []) {
    const created = await teacherService.create(projectId, strip(teacher))
    teacherIds.set(idOf(teacher), created._id)
  }

  const classIds = new Map()
  for (const clas of dataObj.classes ?? []) {
    const created = await classService.create(projectId, strip(clas))
    classIds.set(idOf(clas), created._id)
  }

  const subjectIds = new Map()
  for (const subject of dataObj.subjects ?? []) {
    const created = await subjectService.create(projectId, {
      ...strip(subject),
      locations: (subject.locations ?? [])
        .map((location) => locationIds.get(idOf(location)))
        .filter(Boolean),
    })
    subjectIds.set(idOf(subject), created._id)
  }

  for (const classHour of dataObj.classHours ?? []) {
    await classHourService.create(projectId, {
      ...strip(classHour),
      class: classIds.get(idOf(classHour.class)),
      subject: subjectIds.get(idOf(classHour.subject)),
      teacher: teacherIds.get(idOf(classHour.teacher)),
    })
  }

  await updateConstraints(projectId, dataObj)
}

async function updateConstraints(projectId, dataObj) {
  for (const { name } of constraintService.DEFAULT_CONSTRAINTS) {
    if (typeof dataObj[name] === 'boolean') {
      await constraintService.updateByName(projectId, name, dataObj[name])
    }
  }
}
