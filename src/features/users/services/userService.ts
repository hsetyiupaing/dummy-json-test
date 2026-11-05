import { api } from '../../../lib/api'
import type { UsersResponse } from '../types/user'

// Request only directory fields so passwords, payment data, and private profile details are not loaded.
const userDirectoryFields = 'id,firstName,lastName,email,username,image,role'

/** Load the user directory without sensitive account or financial fields. */
export async function getUsers(): Promise<UsersResponse> {
  const response = await api.get<UsersResponse>('/users', {
    params: { limit: 0, select: userDirectoryFields },
  })
  return response.data
}

/** Search the directory through DummyJSON while keeping the response restricted to safe fields. */
export async function searchUsers(query: string): Promise<UsersResponse> {
  const response = await api.get<UsersResponse>('/users/search', {
    params: { q: query, limit: 0, select: userDirectoryFields },
  })
  return response.data
}
