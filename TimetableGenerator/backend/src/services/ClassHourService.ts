import model from '../models/ClassHour.js'

export const getAll = async () => {
  return await model.find();
};

export const create = async (classHour) => {
  return await model.create(classHour);
};

export const getById = async (id) => {
  return await model.findById(id);
};

export const update = async (id, classHour) => {
  return await model.findByIdAndUpdate(id, classHour);
};

export const deleteById = async (id) => {
  return await model.findByIdAndRemove(id);
};

export const isClassUsed = async (classId) => {
  const classHourWithClass = await model.findOne({
    'class._id': classId
  });

  return classHourWithClass !== null;
};

export const isTeacherUsed = async (teacherId) => {
  const classHourWithTeacher = await model.findOne({
    'teacher._id': teacherId
  });

  return classHourWithTeacher !== null;
};

export const isSubjectUsed = async (subjectId) => {
  const classHourWithSubject = await model.findOne({
    'subject._id': subjectId
  });

  return classHourWithSubject !== null;
};

export const imp = async (classHours) => {
  await model.deleteMany();

  classHours.forEach(async classHour => {
    await create(classHour)
  });
}