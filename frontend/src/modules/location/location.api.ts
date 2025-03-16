import fetchService from "../app/fetch.service";

export const fetchLocations = async () => {
  const response = await fetchService.fetchWithAuth('locations');
  const locations = await response.json();
  return locations.data
}

export const fetchLocation = async (id: string) => {
  const response = await fetchService.fetchWithAuth('locations/' + id);
  const location = await response.json();
  return location.data
}