import mongoose from 'mongoose'
import { schema as CatalogSchema } from './CatalogEntrySchema.js'

export const schema = new mongoose.Schema({
  name: String,
  location: String,
 catalog: [[CatalogSchema]]
});

export const model = mongoose.model('Class', schema);