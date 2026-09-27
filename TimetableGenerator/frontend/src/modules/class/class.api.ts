import fetchService from "../app/fetch.service";
import { scoped } from "../app/project.scope";

export const fetchClasses = async () => {
  const response = await fetchService.fetchWithAuth(scoped('classes'));
  const classes = await response.json();
  return classes.data
}

export const fetchClass = async (id: string) => {
  const response = await fetchService.fetchWithAuth(scoped(`classes/${id}`));
  const classes = await response.json();
  return classes.data
}