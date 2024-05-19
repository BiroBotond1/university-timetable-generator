const subjectService = require("../services/SubjectService.js")

exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await subjectService.getAllSubjects();
        res.json({data: subjects, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.createSubject = async (req, res) => {
    try {
        const subject = await subjectService.createSubject(req.body);
        res.status(201).json({data: subject, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getSubjectById = async (req, res) => {
    try {
        const subject = await subjectService.getSubjectById(req.params.id);
        if(!subject) {
            return res.status(404).json({ error: "Subject not found"})
        }
        res.json({data: subject, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const subject = await subjectService.updateSubject(req.params.id, req.body);
        if(!subject) {
            return res.status(404).json({ error: "Subject not found"})
        }
        res.json({data: subject, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const subject = await subjectService.deleteSubject(req.params.id);
        if(!subject) {
            return res.status(404).json({ error: "Subject not found"})
        }
        res.json({data: subject, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};