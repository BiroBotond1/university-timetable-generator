const mongoose = require('mongoose');
const { ClassSchema } = require('./Class');
const { TeacherSchema } = require('./Teacher');
const { SubjectSchema } = require('./Subject');

const ClassHourSchema = new mongoose.Schema({
  number: Number,
  class: ClassSchema,
  subject: SubjectSchema,
  teacher: TeacherSchema,
  weight: Number
});

module.exports = mongoose.model('ClassHour', ClassHourSchema);
