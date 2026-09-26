import { model } from '../models/Subject.js'

export const getAll = async (projectId) => {
  return await model
    .find({ project: projectId })
    .populate("locations");
};

export const create = async (projectId, subject) => {
  return await model.create({ ...subject, project: projectId });
};

export const getById = async (projectId, id) => {
  return await model
    .findOne({ _id: id, project: projectId })
    .populate("locations");
};

export const update = async (projectId, id, subject) => {
  const { project, ...changes } = subject;
  return await model.findOneAndUpdate({ _id: id, project: projectId }, changes);
};

export const deleteById = async (projectId, id) => {
  return await model.findOneAndDelete({ _id: id, project: projectId });
};

export const isLocationUsed = async (projectId, locationId) => {
  return await model.exists({ project: projectId, locations: locationId });
};

export const imp = async (projectId, subjects) => {
  await model.deleteMany({ project: projectId });

  subjects.forEach(async subject => {
    await create(projectId, subject)
  });
}
