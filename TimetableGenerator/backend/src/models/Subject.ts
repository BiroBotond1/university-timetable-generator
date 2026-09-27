import mongoose from 'mongoose'

export const schema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name: String,
  locations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }]
});

schema.index({ project: 1, name: 1 });

export const model = mongoose.model('Subject', schema);