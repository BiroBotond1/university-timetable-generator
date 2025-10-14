import { model } from '../models/Constraint.js'

export const getAll = async () => {
  return await model.find();
};

export const create = async (constraint) => {
  return await model.create(constraint);
};

export const getById = async (id) => {
  return await model.findById(id);
};

export const update = async (id, constraint) => {
  return await model.findByIdAndUpdate(id, constraint);
};

export const deleteById = async (id) => {
  return await model.findByIdAndRemove(id);
};

export const updateByName = async (name, active) => {
  const constraint = await model.findOne({name})
  if (constraint === null) return 

  constraint.active = active
  return await model.findByIdAndUpdate(constraint._id, constraint);
}

export const initializeConstraints = async () => {
  await initializeConstraint('OneTypeOfCourseOnADayClass', 'Classes can have only one lesson from a subject on a given day', true)
  await initializeConstraint('ClassCoursesStartsAtEight', 'All classes start their lessons at eight o\'clock in the morning', true)
  await initializeConstraint('NoHoleHoursInClass', 'All classes should have their lessons consistently sheduled back-to-back, meaning no class should have any gaps in their schedule', true)
  await initializeConstraint('EvenHoursInClass', 'Classes should have an equal number of hours per day, so that there is as little difference as possible between the number of hours on different days of the week, and their lessons should be evenly distributed', false)
  await initializeConstraint('NoHoleHoursInTeacher', 'Teachers should have as few gaps in their schedule as possible', false)
  await initializeConstraint('EvenHoursInTeacher', 'Teachers should have an equal number of hours per day, so that there is as little difference as possible between the number of hours on different days of the week, and their lessons should be evenly distributed', false)
  await initializeConstraint('CoursesWeightInClass', 'It is advisable to schedule prioritized subjects for each class as early as possible', false)
}

async function initializeConstraint(name, description, hard) {
  const constraint = await model.findOne({ name : name }).exec();
  
  if (constraint != null) return

  //if not already in the db create it
  await model.create({name: name, description: description, hard: hard, active: true})
}