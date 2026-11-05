import type { UserRole } from './types/user'

/** UI permissions are grouped by DummyJSON's seeded role names. */
export type Permission = 'viewProducts' | 'createProducts' | 'updateProducts' | 'deleteProducts' | 'viewUsers' | 'manageUsers'

const rolePermissions: Record<UserRole, readonly Permission[]> = {
  admin: ['viewProducts', 'createProducts', 'updateProducts', 'deleteProducts', 'viewUsers', 'manageUsers'],
  moderator: ['viewProducts', 'createProducts', 'updateProducts', 'viewUsers'],
  user: ['viewProducts'],
}

/** Check one role against the front-end permission policy. */
export function roleCan(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission)
}
