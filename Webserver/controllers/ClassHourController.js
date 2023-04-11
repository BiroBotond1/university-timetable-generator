const classHourService = require("../services/ClassHourService.js")

exports.getAllClassHours = async (req, res) => {
    try {
        const classHours = await classHourService.getAllClassHours();
        res.json({data: classHours, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.createClassHour = async (req, res) => {
    try {
        const classHour = await classHourService.createClassHour(req.body);
        res.json({data: classHour, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getClassHourById = async (req, res) => {
    try {
        const classHour = await classHourService.getClassHourById(req.params.id);
        res.json({data: classHour, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateClassHour = async (req, res) => {
    try {
        const classHour = await classHourService.updateClassHour(req.params.id, req.body);
        res.json({data: classHour, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.deleteClassHour = async (req, res) => {
    try {
        const classHour = await classHourService.deleteClassHour(req.params.id);
        res.json({data: classHour, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};