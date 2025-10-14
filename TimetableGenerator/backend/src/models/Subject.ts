import mongoose from 'mongoose'
import { schema as locationSchema }  from './Location.js'

export const schema = new mongoose.Schema({
  name: String,
  locations: [locationSchema]
});

export const model = mongoose.model('Subject', schema);
