import mongoose from 'mongoose'
import { schema as classSchema } from './Class.js'
import { schema as teacherSchema } from './Teacher.js'
import { schema as subjectSchema } from './Subject.js'

const schema = new mongoose.Schema({
  number: Number,
  class: classSchema,
  subject: subjectSchema,
  teacher: teacherSchema,
  weight: Number
});

export default mongoose.model('ClassHour', schema);
