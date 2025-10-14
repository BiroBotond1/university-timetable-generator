import { model } from '../models/Subject.js'

export const getAll = async () => {
  return await model.find();
};

export const create = async (subject) => {
  return await model.create(subject);
};

export const getById = async (id) => {
  return await model.findById(id);
};

export const update = async (id, subject) => {
  return await model.findByIdAndUpdate(id, subject);
};

export const deleteById = async (id) => {
  return await model.findByIdAndRemove(id);
};

export const isLocationUsed = async (locationId) => {
  const subjectWithLocation = await model.findOne({
    locations: {
      $elemMatch: { _id : locationId }
    }
  });

  return subjectWithLocation !== null; 
};

export const imp = async (subjects) => {
  await model.deleteMany();

  subjects.forEach(async subject => {
    await create(subject)
  });
}