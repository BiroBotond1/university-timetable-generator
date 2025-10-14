import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  classID: String,
  subjectID: String,
  teacherID: String,
  locationID: String
});

export default mongoose.model('ClassHourInCatalogSchema', schema);
