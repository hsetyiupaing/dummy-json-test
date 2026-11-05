import { getDemoRole, type AppRole } from './demoRoles'
import { useAuth } from './useAuth'

/** Derive authorization from the authenticated identity without mixing it into AuthContext. */
export function useAuthorization(): { appRole: AppRole | null } {
  const { user } = useAuth()
  return { appRole: user ? getDemoRole(user) : null }
}
