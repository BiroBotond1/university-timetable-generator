const locationService = require("../services/LocationService.js")

exports.getAllLocations = async (req, res) => {
    try {
        const locations = await locationService.getAllSubjects();
        res.json({data: locations, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.createLocation = async (req, res) => {
    try {
        const location = await locationService.createSubject(req.body);
        res.json({data: location, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getLocationById = async (req, res) => {
    try {
        const location = await locationService.getSubjectById();
        res.json({data: location, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const location = await locationService.updateSubject(req.params.id, req.body);
        res.json({data: location, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const location = await locationService.deleteSubject(req.params.id);
        res.json({data: location, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};