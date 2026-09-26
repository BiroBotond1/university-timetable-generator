import * as constraintService from './ConstraintService.js'
import * as classService from './ClassService.js' 
import * as locationService from './LocationService.js' 
import * as subjectService from './SubjectService.js' 
import * as teacherService from './TeacherService.js'
import * as classHourService from './ClassHourService.js'    

export async function getTimetableData(projectId)
{
  const object = {};

  // Fetch constraints and add to object
  const constraints = await constraintService.getAll();
  constraints.forEach((constraint) => {
    object[constraint.name] = constraint.active;
  });

  // Fetch other data and add to object
  object.classes = await classService.getAll(projectId);
  object.classHours = await classHourService.getAll(projectId);
  object.locations = await locationService.getAll(projectId);
  object.subjects = await subjectService.getAll(projectId);
  object.teachers = await teacherService.getAll(projectId);

  return JSON.stringify(object);
}

export async function doImport(projectId, data) 
{
  const dataObj = JSON.parse(data)
  await updateConstraints(dataObj)
  await classService.imp(projectId, dataObj.classes)
  await teacherService.imp(projectId, dataObj.teachers)
  await subjectService.imp(projectId, dataObj.subjects)
  await locationService.imp(projectId, dataObj.locations)
  await classHourService.imp(projectId, dataObj.classHours)
}

async function updateConstraints(dataObj) {
  await constraintService.updateByName('OneTypeOfCourseOnADayClass', dataObj.OneTypeOfCourseOnADayClass)
  await constraintService.updateByName('ClassCoursesStartsAtEight', dataObj.ClassCoursesStartsAtEight)
  await constraintService.updateByName('NoHoleHoursInClass', dataObj.NoHoleHoursInClass)
  await constraintService.updateByName('EvenHoursInClass', dataObj.EvenHoursInClass)
  await constraintService.updateByName('NoHoleHoursInTeacher', dataObj.NoHoleHoursInTeacher)
  await constraintService.updateByName('EvenHoursInTeacher', dataObj.EvenHoursInTeacher)
  await constraintService.updateByName('CoursesWeightInClass', dataObj.CoursesWeightInClass)
}