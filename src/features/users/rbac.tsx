import type { ReactNode } from 'react'
import type { Permission } from './permissions'
import { useDemoRole } from './useDemoRole'

/** Hide a protected view when the selected demo role lacks its required capability. */
export function PermissionGate({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can } = useDemoRole()
  if (!can(permission)) {
    return <div className="page-content"><div className="panel placeholder-panel"><h2>Access restricted</h2><p>Your current demo role does not have permission to view this page. Choose an admin or moderator role in the top bar to continue.</p></div></div>
  }
  return children
}
