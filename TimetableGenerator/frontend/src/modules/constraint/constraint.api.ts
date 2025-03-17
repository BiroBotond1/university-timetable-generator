import fetchService from "../app/fetch.service";

export const fetchConstraints = async () => {
  const response = await fetchService.fetchWithAuth('constraints');
  const constraints = await response.json();
  return constraints.data
}