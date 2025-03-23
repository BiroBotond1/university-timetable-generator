import constraintService from '../services/constraintService.js'
import classService from '../services/ClassService.js' 
import locationService from '../services/LocationService.js' 
import subjectService from '../services/subjectService.js' 
import teacherService from '../services/TeacherService.js'
import classHourService from '../services/ClassHourService.js'    

export async function getTimetableData()
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

export async function doImport(data) 
{
  const dataObj = JSON.parse(data)
  await updateConstraints(dataObj)
  await classService.import(dataObj.classes)
  await teacherService.import(dataObj.teachers)
  await subjectService.import(dataObj.subjects)
  await locationService.import(dataObj.locations)
  await classHourService.import(dataObj.classHours)
}

async function updateConstraints(dataObj) {
  await constraintService.updateConstraintByName('OneTypeOfCourseOnADayClass', dataObj.OneTypeOfCourseOnADayClass)
  await constraintService.updateConstraintByName('ClassCoursesStartsAtEight', dataObj.ClassCoursesStartsAtEight)
  await constraintService.updateConstraintByName('NoHoleHoursInClass', dataObj.NoHoleHoursInClass)
  await constraintService.updateConstraintByName('EvenHoursInClass', dataObj.EvenHoursInClass)
  await constraintService.updateConstraintByName('NoHoleHoursInTeacher', dataObj.NoHoleHoursInTeacher)
  await constraintService.updateConstraintByName('EvenHoursInTeacher', dataObj.EvenHoursInTeacher)
  await constraintService.updateConstraintByName('CoursesWeightInClass', dataObj.CoursesWeightInClass)
}

