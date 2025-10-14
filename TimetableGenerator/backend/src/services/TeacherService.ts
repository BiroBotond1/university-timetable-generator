import { model } from '../models/Teacher.js'

export const getAll = async () => {
  return await model.find();
};

export const create = async (teacher) => {
  return await model.create(teacher);
};

export const getById = async (id) => {
  return await model.findById(id);
};

export const update = async (id, teacher) => {
  return await model.findByIdAndUpdate(id, teacher);
};

export const deleteById = async (id) => {
  return await model.findByIdAndRemove(id);
};

export const addCatalog = async (id, catalog) => {
  const teacher = await model.findById(id);
  if (teacher === null) return

  teacher.catalog = catalog;
  return await model.findByIdAndUpdate(id, teacher);
};

export const imp = async (teachers) => {
  await model.deleteMany();

  teachers.forEach(async teacher => {
    await create(teacher)
  });
}