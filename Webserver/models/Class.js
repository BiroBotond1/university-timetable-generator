const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name: String,
    catalog: [[String]]
});

exports.ClassSchema = ClassSchema;

exports.ClassModel = mongoose.model('Class', ClassSchema);