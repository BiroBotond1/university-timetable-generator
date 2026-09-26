import fetchService from "../app/fetch.service";
import { scoped } from "../app/project.scope";

export const fetchConstraints = async () => {
  const response = await fetchService.fetchWithAuth(scoped('constraints'));
  const constraints = await response.json();
  return constraints.data
}