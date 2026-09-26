import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // Exactly one owner. Denormalised here so the ownership check is a single
  // read; the owner also has a ProjectMember row with role 'owner'.
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

projectSchema.index({ owner: 1 });

export const model = mongoose.model('Project', projectSchema);
