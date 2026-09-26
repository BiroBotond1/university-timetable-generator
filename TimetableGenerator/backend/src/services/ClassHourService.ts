import model from '../models/ClassHour.js'

export const getAll = async (projectId) => {
  return await model
    .find({ project: projectId })
    .populate("class")
    .populate("subject")
    .populate("teacher");
};

export const create = async (projectId, classHour) => {
  return await model.create({ ...classHour, project: projectId });
};

export const getById = async (projectId, id) => {
  return await model
    .findOne({ _id: id, project: projectId })
    .populate("class")
    .populate("subject")
    .populate("teacher");
};

export const update = async (projectId, id, classHour) => {
  const { project, ...changes } = classHour;
  return await model.findOneAndUpdate({ _id: id, project: projectId }, changes);
};

export const deleteById = async (projectId, id) => {
  return await model.findOneAndDelete({ _id: id, project: projectId });
};

export const isClassUsed = async (projectId, classId) => {
  return await model.exists({ project: projectId, class: classId })
};

export const isTeacherUsed = async (projectId, teacherId) => {
  return await model.exists({ project: projectId, teacher: teacherId })
};

export const isSubjectUsed = async (projectId, subjectId) => {
  return await model.exists({ project: projectId, subject: subjectId })
};

export const imp = async (projectId, classHours) => {
  await model.deleteMany({ project: projectId });

  classHours.forEach(async classHour => {
    await create(projectId, classHour)
  });
}
