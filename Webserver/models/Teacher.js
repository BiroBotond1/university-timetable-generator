const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    name: String,
    inappropriateDates: [[Number]],
    catalog: [Number]
});

exports.TeacherSchema = TeacherSchema;

exports.TeacherModel = mongoose.model('Teacher', TeacherSchema);