import { api } from '../../lib/api'
import type { AuthenticatedUser, LoginCredentials } from './types'

/** Authenticate directly with DummyJSON's username and password endpoint. */
export async function login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
  const response = await api.post<AuthenticatedUser>('/auth/login', {
    username: credentials.username.trim(),
    password: credentials.password,
    expiresInMins: credentials.remember ? 60 : 15,
  }, { withCredentials: true })
  return response.data
}
