const ClassHourModel = require("../models/ClassHour.js")

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
}