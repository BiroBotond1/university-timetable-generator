import fetchService from "../app/fetch.service";
import type {
  ProjectData,
  ProjectInvitationData,
  ProjectMemberData
} from "./project.type";

const unwrap = async (response: Response) => {
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error ?? 'Request failed');
  }

  return body.data;
}

export const fetchProjects = async (): Promise<ProjectData[]> => {
  return unwrap(await fetchService.fetchWithAuth('projects'));
}

export const fetchProject = async (id: string): Promise<ProjectData> => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}`));
}

export const createProject = async (name: string): Promise<ProjectData> => {
  return unwrap(await fetchService.fetchWithAuth('projects', {
    method: 'POST',
    body: JSON.stringify({ name })
  }));
}

export const renameProject = async (id: string, name: string): Promise<ProjectData> => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name })
  }));
}

export const deleteProject = async (id: string): Promise<ProjectData> => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}`, {
    method: 'DELETE'
  }));
}

export const fetchMembers = async (id: string): Promise<ProjectMemberData[]> => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}/members`));
}

export const inviteMember = async (id: string, email: string): Promise<ProjectMemberData> => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}/members`, {
    method: 'POST',
    body: JSON.stringify({ email })
  }));
}

export const removeMember = async (id: string, userId: string): Promise<ProjectMemberData> => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}/members/${userId}`, {
    method: 'DELETE'
  }));
}

export const revokeInvitation = async (id: string, memberId: string): Promise<ProjectMemberData> => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}/invitations/${memberId}`, {
    method: 'DELETE'
  }));
}

export const leaveProject = async (id: string): Promise<ProjectMemberData> => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}/leave`, {
    method: 'POST'
  }));
}

export const transferOwnership = async (id: string, userId: string): Promise<ProjectData> => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}/ownership`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  }));
}

export const fetchInvitations = async (): Promise<ProjectInvitationData[]> => {
  return unwrap(await fetchService.fetchWithAuth('projects/invitations'));
}

export const respondToInvitation = async (id: string, accept: boolean) => {
  return unwrap(await fetchService.fetchWithAuth(`projects/${id}/invitation`, {
    method: 'POST',
    body: JSON.stringify({ accept })
  }));
}
