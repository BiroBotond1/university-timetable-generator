import mongoose from 'mongoose'

const schema = new mongoose.Schema({
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

export default mongoose.model('ClassHour', schema);