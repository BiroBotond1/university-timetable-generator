const { exec } = require('child_process');
const fs = require('fs');
const classService = require('./ClassService.js');
const classHourService = require('./ClassHourService.js');
const locationService = require('./LocationService.js');
const subjectService = require('./SubjectService.js');
const teacherService = require('./TeacherService.js');
const constraintService = require('./ConstraintService.js');

function OsFunction () {
  this.execCommand = function (cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      });
    });
  };
}

const osFunc = new OsFunction();

exports.generate = async () => {
  try {
    
    const inputString = await createInputString();
    await fs.writeFileSync('../TimetableGeneratorEngine/TimetableGenerator/in.json', inputString);
    await osFunc.execCommand('TimetableGenerator.exe').then(async result => {
      const catalogs = JSON.parse(result);
      console.log(`Active: ${  catalogs.active}`);
      console.log(`Class fitnes: ${  catalogs.fitnesClas}`);
      console.log(`Teacher fitnes: ${  catalogs.fitnesTeacher}`);
      console.log(`Location fitnes: ${  catalogs.fitnesLocation}`);
      console.log(`Elapsed time: ${  catalogs.elapsedTime}`);

      await updateCatalogs(catalogs);
    }).catch(err => {
      console.log('os >>>', err);
    });
  } catch (e) {
    console.log(e);
  }
}

async function createInputString()
{
  const object = {};

  // Fetch constraints and add to object
  const constraints = await constraintService.getAllConstraints();
  constraints.forEach((constraint) => {
    object[constraint.name] = constraint.active;
  });

  // Fetch other data and add to object
  object.classes = await classService.getAllClasses();
  object.classHours = await classHourService.getAllClassHours();
  object.locations = await locationService.getAllLocations();
  object.subjects = await subjectService.getAllSubjects();
  object.teachers = await teacherService.getAllTeachers();

  return JSON.stringify(object);
}

async function updateCatalogs(catalogs) {
  for (const classID in catalogs.classCatalogs) {
    await classService.addCatalog(classID, catalogs.classCatalogs[classID]);
  }
  for (const teacherID in catalogs.teacherCatalogs) {
    await teacherService.addCatalog(teacherID, catalogs.teacherCatalogs[teacherID]);
  }
  for (const locationID in catalogs.locationCatalogs) {
    await locationService.addCatalog(locationID, catalogs.locationCatalogs[locationID]);
  }
}
