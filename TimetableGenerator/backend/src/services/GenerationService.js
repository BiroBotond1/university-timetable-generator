import { exec } from 'child_process'
import { writeFileSync } from 'fs';
import classService from './ClassService.js'
import locationService from './LocationService.js'
import teacherService from './TeacherService.js'
import { getTimetableData } from './ImportExportService.js';

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

export const generate = async () => {
  try {
    const inputString = await getTimetableData();
    await writeFileSync('../../TimetableGeneratorEngine/TimetableGenerator/in.json', inputString);
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
