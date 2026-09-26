import * as constraintService from './ConstraintService.js'
import * as classService from './ClassService.js'
import * as locationService from './LocationService.js'
import * as subjectService from './SubjectService.js'
import * as teacherService from './TeacherService.js'
import * as classHourService from './ClassHourService.js'

/** Fields that belong to one database row, not to the school being described. */
const strip = (doc) => {
  const plain = typeof doc?.toObject === 'function' ? doc.toObject() : { ...doc };

  delete plain._id;
  delete plain.__v;
  delete plain.project;

  return plain;
}

/**
 * Removes database bookkeeping at any depth, including from documents that
 * were populated into the export. `_id` stays: within a file it is how
 * references are expressed, and import rewrites it on the way back in.
 */
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

/** Accepts either a populated document or a bare id. */
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

/**
 * Loads a school into a project, replacing whatever is there.
 *
 * Ids in the file are treated as names local to that file, not as database
 * keys: every entity is created afresh and references are rewritten through an
 * old-id to new-id map. Previously the documents were re-inserted with their
 * original _id values, so the same file could not be loaded into two projects
 * without colliding, and a file could not be shared between installations.
 *
 * Order matters -- locations, teachers and classes have no outgoing
 * references, subjects point at locations, and class hours point at the rest.
 */
export async function doImport(projectId, data)
{
  const dataObj = JSON.parse(data)

  // Dependents first, so nothing dangles part-way through.
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
