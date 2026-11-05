import { api } from '../../lib/api'
import type { AuthResponse, AuthenticatedUser, LoginCredentials } from './types'

/** Authenticate directly with DummyJSON's username and password endpoint. */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', {
    username: credentials.username.trim(),
    password: credentials.password,
    expiresInMins: credentials.remember ? 60 : 15,
  }, { withCredentials: true })
  return response.data
}

/** Validate a stored access token and return the API's current authenticated profile. */
export async function getCurrentUser(accessToken: string): Promise<AuthenticatedUser> {
  const response = await api.get<AuthenticatedUser>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    withCredentials: true,
  })
  return response.data
}
