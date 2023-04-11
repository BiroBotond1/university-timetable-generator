const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    name: String,
    inappropriateDates: { "8-9": [Number],
    "9-10": [Number],
    "10-11": [Number],
    "11-12": [Number],
    "12-13": [Number],
    "13-14": [Number],
    "14-15": [Number],
    "15-16": [Number]}
});

exports.TeacherSchema = TeacherSchema;

exports.TeacherModel = mongoose.model('Teacher', TeacherSchema);