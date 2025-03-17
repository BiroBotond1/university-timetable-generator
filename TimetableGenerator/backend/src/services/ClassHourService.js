const ClassHourModel = require('../models/ClassHour.js');

exports.getAllClassHours = async () => {
  return await ClassHourModel.find();
};

exports.createClassHour = async (classHour) => {
  return await ClassHourModel.create(classHour);
};

exports.getClassHourById = async (id) => {
  return await ClassHourModel.findById(id);
};

exports.updateClassHour = async (id, classHour) => {
  return await ClassHourModel.findByIdAndUpdate(id, classHour);
};

exports.deleteClassHour = async (id) => {
  return await ClassHourModel.findByIdAndRemove(id);
};

exports.isClassUsed = async (classId) => {
  const classHourWithClass = await ClassHourModel.findOne({
    'class._id': classId
  });

  return classHourWithClass !== null;
};

exports.isTeacherUsed = async (teacherId) => {
  const classHourWithTeacher = await ClassHourModel.findOne({
    'teacher._id': teacherId
  });

  return classHourWithTeacher !== null;
};

exports.isSubjectUsed = async (subjectId) => {
  const classHourWithSubject = await ClassHourModel.findOne({
    'subject._id': subjectId
  });

  return classHourWithSubject !== null;
};
