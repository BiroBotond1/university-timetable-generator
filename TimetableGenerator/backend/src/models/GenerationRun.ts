import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema({
  // Every hard constraint holds; a timetable is still saved when it does not.
  active: Boolean,
  fitnessClass: Number,
  fitnessTeacher: Number,
  fitnessLocation: Number,
  // Seconds the engine spent annealing, as it reports it.
  elapsedTime: Number,
}, { _id: false });

// One per Generate click, from joining the queue to its outcome. The record of
// what happened; whether a run is going is still Project.generationStatus.
const generationRunSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },

  startedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  status: {
    type: String,
    enum: ['queued', 'running', 'succeeded', 'failed', 'cancelled', 'interrupted'],
    default: 'queued',
  },

  queuedAt: { type: Date, default: Date.now },
  startedAt: { type: Date, default: null },
  finishedAt: { type: Date, default: null },

  // Written for the user to read.
  message: { type: String, default: null },
  // The raw error, for whoever debugs it. Never sent to the frontend.
  details: { type: String, default: null },

  result: { type: resultSchema, default: null },
});

generationRunSchema.index({ project: 1, queuedAt: -1 });

export const model = mongoose.model('GenerationRun', generationRunSchema);
