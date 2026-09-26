import fetchService from "../app/fetch.service";
import { scoped } from "../app/project.scope";

export const fetchSubjects = async () => {
  const response = await fetchService.fetchWithAuth(scoped('subjects'));
  const subjects = await response.json();
  return subjects.data
}