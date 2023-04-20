const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: String,
    reservedDates: [[Number]],
    catalog: [[{classID: String,
        subjectID: String,
        teacherID: String,
        locationID: String}]]
});

exports.LocationSchema = LocationSchema;

exports.LocationModel = mongoose.model('Location', LocationSchema);