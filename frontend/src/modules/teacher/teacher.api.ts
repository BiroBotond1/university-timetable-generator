import fetchService from "../app/fetch.service";

export const fetchTeachers = async () => {
  const response = await fetchService.fetchWithAuth('teachers');
  const teachers = await response.json();
  return teachers.data
}

export const fetchTeacher = async (id: string) => {
  const response = await fetchService.fetchWithAuth('teachers/' + id);
  const teacher = await response.json();
  return teacher.data
}