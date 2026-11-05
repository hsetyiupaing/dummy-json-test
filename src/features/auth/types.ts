/** Profile fields returned by DummyJSON login and current-user endpoints. */
export interface AuthenticatedUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender?: string
  image?: string
}

/** Authentication credentials returned by the login endpoint, kept out of profile props. */
export interface AuthResponse extends AuthenticatedUser {
  accessToken: string
  refreshToken: string
}

/** Inputs collected by the username-first login screen. */
export interface LoginCredentials {
  username: string
  password: string
  remember: boolean
}

/** Data stored locally to restore a session across refreshes. */
export interface StoredAuthSession {
  user: AuthenticatedUser
  accessToken: string
  refreshToken: string
  remember: boolean
}
