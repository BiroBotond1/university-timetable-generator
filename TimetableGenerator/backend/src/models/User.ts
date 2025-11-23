import mongoose from 'mongoose'

export const schema = new mongoose.Schema({
  username: String,
  password: String
});

export const model = mongoose.model('User', schema);
