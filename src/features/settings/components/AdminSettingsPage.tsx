import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { useAuthorization } from '../../auth/useAuthorization'

/** Show actual API session and application role settings with the demo RBAC boundary explained. */
export default function AdminSettingsPage() {
  const { user, logout } = useAuth()
  const { appRole } = useAuthorization()
  const navigate = useNavigate()
  return <main className="page-content admin-settings-page"><div className="page-heading"><div><div className="eyebrow">ADMINISTRATION</div><h1>Settings</h1><p>Review the current account and authorization setup.</p></div></div><section className="panel settings-section"><div className="settings-section-heading"><span><UserRound size={17}/></span><div><h2>Signed-in account</h2><p>Profile fields come from the authenticated DummyJSON user.</p></div></div><div className="settings-account"><img src={user?.image} alt=""/><div><strong>{user?.firstName} {user?.lastName}</strong><span>{user?.email} · @{user?.username}</span><small>DummyJSON user ID {user?.id}</small></div></div></section><section className="panel settings-section"><div className="settings-section-heading"><span><ShieldCheck size={17}/></span><div><h2>Application role</h2><p>Assigned in this frontend demo, separate from the API profile.</p></div></div><div className="settings-role"><span className="role-badge role-badge-admin"><i/> {appRole}</span><p>DummyJSON does not enforce these permissions server-side. This role only controls the Stockroom Studio demo interface.</p><a href="https://dummyjson.com/docs/auth" target="_blank" rel="noreferrer">DummyJSON authentication documentation <ArrowUpRight size={13}/></a></div></section><button className="settings-logout" onClick={() => { logout(); navigate('/login', { replace: true }) }}><LogOut size={16}/> Sign out</button></main>
}
