import { useContext } from 'react'
import { DemoRoleContext } from './roleContext'
import { roleCan } from './permissions'
import type { Permission } from './permissions'

/** Read the current demo role and its permission-check helper. */
export function useDemoRole() {
  const context = useContext(DemoRoleContext)
  if (!context) throw new Error('useDemoRole must be used inside DemoRoleProvider')
  return { ...context, can: (permission: Permission) => roleCan(context.role, permission) }
}
