import type { StoredAuthSession } from './types'

const sessionKey = 'stockroom.auth.session'

/** Read whichever browser store was selected by the user's Remember me choice. */
export function readStoredSession(): StoredAuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(sessionKey) ?? window.sessionStorage.getItem(sessionKey)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isStoredSession(parsed)) {
      clearStoredSession()
      return null
    }
    return parsed
  } catch {
    clearStoredSession()
    return null
  }
}

/** Persist remembered sessions across browser restarts and temporary sessions per tab. */
export function writeStoredSession(session: StoredAuthSession): void {
  if (typeof window === 'undefined') return
  const target = session.remember ? window.localStorage : window.sessionStorage
  const other = session.remember ? window.sessionStorage : window.localStorage
  other.removeItem(sessionKey)
  target.setItem(sessionKey, JSON.stringify(session))
}

/** Clear both stores so logout cannot leave a second stale credential behind. */
export function clearStoredSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(sessionKey)
  window.sessionStorage.removeItem(sessionKey)
}

/** Supply the current bearer token to the shared Axios request interceptor. */
export function getStoredAccessToken(): string | null {
  return readStoredSession()?.accessToken ?? null
}

/** Validate persisted data before it is trusted as a session. */
function isStoredSession(value: unknown): value is StoredAuthSession {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<StoredAuthSession>
  return Boolean(
    candidate.user && typeof candidate.user.id === 'number'
    && typeof candidate.user.username === 'string'
    && typeof candidate.accessToken === 'string'
    && typeof candidate.refreshToken === 'string'
    && typeof candidate.remember === 'boolean',
  )
}
