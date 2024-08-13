const { LocationModel } = require('../models/Location.js');

exports.getAllLocations = async () => {
  return await LocationModel.find();
};

exports.createLocation = async (location) => {
  return await LocationModel.create(location);
};

exports.getLocationById = async (id) => {
  return await LocationModel.findById(id);
};

exports.updateLocation = async (id, location) => {
  return await LocationModel.findByIdAndUpdate(id, location);
};

exports.deleteLocation = async (id) => {
  return await LocationModel.findByIdAndRemove(id);
};

exports.addCatalog = async (id, catalog) => {
  const location = await LocationModel.findById(id);
  location.catalog = catalog;
  return await LocationModel.findByIdAndUpdate(id, location);
};
