const { ConstraintModel } = require('../models/Constraint.js');

exports.getAllConstraints = async () => {
  return await ConstraintModel.find();
};

exports.createConstraint = async (constraint) => {
  return await ConstraintModel.create(constraint);
};

exports.getConstraintById = async (id) => {
  return await ConstraintModel.findById(id);
};

exports.updateConstraint = async (id, constraint) => {
  return await ConstraintModel.findByIdAndUpdate(id, constraint);
};

exports.deleteConstraint = async (id) => {
  return await ConstraintModel.findByIdAndRemove(id);
};

exports.updateConstraintByName = async (name, active) => {
  const constraint = await ConstraintModel.findOne({name})
  constraint.active = active
  return await ConstraintModel.findByIdAndUpdate(constraint._id, constraint);
}

exports.initializeConstraints = async () => {
  await initializeConstraint('OneTypeOfCourseOnADayClass', 'Classes can have only one lesson from a subject on a given day', true)
  await initializeConstraint('ClassCoursesStartsAtEight', 'All classes start their lessons at eight o\'clock in the morning', true)
  await initializeConstraint('NoHoleHoursInClass', 'All classes should have their lessons consistently sheduled back-to-back, meaning no class should have any gaps in their schedule', true)
  await initializeConstraint('EvenHoursInClass', 'Classes should have an equal number of hours per day, so that there is as little difference as possible between the number of hours on different days of the week, and their lessons should be evenly distributed', false)
  await initializeConstraint('NoHoleHoursInTeacher', 'Teachers should have as few gaps in their schedule as possible', false)
  await initializeConstraint('EvenHoursInTeacher', 'Teachers should have an equal number of hours per day, so that there is as little difference as possible between the number of hours on different days of the week, and their lessons should be evenly distributed', false)
  await initializeConstraint('CoursesWeightInClass', 'It is advisable to schedule prioritized subjects for each class as early as possible', false)
}

async function initializeConstraint(name, description, hard) {
  const constraint = await ConstraintModel.findOne({ name : name }).exec();
  
  if (constraint != null) return

  //if not already in the db create it
  await ConstraintModel.create({name: name, description: description, hard: hard, active: true})
}
