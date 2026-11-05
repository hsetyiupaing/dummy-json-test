import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { ArrowRight, Box, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { getDemoRole, getRoleLandingPath } from '../demoRoles'
import './LoginPage.css'
import './LoginPage.theme.css'

/** Show an API response message when available, with a useful network fallback. */
function getLoginError(error: unknown) {
  if (isAxiosError<{ message?: string }>(error)) {
    if (!error.response) return 'Unable to reach DummyJSON. Check your connection and try again.'
    return error.response.data?.message ?? 'Those credentials could not be verified.'
  }
  return error instanceof Error ? error.message : 'Sign in failed. Please try again.'
}

/** Authenticate using DummyJSON and show the actual profile returned by its login endpoint. */
export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)
    try {
      const user = await login({ username, password, remember })
      navigate(getRoleLandingPath(getDemoRole(user)), { replace: true })
    } catch (error) {
      setErrorMessage(getLoginError(error))
    } finally {
      setIsLoading(false)
    }
  }

  return <main className="auth-screen"><section className="login-card">
    <div className="auth-brand"><div className="auth-logo"><Box size={19}/></div><span>Stockroom <strong>Studio</strong></span></div>
    <div className="login-heading"><p className="login-eyebrow">WELCOME BACK</p><h1>Sign in to your workspace</h1><p className="login-description">Use your DummyJSON account to continue to Stockroom Studio.</p></div>
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-field"><span>Username</span><div className="login-input-wrap"><UserRound size={16}/><input type="text" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} placeholder="Enter your username" required disabled={isLoading}/></div></label>
      <label className="login-field"><span>Password</span><div className="login-input-wrap"><LockKeyhole size={16}/><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" required disabled={isLoading}/><button className="password-toggle" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>
      <div className="login-options"><label className="remember-control"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} disabled={isLoading}/><span>Remember me</span></label><span className="session-hint">{remember ? '60 minute session' : '15 minute session'}</span></div>
      {errorMessage && <div className="login-error" role="alert">{errorMessage}</div>}
      <button className="login-submit" type="submit" disabled={isLoading}>{isLoading ? <><span className="login-spinner"/> Signing in…</> : <>Sign in <ArrowRight size={16}/></>}</button>
    </form>
    <p className="auth-footnote">Authentication is provided by DummyJSON. Application roles are assigned separately for this frontend demo.</p>
    <Link to="/" className="return-home">Return to Stockroom Studio</Link>
  </section></main>
}
