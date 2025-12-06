import mongoose from 'mongoose'

export const schema = new mongoose.Schema({
  name: String,
  locations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }]
});

export const model = mongoose.model('Subject', schema);