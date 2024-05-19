const teacherService = require("../services/TeacherService.js")

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await teacherService.getAllTeachers();
        res.json({data: teachers, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.createTeacher = async (req, res) => {
    try {
        const teacher = await teacherService.createTeacher(req.body);
        res.status(201).json({data: teacher, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await teacherService.getTeacherById(req.params.id);
        if(!teacher) {
            return res.status(404).json({ error: "Teacher not found"})
        }
        res.json({data: teacher, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const teacher = await teacherService.updateTeacher(req.params.id, req.body);
        if(!teacher) {
            return res.status(404).json({ error: "Teacher not found"})
        }
        res.json({data: teacher, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await teacherService.deleteTeacher(req.params.id);
        if(!teacher) {
            return res.status(404).json({ error: "Teacher not found"})
        }
        res.json({data: teacher, status: "success"});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};