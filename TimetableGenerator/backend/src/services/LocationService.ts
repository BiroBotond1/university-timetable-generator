import { model } from '../models/Location.js'

export const getAll = async (projectId) => {
  return await model.find({ project: projectId });
};

export const create = async (projectId, location) => {
  return await model.create({ ...location, project: projectId });
};

export const getById = async (projectId, id) => {
  return await model.findOne({ _id: id, project: projectId });
};

export const update = async (projectId, id, location) => {
  const { project, ...changes } = location;
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

export const imp = async (projectId, locations) => {
  await model.deleteMany({ project: projectId });

  locations.forEach(async location => {
    await create(projectId, location)
  });
}
