import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  // Tenant key. Every query in services/ filters on this (ADR 0001).
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },

  number: Number,

  class: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Class" 
  },

  subject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Subject" 
  },

  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher" 
  },

  weight: Number
});

schema.index({ project: 1 });

export default mongoose.model('ClassHour', schema);