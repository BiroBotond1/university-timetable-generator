import { model } from '../models/Class.js'

export const getAll = async () => {
  return await model.find();
};

export const create = async (clas) => {
  return await model.create(clas);
};

export const getById = async (id) => {
  return await model.findById(id);
};

export const update = async (id, clas) => {
  return await model.findByIdAndUpdate(id, clas);
};

export const deleteById = async (id) => {
  return await model.findByIdAndRemove(id);
};

export const addCatalog = async (id, catalog) => {
  const clas = await model.findById(id);

  if (clas === null) return

  clas.catalog = catalog;
  return await model.findByIdAndUpdate(id, clas);
};

export const imp = async (classes) => {
  await model.deleteMany();

  classes.forEach(async clas => {
    await create(clas)
  });
}