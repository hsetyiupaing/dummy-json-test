import { useQuery } from '@tanstack/react-query'
import { getUsers, searchUsers } from '../services/userService'

/** Cache directory results by search term for responsive navigation between admin pages. */
export function useUsers(searchTerm: string) {
  return useQuery({
    queryKey: ['users', 'directory', searchTerm],
    queryFn: () => searchTerm ? searchUsers(searchTerm) : getUsers(),
    staleTime: 60_000,
  })
}
