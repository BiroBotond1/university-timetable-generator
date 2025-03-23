const { TeacherModel } = require('../models/Teacher.js');

exports.getAllTeachers = async () => {
  return await TeacherModel.find();
};

exports.createTeacher = async (teacher) => {
  return await TeacherModel.create(teacher);
};

exports.getTeacherById = async (id) => {
  return await TeacherModel.findById(id);
};

exports.updateTeacher = async (id, teacher) => {
  return await TeacherModel.findByIdAndUpdate(id, teacher);
};

exports.deleteTeacher = async (id) => {
  return await TeacherModel.findByIdAndRemove(id);
};

exports.addCatalog = async (id, catalog) => {
  const teacher = await TeacherModel.findById(id);
  teacher.catalog = catalog;
  return await TeacherModel.findByIdAndUpdate(id, teacher);
};

exports.import = async (teachers) => {
  await TeacherModel.deleteMany();

  teachers.forEach(async teacher => {
    await this.createTeacher(teacher)
  });
}