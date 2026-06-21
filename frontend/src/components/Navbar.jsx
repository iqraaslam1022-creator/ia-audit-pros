import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <nav className="navbar">
      <div className="navbar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>⚡ IA Audit Pro</div>
      <div className="navbar-right">
        <span className="navbar-email">{user?.email}</span>
        <button className="btn-logout" onClick={() => { logout(); navigate('/') }}>Logout</button>
      </div>
    </nav>
  )
}
