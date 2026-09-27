import fetchService from "../app/fetch.service";
import { scoped } from "../app/project.scope";
import type { GenerationRunData } from "./generation.type";

// The 20 newest runs of the open project, newest first.
export const fetchGenerationRuns = async (): Promise<GenerationRunData[]> => {
  const response = await fetchService.fetchWithAuth(scoped('generation-runs'));
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error ?? 'Request failed');
  }

  return body.data;
}
