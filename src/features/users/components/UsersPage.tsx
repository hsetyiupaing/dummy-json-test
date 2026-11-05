import { useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, LockKeyhole, Search, Shield, ShieldCheck, UsersRound, X } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import type { DirectoryUser, UserRole } from '../types/user'
import { useDemoRole } from '../useDemoRole'
import './UsersPage.css'

const roleOrder: UserRole[] = ['admin', 'moderator', 'user']
const roleDescriptions: Record<UserRole, string> = {
  admin: 'Full product access and user administration.',
  moderator: 'Can create and update products, and view users.',
  user: 'Can browse products without changing records.',
}
const pageSizes = [10, 20, 30]

/** Format role labels consistently while preserving API role values for access checks. */
function roleLabel(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

/** Render role counts, permission summaries, and a searchable user directory. */
export default function UsersPage() {
  const { role: demoRole, can } = useDemoRole()
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const usersQuery = useUsers(searchTerm)

  // Debounce directory search so typing does not start a request on every input event.
  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchTerm(searchInput.trim()), 350)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  const users = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data?.users])
  const roleCounts = useMemo(() => users.reduce<Record<UserRole, number>>((counts, user) => {
    counts[user.role] += 1
    return counts
  }, { admin: 0, moderator: 0, user: 0 }), [users])
  const filteredUsers = useMemo(() => users.filter(user => roleFilter === 'all' || user.role === roleFilter), [users, roleFilter])
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Keep paging at the beginning whenever the directory query, role filter, or page size changes.
  function resetPage() { setPage(1) }
  function clearSearch() {
    setSearchInput('')
    setSearchTerm('')
    setRoleFilter('all')
    resetPage()
  }

  return <div className="page-content users-page">
    <div className="page-heading"><div><div className="eyebrow">WORKSPACE / ACCESS</div><h1>Users &amp; roles</h1><p>Review directory roles and the access each role receives.</p></div><div className="demo-role-indicator"><span className="demo-role-dot"/><span>Demo role</span><strong>{roleLabel(demoRole)}</strong></div></div>

    <section className="role-overview" aria-label="Role permissions">
      {roleOrder.map((role, index) => {
        const Icon = index === 0 ? ShieldCheck : index === 1 ? Shield : UsersRound
        return <article className={`role-card role-card-${role}`} key={role}><div className="role-card-top"><div className="role-icon"><Icon size={17}/></div><span>{roleCounts[role]} {roleCounts[role] === 1 ? 'member' : 'members'}</span></div><h2>{roleLabel(role)}</h2><p>{roleDescriptions[role]}</p><div className="role-permissions">{(role === 'admin' ? ['View products', 'Edit products', 'Manage users'] : role === 'moderator' ? ['View products', 'Edit products', 'View users'] : ['View products']).map(item => <span key={item}><Check size={12}/>{item}</span>)}</div></article>
      })}
    </section>

    <section className="users-panel panel" aria-label="User directory">
      <div className="users-panel-heading"><div><h2>Team members</h2><p>{usersQuery.data ? `${usersQuery.data.total} users in the DummyJSON directory` : 'Directory data from DummyJSON'}</p></div><span className="role-source"><LockKeyhole size={13}/> Role data from API</span></div>
      <div className="users-toolbar"><label className="users-search"><Search size={15}/><input value={searchInput} onChange={event => { setSearchInput(event.target.value); resetPage() }} placeholder="Search name, username, or email" aria-label="Search users"/>{searchInput && <button onClick={() => { setSearchInput(''); setSearchTerm(''); resetPage() }} aria-label="Clear user search"><X size={14}/></button>}</label><label className="user-role-filter"><span>Role</span><select value={roleFilter} onChange={event => { setRoleFilter(event.target.value); resetPage() }} aria-label="Filter users by role"><option value="all">All roles</option>{roleOrder.map(item => <option value={item} key={item}>{roleLabel(item)}</option>)}</select><ChevronDown size={13}/></label>{roleFilter !== 'all' && <button className="clear-role-filter" onClick={clearSearch}>Clear filters</button>}</div>

      {usersQuery.isPending ? <UsersSkeleton/> : usersQuery.isError ? <div className="users-state"><CircleAlert size={25}/><h3>Couldn’t load users</h3><p>Check your connection and try the directory again.</p><button className="secondary-button" onClick={() => void usersQuery.refetch()}>Try again</button></div> : filteredUsers.length === 0 ? <div className="users-state"><div className="empty-icon"><UsersRound size={22}/></div><h3>No users found</h3><p>Try another search term or choose a different role filter.</p><button className="secondary-button" onClick={clearSearch}>Clear search and filter</button></div> : <>
        <div className="users-table-scroll"><table className="users-table"><thead><tr><th><span>USER</span><ArrowDownUp size={11}/></th><th>USERNAME</th><th>EMAIL</th><th>ROLE</th><th>ACCESS SUMMARY</th></tr></thead><tbody>{visibleUsers.map(user => <UserRow user={user} key={user.id}/>)}</tbody></table></div>
        <div className="users-footer"><label className="users-page-size"><span>Rows</span><select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); resetPage() }} aria-label="Users per page">{pageSizes.map(size => <option value={size} key={size}>{size}</option>)}</select><ChevronDown size={12}/></label><span className="users-count">Showing <strong>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong></span><div className="users-pagination"><span>Page {currentPage} of {pageCount}</span><button className="icon-button" disabled={currentPage === 1} aria-label="Previous users page" onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronLeft size={16}/></button><button className="icon-button" disabled={currentPage >= pageCount} aria-label="Next users page" onClick={() => setPage(value => Math.min(pageCount, value + 1))}><ChevronRight size={16}/></button></div></div>
      </>}
      <div className="users-permission-note"><LockKeyhole size={13}/>{can('manageUsers') ? 'Your current demo role can manage user access.' : 'User management is restricted for your current demo role.'} This demo shows frontend permissions only.</div>
    </section>
  </div>
}

/** Display a directory user without rendering sensitive fields not required by the page. */
function UserRow({ user }: { user: DirectoryUser }) {
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`
  const summary = user.role === 'admin' ? 'All permissions' : user.role === 'moderator' ? 'Product edits, user view' : 'Read-only access'
  return <tr><td><div className="directory-user"><div className="directory-avatar"><span>{initials}</span><img src={user.image} alt="" onError={event => { event.currentTarget.style.display = 'none' }}/></div><div><strong>{user.firstName} {user.lastName}</strong><span>Member #{user.id}</span></div></div></td><td className="username-cell">@{user.username}</td><td>{user.email}</td><td><span className={`role-badge role-badge-${user.role}`}><i/>{roleLabel(user.role)}</span></td><td className="permission-summary">{summary}</td></tr>
}

/** Reserve directory table height during loading to avoid layout shifts. */
function UsersSkeleton() {
  return <div className="users-skeleton" aria-label="Loading users" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <div className="users-skeleton-row" key={index}><i/><span/><span/><span/></div>)}</div>
}
