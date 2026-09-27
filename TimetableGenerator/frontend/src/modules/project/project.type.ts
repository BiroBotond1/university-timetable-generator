export type ProjectRole = 'owner' | 'collaborator'

export interface ProjectData {
  _id: string,
  name: string,
  owner: string,
  role?: ProjectRole,
  generationStatus?: 'idle' | 'queued' | 'running',
  generationStartedAt?: string | null,
  createdAt?: string,
  updatedAt?: string
}

export interface ProjectMemberData {
  _id: string,
  project: string,
  user: { _id: string, username?: string, email?: string } | null,
  email: string | null,
  role: ProjectRole,
  status: 'pending' | 'active' | 'declined'
}

export interface ProjectInvitationData extends ProjectMemberData {
  project: any,
  invitedBy: { _id: string, username?: string, email?: string } | null
}
