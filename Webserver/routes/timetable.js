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

        os.execCommand("TimetableGenerator.exe").then(result => {
            console.log("success");
            let catalogs = JSON.parse(result)
            console.log(catalogs.active)
            for(var classID in catalogs["classCatalogs"]) {
                classService.addCatalog(classID, catalogs["classCatalogs"][classID])
            }
            for(var teacherID in catalogs["teacherCatalogs"]) {
                teacherService.addCatalog(teacherID, catalogs["teacherCatalogs"][teacherID])
            }
            for(var locationID in catalogs["locationCatalogs"]) {
                locationService.addCatalog(locationID, catalogs["locationCatalogs"][locationID])
            }
            res.sendStatus(200);
        }).catch(err => {
            console.log("os >>>", err)
        })
    } catch (e) {
        console.log(e)
    }
});


module.exports = router;