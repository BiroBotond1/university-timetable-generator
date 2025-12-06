import mongoose from 'mongoose'
import { schema as CatalogSchema } from './CatalogEntrySchema.js'

export const schema = new mongoose.Schema({
  name: String,
  inappropriateDates: [[Number]],
   catalog: [[CatalogSchema]]
});

export const model = mongoose.model('Teacher', schema);