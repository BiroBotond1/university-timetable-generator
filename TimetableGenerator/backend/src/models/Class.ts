import mongoose from 'mongoose'
import { schema as CatalogSchema } from './CatalogEntrySchema.js'

export const schema = new mongoose.Schema({
  // Tenant key. Every query in services/ filters on this (ADR 0001).
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  name: String,
  location: String,
 catalog: [[CatalogSchema]]
});

schema.index({ project: 1, name: 1 });

export const model = mongoose.model('Class', schema);