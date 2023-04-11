const classService = require("../services/ClassService.js")

exports.getAllClasses = async (req, res) => {
    try {
        const classes = await classService.getAllClasses();
        res.json({data: classes, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.createClass = async (req, res) => {
    try {
        const clas = await classService.createClass(req.body);
        res.json({data: clas, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getClassById = async (req, res) => {
    try {
        const clas = await classService.getClassById(req.params.id);
        res.json({data: clas, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateClass = async (req, res) => {
    try {
        const clas = await classService.updateClass(req.params.id, req.body);
        res.json({data: clas, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const clas = await classService.deleteClass(req.params.id);
        res.json({data: clas, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};