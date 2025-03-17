import fetchService from "../app/fetch.service";

export const fetchClassHours = async () => {
  const response = await fetchService.fetchWithAuth('classHours');
  const classHours = await response.json();
  return classHours.data
}