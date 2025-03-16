import type { LocationData } from "../location/location.type"

export interface SubjectData {
  _id: string,
  name: string,
  locations: LocationData[]
}