import fetchService from "../app/fetch.service";
import { scoped } from "../app/project.scope";

export const fetchLocations = async () => {
  const response = await fetchService.fetchWithAuth(scoped('locations'));
  const locations = await response.json();
  return locations.data
}

export const fetchLocation = async (id: string) => {
  const response = await fetchService.fetchWithAuth(scoped(`locations/${id}`));
  const location = await response.json();
  return location.data
}