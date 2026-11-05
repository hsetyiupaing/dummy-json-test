/** Authenticated profile and tokens returned by DummyJSON's login endpoint. */
export interface AuthenticatedUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender?: string
  image?: string
  accessToken: string
  refreshToken: string
}

/** Inputs collected by the username-first login screen. */
export interface LoginCredentials {
  username: string
  password: string
  remember: boolean
}
