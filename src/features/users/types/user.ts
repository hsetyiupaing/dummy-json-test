/** Roles supported by the users endpoint and used by the UI permission matrix. */
export type UserRole = 'admin' | 'moderator' | 'user'

/** Safe user directory fields; sensitive profile and payment data are not requested. */
export interface DirectoryUser {
  id: number
  firstName: string
  lastName: string
  email: string
  username: string
  image: string
  role: UserRole
}

/** Paginated envelope returned by DummyJSON users list and search endpoints. */
export interface UsersResponse {
  users: DirectoryUser[]
  total: number
  skip: number
  limit: number
}
