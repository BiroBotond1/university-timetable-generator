const classService = require("../services/ClassService.js")

exports.getAllClasses = async (req, res) => {
    try {
        const classes = await classService.getAllSubjects();
        res.json({data: classes, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.createClass = async (req, res) => {
    try {
        const clas = await classService.createSubject(req.body);
        res.json({data: clas, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getClassById = async (req, res) => {
    try {
        const clas = await classService.getSubjectById();
        res.json({data: clas, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateClass = async (req, res) => {
    try {
        const clas = await classService.updateSubject(req.params.id, req.body);
        res.json({data: clas, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const clas = await classService.deleteSubject(req.params.id);
        res.json({data: clas, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};