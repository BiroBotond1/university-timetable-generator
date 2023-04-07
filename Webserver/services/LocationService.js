const { LocationModel }= require("../models/Location.js")

exports.getAllLocations = async () => {
    return await LocationModel.find();
};

exports.createLocation = async (teacher) => {
    return await LocationModel.create(teacher);
};

exports.getLocationById = async (id) => {
    return await LocationModel.findById(id);
};

exports.updateLocation = async (id, teacher) => {
    return await LocationModel.findByIdAndUpdate(id, teacher);
};

exports.deleteLocation = async (id) => {
    return await LocationModel.findByIdAndRemove(id);
}