import mongoose from "mongoose";

export const schema = new mongoose.Schema({
  class: String,
  subject: String, 
  teacher: String,
  location: String,
}, { _id: false }); 