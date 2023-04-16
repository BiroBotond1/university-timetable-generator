const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: String,
    reservedDates: [[Number]],
    catalog: [[Number]]
});

exports.LocationSchema = LocationSchema;

exports.LocationModel = mongoose.model('Location', LocationSchema);