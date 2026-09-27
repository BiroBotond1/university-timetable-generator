import { model } from '../models/Constraint.js'

// `name` is used verbatim as a JSON key by the C++ engine, so renaming one
// breaks generation at runtime.
export const DEFAULT_CONSTRAINTS = [
  { name: 'OneTypeOfCourseOnADayClass', hard: true, description: 'Classes can have only one lesson from a subject on a given day' },
  { name: 'ClassCoursesStartsAtEight', hard: true, description: 'All classes start their lessons at eight o\'clock in the morning' },
  { name: 'NoHoleHoursInClass', hard: true, description: 'All classes should have their lessons consistently sheduled back-to-back, meaning no class should have any gaps in their schedule' },
  { name: 'EvenHoursInClass', hard: false, description: 'Classes should have an equal number of hours per day, so that there is as little difference as possible between the number of hours on different days of the week, and their lessons should be evenly distributed' },
  { name: 'NoHoleHoursInTeacher', hard: false, description: 'Teachers should have as few gaps in their schedule as possible' },
  { name: 'EvenHoursInTeacher', hard: false, description: 'Teachers should have an equal number of hours per day, so that there is as little difference as possible between the number of hours on different days of the week, and their lessons should be evenly distributed' },
  { name: 'CoursesWeightInClass', hard: false, description: 'It is advisable to schedule prioritized subjects for each class as early as possible' },
]

export const getAll = async (projectId) => {
  return await model.find({ project: projectId });
};

export const create = async (projectId, constraint) => {
  return await model.create({ ...constraint, project: projectId });
};

export const getById = async (projectId, id) => {
  return await model.findOne({ _id: id, project: projectId });
};

export const update = async (projectId, id, constraint) => {
  const { project, ...changes } = constraint;
  return await model.findOneAndUpdate({ _id: id, project: projectId }, changes);
};

export const deleteById = async (projectId, id) => {
  return await model.findOneAndDelete({ _id: id, project: projectId });
};

export const updateByName = async (projectId, name, active) => {
  return await model.findOneAndUpdate(
    { project: projectId, name },
    { active },
    { new: true }
  );
}

// Idempotent: $setOnInsert never resets an existing project's toggles.
export const seedForProject = async (projectId) => {
  for (const constraint of DEFAULT_CONSTRAINTS) {
    await model.updateOne(
      { project: projectId, name: constraint.name },
      { $setOnInsert: { ...constraint, project: projectId, active: true } },
      { upsert: true }
    );
  }

  return await getAll(projectId);
}
