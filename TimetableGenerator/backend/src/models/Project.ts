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

  // Persisted so the UI is correct for a client that reloads, or a
  // collaborator who arrives while a run is already going (ADR 0001). The live
  // socket broadcast stays as the fast path.
  generationStatus: {
    type: String,
    enum: ['idle', 'queued', 'running'],
    default: 'idle',
  },

  generationStartedAt: { type: Date, default: null },
}, { timestamps: true });

projectSchema.index({ owner: 1 });

export const model = mongoose.model('Project', projectSchema);
