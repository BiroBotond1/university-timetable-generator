import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },

  // Denormalised from ProjectMember for a one-read ownership check.
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Persisted so a reloaded page still sees a run in progress.
  generationStatus: {
    type: String,
    enum: ['idle', 'queued', 'running'],
    default: 'idle',
  },

  generationStartedAt: { type: Date, default: null },
}, { timestamps: true });

projectSchema.index({ owner: 1 });

export const model = mongoose.model('Project', projectSchema);
