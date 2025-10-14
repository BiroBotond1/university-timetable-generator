import { model } from '../models/User.js'
import * as encryptService from './EncryptService.js'

export const getAll = async () => {
  return await model.find();
};

export const create = async (user) => {
  return await model.create(user);
};

export const getById = async (id) => {
  return await model.findById(id);
};

export const update = async (id, user) => {
  return await model.findByIdAndUpdate(id, user);
};

export const deleteById = async (id) => {
  return await model.findByIdAndRemove(id);
};

export const login = async (username, password) => {
  try {
    const user = await model.findOne({ username: username }).exec();
    if (user === null) return null

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