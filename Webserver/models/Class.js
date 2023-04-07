const mongoose = require('mongoose');
const {LocationSchema} = require('./Location')

const ClassSchema = new mongoose.Schema({
    name: String,
    location: LocationSchema
});

exports.ClassSchema = ClassSchema;

exports.ClassModel = mongoose.model('Class', ClassSchema);