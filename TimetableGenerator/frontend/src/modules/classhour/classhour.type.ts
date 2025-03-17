import type { ClassData } from "../class/class.type"
import type { SubjectData } from "../subject/subject.type"
import type { TeacherData } from "../teacher/teacher.type"
import type { LocationData } from "../location/location.type"

export interface ClassHourData {
  _id: string,
  class: ClassData,
  subject: SubjectData,
  teacher: TeacherData,
  number: number, 
  weight: number
}

export interface EditClassHourData {
  _id: string | undefined,
  class: ClassData | undefined,
  subject: SubjectData | undefined,
  teacher: TeacherData | undefined,
  number: number | undefined, 
  weight: number | undefined
}

export interface ClassHourShowData {
  class: ClassData | undefined,
  subject: SubjectData | undefined,
  teacher: TeacherData | undefined,
  location: LocationData | undefined 
}