const locationService = require("../services/LocationService.js")

exports.getAllLocations = async (req, res) => {
    try {
        const locations = await locationService.getAllLocations();
        res.json({data: locations, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.createLocation = async (req, res) => {
    try {
        const location = await locationService.createLocation(req.body);
        res.json({data: location, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getLocationById = async (req, res) => {
    try {
        const location = await locationService.getLocationById(req.params.id);
        res.json({data: location, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const location = await locationService.updateLocation(req.params.id, req.body);
        res.json({data: location, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const location = await locationService.deleteLocation(req.params.id);
        res.json({data: location, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message, alma: req});
    }
};