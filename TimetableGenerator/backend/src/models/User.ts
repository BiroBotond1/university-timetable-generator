import mongoose from 'mongoose'
import * as encryptService from '../services/EncryptService.js'

export const schema = new mongoose.Schema({
  username: String,
  password: String
});

schema.pre("save", async function (next) {
  const user = this

  if (this.isModified("password") || this.isNew) {
    try {
      user.password = await encryptService.encrypt(user.password)
      return next()
    } 
    catch {
      return next()
    }
  } else {
    return next()
  }
})

export const model = mongoose.model('User', schema);
