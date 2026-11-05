import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getRoleLandingPath, type AppRole } from './demoRoles'
import { useAuth } from './useAuth'
import { useAuthorization } from './useAuthorization'

/** Keep route contents hidden until any persisted session has been checked with DummyJSON. */
function AuthLoading() {
  return <main className="auth-loading" role="status"><span className="login-spinner"/> Restoring your session…</main>
}

/** Require a valid DummyJSON session and optionally limit the route to selected app roles. */
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: readonly AppRole[] }) {
  const { user, isRestoring } = useAuth()
  const { appRole } = useAuthorization()
  const location = useLocation()
  if (isRestoring) return <AuthLoading/>
  if (!user || !appRole) return <Navigate to="/login" replace state={{ from: location.pathname }}/>
  if (roles && !roles.includes(appRole)) return <Navigate to={getRoleLandingPath(appRole)} replace/>
  return children
}

/** Send signed-in visitors away from login and back to their role's landing page. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const { user, isRestoring } = useAuth()
  const { appRole } = useAuthorization()
  if (isRestoring) return <AuthLoading/>
  if (user && appRole) return <Navigate to={getRoleLandingPath(appRole)} replace/>
  return children
}

/** Resolve the root URL to login or the authenticated role's first page. */
export function AuthLanding() {
  const { user, isRestoring } = useAuth()
  const { appRole } = useAuthorization()
  if (isRestoring) return <AuthLoading/>
  if (!user || !appRole) return <Navigate to="/login" replace/>
  return <Navigate to={getRoleLandingPath(appRole)} replace/>
}
