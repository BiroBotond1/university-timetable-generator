import { model } from '../models/Subject.js'

export const getAll = async () => {
  return await model
    .find()
    .populate("locations");
};

export const create = async (subject) => {
  return await model.create(subject);
};

export const getById = async (id) => {
  return await model
    .findById(id)
    .populate("locations");;
};

export const update = async (id, subject) => {
  return await model.findByIdAndUpdate(id, subject);
};

export const deleteById = async (id) => {
  return await model.findByIdAndRemove(id);
};

export const isLocationUsed = async (locationId) => {
  return await model.exists({ locations: locationId });
};

export const imp = async (subjects) => {
  await model.deleteMany();

  subjects.forEach(async subject => {
    await create(subject)
  });
}