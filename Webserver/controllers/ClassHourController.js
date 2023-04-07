const classHourService = require("../services/ClassHourService.js")

exports.getAllClassHours = async (req, res) => {
    try {
        const classHours = await classHourService.getAllSubjects();
        res.json({data: classHours, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.createClassHour = async (req, res) => {
    try {
        const classHour = await classHourService.createSubject(req.body);
        res.json({data: classHour, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getClassHourById = async (req, res) => {
    try {
        const classHour = await classHourService.getSubjectById();
        res.json({data: classHour, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateClassHour = async (req, res) => {
    try {
        const classHour = await classHourService.updateSubject(req.params.id, req.body);
        res.json({data: classHour, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.deleteClassHour = async (req, res) => {
    try {
        const classHour = await classHourService.deleteSubject(req.params.id);
        res.json({data: classHour, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};