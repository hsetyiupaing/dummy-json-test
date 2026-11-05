import { createContext } from 'react'
import type { AuthenticatedUser, LoginCredentials } from './types'

/** Public authentication state shared by protected routes and application layouts. */
export interface AuthContextValue {
  user: AuthenticatedUser | null
  isRestoring: boolean
  login: (credentials: LoginCredentials) => Promise<AuthenticatedUser>
  logout: () => void
}

/** Context object remains separate from the provider component for Fast Refresh. */
export const AuthContext = createContext<AuthContextValue | null>(null)
