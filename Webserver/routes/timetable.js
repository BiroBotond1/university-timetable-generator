import { Router } from 'express';
import Course from '../models/Courses.js';
import {exec, spawn} from 'child_process';
import fs from 'fs';

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

router.get('/', async (req, res) => {
    const courses = await Course.find();

    res.json(courses);
});

router.post('/', async (req, res) => {
    const course = new Course(req.body);

    const savedCourse = await course.save();

    res.json(savedCourse);
});

router.post('/proba', async (req, res) => {
    try {
        console.log(req.body);
        let obj = JSON.stringify(req.body);
        fs.writeFileSync("../TimetableGeneratorEngine/TimetableGenerator/in.json", obj);
        //exec("TimetableGenerator.exe")
        os.execCommand("TimetableGenerator.exe").then(res => {
            console.log("os >>>", res);
        }).catch(err => {
            console.log("os >>>", err)
        })
        res.json(req.body);
    } catch (e) {
        console.log(e)
    }
});

//Get specific course
router.get('/get:id', async (req, res) => {
    const q = await Course.findById({_id: req.params.id});
    req.json(q);
})


export default router;