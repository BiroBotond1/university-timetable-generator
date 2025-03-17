const { UserModel } = require('../models/User.js');
const encryptService = require('../services/EncryptService.js')

exports.getAllUsers = async () => {
  return await UserModel.find();
};

exports.createUser = async (user) => {
  return await UserModel.create(user);
};

exports.getUserById = async (id) => {
  return await UserModel.findById(id);
};

exports.updateUser = async (id, user) => {
  return await UserModel.findByIdAndUpdate(id, user);
};

exports.deleteUser = async (id) => {
  return await UserModel.findByIdAndRemove(id);
};

exports.login = async (username, password) => {
  try {
    const user = await UserModel.findOne({ username: username }).exec();
    const isMatch = await encryptService.compare(password, user.password)
    console.log(isMatch)

    if(!isMatch)
      return null;

    return user;

  } catch (error) {
    console.error('Error during login:', error);
    return null;
  }
};
