const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    name: String,
    inappropriateDates: [[Number]],
    catalog: [[String]]
});

exports.TeacherSchema = TeacherSchema;

exports.TeacherModel = mongoose.model('Teacher', TeacherSchema);