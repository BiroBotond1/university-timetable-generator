const mongoose = require('mongoose');

const ClassHourInCatalogSchema = new mongoose.Schema({
    classID: String,
    subjectID: String,
    teacherID: String,
    locationID: String
});

module.exports = mongoose.model('ClassHourInCatalogSchema', ClassHourInCatalogSchema);