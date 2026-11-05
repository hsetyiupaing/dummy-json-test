import { createContext } from 'react'
import type { UserRole } from './types/user'

/** Context value shared by the visible demo role selector and route guards. */
export interface DemoRoleValue {
  role: UserRole
  setRole: (role: UserRole) => void
}

/** Hold the selected demo role without coupling components to a default role. */
export const DemoRoleContext = createContext<DemoRoleValue | null>(null)
