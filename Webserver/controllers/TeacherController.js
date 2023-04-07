const teacherService = require("../services/TeacherService.js")

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await teacherService.getAllSubjects();
        res.json({data: teachers, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.createTeacher = async (req, res) => {
    try {
        const teacher = await teacherService.createSubject(req.body);
        res.json({data: teacher, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await teacherService.getSubjectById();
        res.json({data: teacher, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const teacher = await teacherService.updateSubject(req.params.id, req.body);
        res.json({data: teacher, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await teacherService.deleteSubject(req.params.id);
        res.json({data: teacher, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};