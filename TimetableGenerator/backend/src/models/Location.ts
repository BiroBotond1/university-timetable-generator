import mongoose from 'mongoose'

export const schema = new mongoose.Schema({
  name: String,
  reservedDates: [[Number]],
  catalog: [[{
    classID: String,
    subjectID: String,
    teacherID: String,
    locationID: String
  }]]
});

export const model = mongoose.model('Location', schema);
