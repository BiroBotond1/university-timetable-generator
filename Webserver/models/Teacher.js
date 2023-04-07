const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    name: String,
    ineligibleDates: [{Number, Number}]
});

exports.TeacherSchema = TeacherSchema;

exports.TeacherModel = mongoose.model('Teacher', TeacherSchema);