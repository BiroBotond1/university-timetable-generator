import fetchService from "../app/fetch.service";
import { scoped } from "../app/project.scope";

export const fetchClassHours = async () => {
  const response = await fetchService.fetchWithAuth(scoped('classHours'));
  const classHours = await response.json();
  return classHours.data
}