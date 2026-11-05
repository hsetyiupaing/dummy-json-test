import { api } from '../../lib/api'
import type { AuthenticatedUser, LoginCredentials } from './types'

interface UsernameLookupResponse {
  users: Array<{ email: string; username: string }>
}

/** Resolve the requested email to DummyJSON's username-only auth credential. */
async function findUsernameByEmail(email: string): Promise<string> {
  const response = await api.get<UsernameLookupResponse>('/users/filter', {
    params: { key: 'email', value: email.trim().toLowerCase(), select: 'email,username' },
  })
  const user = response.data.users.find(candidate => candidate.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) throw new Error('No DummyJSON account was found for this email address.')
  return user.username
}

/** Authenticate with DummyJSON and return its real profile and token response. */
export async function loginWithEmail(credentials: LoginCredentials): Promise<AuthenticatedUser> {
  const username = await findUsernameByEmail(credentials.email)
  const response = await api.post<AuthenticatedUser>('/auth/login', {
    username,
    password: credentials.password,
    expiresInMins: credentials.remember ? 60 : 15,
  }, { withCredentials: true })
  return response.data
}
