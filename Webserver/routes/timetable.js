const { Router } =  require('express');
const {exec, spawn} = require('child_process');
const fs = require('fs');
const classService = require("../services/ClassService.js")
const classHourService = require("../services/ClassHourService.js")
const locationService = require("../services/LocationService.js")
const subjectService = require("../services/SubjectService.js")
const teacherService = require("../services/TeacherService.js")

const router = Router();

function os_func() {
    this.execCommand = function (cmd) {
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if(error) {
                    reject(error)
                }
                resolve(stdout)
            });
        })
    }
}

var os = new os_func();

router.post('/proba', async (req, res) => {
    try {
        req.body.classes = await classService.getAllClasses()
        req.body.classHours = await classHourService.getAllClassHours()
        req.body.locations = await locationService.getAllLocations()
        req.body.subjects = await subjectService.getAllSubjects()
        req.body.teachers = await teacherService.getAllTeachers()
        let obj = JSON.stringify(req.body);
        fs.writeFileSync("../TimetableGeneratorEngine/TimetableGenerator/in.json", obj);

        os.execCommand("TimetableGenerator.exe").then(res => {
            console.log("success");
            let catalogs = JSON.parse(res)
            for(var classID in catalogs["classCatalogs"]) {
                classService.addCatalog(classID, catalogs["classCatalogs"][classID])
            }
            console.log(catalogs["classCatalogs"]["64345ae910265ba598272415"])
        }).catch(err => {
            console.log("os >>>", err)
        })
    } catch (e) {
        console.log(e)
    }
});


module.exports = router;