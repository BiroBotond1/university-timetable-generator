const mongoose = require('mongoose');
const { LocationSchema } = require('./Location');

const SubjectSchema = new mongoose.Schema({
    name: String,
    locations: [LocationSchema]
});

exports.SubjectSchema = SubjectSchema;

exports.SubjectModel = mongoose.model('Subject', SubjectSchema);