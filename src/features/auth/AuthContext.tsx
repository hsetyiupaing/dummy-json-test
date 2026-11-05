import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getCurrentUser, login as loginRequest } from './authService'
import { clearStoredSession, readStoredSession, writeStoredSession } from './authStorage'
import type { AuthenticatedUser, LoginCredentials, StoredAuthSession } from './types'
import { AuthContext } from './authContext'
const savedAtStartup = readStoredSession()

/** Restore validated identity on boot and publish login/logout operations to the application. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [isRestoring, setIsRestoring] = useState(savedAtStartup !== null)

  useEffect(() => {
    if (!savedAtStartup) return
    let active = true
    void getCurrentUser(savedAtStartup.accessToken)
      .then(currentUser => {
        if (!active) return
        const refreshedSession: StoredAuthSession = { ...savedAtStartup, user: currentUser }
        writeStoredSession(refreshedSession)
        setUser(currentUser)
      })
      .catch(() => clearStoredSession())
      .finally(() => { if (active) setIsRestoring(false) })
    return () => { active = false }
  }, [])

  // The auth provider owns API identity and tokens; authorization derives role separately.
  const login = useCallback(async (credentials: LoginCredentials) => {
    clearStoredSession()
    const response = await loginRequest(credentials)
    const { accessToken, refreshToken, ...profile } = response
    writeStoredSession({ user: profile, accessToken, refreshToken, remember: credentials.remember })
    setUser(profile)
    return profile
  }, [])

  // Logout clears local bearer credentials; DummyJSON does not provide a server logout endpoint.
  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, isRestoring, login, logout }), [user, isRestoring, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

