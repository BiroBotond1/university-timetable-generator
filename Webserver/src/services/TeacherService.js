const { TeacherModel } = require('../models/Teacher.js');

exports.getAllTeachers = async () => {
  return await TeacherModel.find();
};

exports.createTeacher = async (teacher) => {
  return await TeacherModel.create(teacher);
};

exports.getTeacherById = async (id) => {
  console.log("Service: getTeacherById " + id)
  //here the id will be {"$ne":null}
  // return await TeacherModel.findById(id);
  const teacher = await TeacherModel.findOne({ _id: id });
  console.log('Teacher: ' + teacher)

  return await TeacherModel.findOne({ _id: id }); // Vulnerable to NoSQL injection
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
