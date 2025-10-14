import mongoose from 'mongoose'

export const schema = new mongoose.Schema({
  name: String,
  location: String,
  catalog: [[{
    classID: String,
    subjectID: String,
    teacherID: String,
    locationID: String
  }]]
});

export const model = mongoose.model('Class', schema);
