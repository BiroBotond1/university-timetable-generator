import { model } from '../models/Location.js'

export const getAll = async () => {
  return await model.find();
};

export const create = async (location) => {
  return await model.create(location);
};

export const getById = async (id) => {
  return await model.findById(id);
};

export const update = async (id, location) => {
  return await model.findByIdAndUpdate(id, location);
};

export const deleteById = async (id) => {
  return await model.findByIdAndRemove(id);
};

export const addCatalog = async (id, catalog) => {
  const location = await model.findById(id);
  if (location === null) return 
  
  location.catalog = catalog;
  return await model.findByIdAndUpdate(id, location);
};

export const imp = async (locations) => {
  await model.deleteMany();

  locations.forEach(async location => {
    await create(location)
  });
}