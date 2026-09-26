import { model } from '../models/Teacher.js'

// Every query is scoped by project. The filter lives here rather than in the
// controllers because the socket handlers call these same functions directly
// (ADR 0001).

export const getAll = async (projectId) => {
  return await model.find({ project: projectId });
};

export const create = async (projectId, teacher) => {
  return await model.create({ ...teacher, project: projectId });
};

export const getById = async (projectId, id) => {
  return await model.findOne({ _id: id, project: projectId });
};

export const update = async (projectId, id, teacher) => {
  // `project` is never taken from the payload: an entity cannot be moved
  // between projects by editing it.
  const { project, ...changes } = teacher;
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
