import mongoose from 'mongoose'

export const schema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },

  name: String,
  active: Boolean,
  hard: Boolean,
  description: String
});

// The name is the key sent to the C++ engine, so it must be unique per project.
schema.index({ project: 1, name: 1 }, { unique: true });

export const model = mongoose.model('Constraint', schema);
