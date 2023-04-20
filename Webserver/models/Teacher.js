const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    name: String,
    inappropriateDates: [[Number]],
    catalog: [[{classID: String,
        subjectID: String,
        teacherID: String,
        locationID: String}]]
});

exports.TeacherSchema = TeacherSchema;

exports.TeacherModel = mongoose.model('Teacher', TeacherSchema);