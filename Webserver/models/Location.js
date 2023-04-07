const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: String,
    rezervedDates: [{Number, Number}]
});

exports.LocationSchema = LocationSchema;

exports.LocationModel = mongoose.model('Location', LocationSchema);