import mongoose from 'mongoose'

export const schema = new mongoose.Schema({
  name: String,
  active: Boolean,
  hard: Boolean,
  description: String
});

export const model = mongoose.model('Constraint', schema);
