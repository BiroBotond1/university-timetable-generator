const { SubjectModel } = require('../models/Subject.js');

exports.getAllSubjects = async () => {
  return await SubjectModel.find();
};

exports.createSubject = async (subject) => {
  return await SubjectModel.create(subject);
};

exports.getSubjectById = async (id) => {
  return await SubjectModel.findById(id);
};

exports.updateSubject = async (id, subject) => {
  return await SubjectModel.findByIdAndUpdate(id, subject);
};

exports.deleteSubject = async (id) => {
  return await SubjectModel.findByIdAndRemove(id);
};

exports.isLocationUsed = async (locationId) => {
  const subjectWithLocation = await SubjectModel.findOne({
    locations: {
      $elemMatch: { _id : locationId }
    }
  });

  return subjectWithLocation !== null; 
};
