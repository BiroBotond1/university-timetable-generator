const mongoose = require('mongoose');
const ClassHourInCatalogSchema = require('./ClassHourInCatalog')

const ClassSchema = new mongoose.Schema({
    name: String,
    location: String,
    catalog: [[{classID: String,
        subjectID: String,
        teacherID: String,
        locationID: String, 
        classRoom: String}]]
});

exports.ClassSchema = ClassSchema;

exports.ClassModel = mongoose.model('Class', ClassSchema);