import type { AuthenticatedUser } from './types'

/** Application authorization roles assigned independently from DummyJSON user.role. */
export type AppRole = 'ADMIN' | 'MODERATOR' | 'USER'

/** Explicit demo assignments keyed by DummyJSON user id; the API role field is never trusted here. */
export const demoRoleAssignments: Readonly<Record<number, AppRole>> = {
  1: 'ADMIN',
  2: 'MODERATOR',
  3: 'USER',
}

/** Resolve a local application role for an authenticated API identity. */
export function getDemoRole(user: Pick<AuthenticatedUser, 'id'>): AppRole {
  return demoRoleAssignments[user.id] ?? 'USER'
}

/** Return each role's first route after a successful login. */
export function getRoleLandingPath(role: AppRole): string {
  return role === 'USER' ? '/shop' : '/admin/dashboard'
}
