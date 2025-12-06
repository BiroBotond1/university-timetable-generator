import mongoose from 'mongoose'

export const schema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  username: String,
  email: String,
});

export const model = mongoose.model('User', schema);