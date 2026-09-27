export interface UserData {
  auth0Id: string,
  username: string,
  email: string
}

export interface SyncedUser {
  _id: string,
  auth0Id: string,
  username?: string,
  email?: string
}
