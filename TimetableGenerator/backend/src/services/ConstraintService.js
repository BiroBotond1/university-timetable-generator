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
