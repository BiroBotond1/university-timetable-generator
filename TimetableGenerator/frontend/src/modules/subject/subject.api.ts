import fetchService from "../app/fetch.service";

export const fetchSubjects = async () => {
  const response = await fetchService.fetchWithAuth('subjects');
  const subjects = await response.json();
  return subjects.data
}