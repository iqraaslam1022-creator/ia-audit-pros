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
        color: location.pathname === path ? 'white' : 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: location.pathname === path ? 600 : 400,
        cursor: 'pointer',
        padding: '4px 8px',
        borderBottom: location.pathname === path ? '2px solid white' : '2px solid transparent'
      }}
    >{label}</button>
  )

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="navbar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          ⚡ IA Audit Pro
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
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
