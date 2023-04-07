const express = require("express");
const {
    getAllTeachers,
    createTeacher,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
} = require("../controllers/TeacherController.js");

const router = express.Router();

router.route("/").get(getAllTeachers).post(createTeacher);
router.route("/:id").get(getTeacherById).put(updateTeacher).delete(deleteTeacher);

module.exports = router;