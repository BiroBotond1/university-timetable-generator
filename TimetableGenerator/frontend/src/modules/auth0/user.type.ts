export interface UserData {
  auth0Id: string,
  username: string,
  email: string
}

/** The Mongo user document returned by the server after a successful sync. */
export interface SyncedUser {
  _id: string,
  auth0Id: string,
  username?: string,
  email?: string
}
