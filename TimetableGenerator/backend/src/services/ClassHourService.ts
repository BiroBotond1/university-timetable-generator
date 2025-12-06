import model from '../models/ClassHour.js'

export const getAll = async () => {
  return await model
    .find()
    .populate("class")
    .populate("subject")
    .populate("teacher");
};

export const create = async (classHour) => {
  return await model.create(classHour);
};

export const getById = async (id) => {
  return await model
    .findById(id)
    .populate("class")
    .populate("subject")
    .populate("teacher");
};

export const update = async (id, classHour) => {
  return await model.findByIdAndUpdate(id, classHour);
};

export const deleteById = async (id) => {
  return await model.findByIdAndRemove(id);
};

export const isClassUsed = async (classId) => {
  return await model.exists({ class: classId })
};

export const isTeacherUsed = async (teacherId) => {
  return await model.exists({ teacher: teacherId })
};

export const isSubjectUsed = async (subjectId) => {
  return await model.exists({ subject: subjectId })
};

export const imp = async (classHours) => {
  await model.deleteMany();

  classHours.forEach(async classHour => {
    await create(classHour)
  });
}