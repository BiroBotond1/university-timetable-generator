const mongoose = require('mongoose');
const encryptService = require('../services/EncryptService.js')

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

UserSchema.pre("save", async function (next) {
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

exports.UserSchema = UserSchema;

exports.UserModel = mongoose.model('User', UserSchema);
