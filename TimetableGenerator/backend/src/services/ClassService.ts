import { model } from '../models/Class.js'

export const getAll = async (projectId) => {
  return await model.find({ project: projectId });
};

export const create = async (projectId, clas) => {
  return await model.create({ ...clas, project: projectId });
};

export const getById = async (projectId, id) => {
  return await model.findOne({ _id: id, project: projectId });
};

export const update = async (projectId, id, clas) => {
  const { project, ...changes } = clas;
  return await model.findOneAndUpdate({ _id: id, project: projectId }, changes);
};

export const deleteById = async (projectId, id) => {
  return await model.findOneAndDelete({ _id: id, project: projectId });
};

export const addCatalog = async (projectId, id, catalog) => {
  return await model.findOneAndUpdate(
    { _id: id, project: projectId },
    { catalog }
  );
};

export const removeAll = async (projectId) => {
  return await model.deleteMany({ project: projectId });
}
