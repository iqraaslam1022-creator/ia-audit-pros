import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navLink = (path, label) => (
    <button
      onClick={() => navigate(path)}
      style={{
        background: 'none',
        border: 'none',
        borderBottom: location.pathname === path ? '2px solid var(--purple)' : '2px solid transparent',
        color: location.pathname === path ? 'var(--purple)' : 'var(--muted)',
        fontSize: 14,
        fontWeight: location.pathname === path ? 700 : 500,
        cursor: 'pointer',
        padding: '4px 8px',
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s',
      }}
    >{label}</button>
  )

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div
          className="navbar-logo"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          ⚡ <span>IA</span>AuditPro
        </div>
        <div className="navbar-links">
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/audit', 'New Audit')}
          {navLink('/competitor', 'Competitor')}
        </div>
      </div>
      <div className="navbar-right">
        <span className="navbar-email">{user?.email}</span>
        <button className="btn-logout" onClick={() => { logout(); navigate('/') }}>Logout</button>
      </div>
    </nav>
  )
}
