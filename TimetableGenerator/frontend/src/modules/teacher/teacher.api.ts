import fetchService from "../app/fetch.service";
import { scoped } from "../app/project.scope";

export const fetchTeachers = async () => {
  const response = await fetchService.fetchWithAuth(scoped('teachers'));
  const teachers = await response.json();
  return teachers.data
}

export const fetchTeacher = async (id: string) => {
  const response = await fetchService.fetchWithAuth(scoped(`teachers/${id}`));
  const teacher = await response.json();
  return teacher.data
}