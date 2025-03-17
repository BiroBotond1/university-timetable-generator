import fetchService from "../app/fetch.service";

export const fetchClasses = async () => {
  const response = await fetchService.fetchWithAuth('classes');
  const classes = await response.json();
  return classes.data
}

export const fetchClass = async (id: string) => {
  const response = await fetchService.fetchWithAuth('classes/' + id);
  const classes = await response.json();
  return classes.data
}