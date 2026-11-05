import { useContext } from 'react'
import { AuthContext } from './authContext'

/** Read centralized authentication state and actions. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
