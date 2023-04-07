const {ClassModel} = require("../models/Class.js")

exports.getAllClasses = async () => {
    return await ClassModel.find();
};

exports.createClass = async (clas) => {
    return await ClassModel.create(clas);
};

exports.getClassById = async (id) => {
    return await ClassModel.findById(id);
};

exports.updateClass = async (id, clas) => {
    return await ClassModel.findByIdAndUpdate(id, clas);
};

exports.deleteClass = async (id) => {
    return await ClassModel.findByIdAndRemove(id);
}