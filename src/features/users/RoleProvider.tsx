import { useState, type ReactNode } from 'react'
import type { UserRole } from './types/user'
import { DemoRoleContext } from './roleContext'

/** Share a visible demo role across routes without introducing authentication. */
export function DemoRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('admin')
  return <DemoRoleContext.Provider value={{ role, setRole }}>{children}</DemoRoleContext.Provider>
}
