const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: String,
  location: String,
  catalog: [[{
    classID: String,
    subjectID: String,
    teacherID: String,
    locationID: String
  }]]
});

exports.ClassSchema = ClassSchema;

exports.ClassModel = mongoose.model('Class', ClassSchema);
