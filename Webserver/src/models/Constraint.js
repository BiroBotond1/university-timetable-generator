const mongoose = require('mongoose');

const ConstraintSchema = new mongoose.Schema({
  name: String,
  active: Boolean,
  hard: Boolean,
  description: String
});

exports.ConstraintSchema = ConstraintSchema;

exports.ConstraintModel = mongoose.model('Constraint', ConstraintSchema);
