import { model } from '../models/User.js'

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