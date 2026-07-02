import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await api.login(email, password)
        : await api.signup(email, password)
      login(res.user, res.token)
      const plan = localStorage.getItem('selectedPlan')
      if (plan && plan !== 'free') {
        localStorage.removeItem('selectedPlan')
        navigate('/dashboard?upgrade=' + plan)
      } else {
        localStorage.removeItem('selectedPlan')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="landing-auth">
      <div className="auth-box">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#534AB7', marginBottom: 6 }}>IA Audit Pro</div>
          <div style={{ fontSize: 14, color: '#6b6b8a' }}>{mode === 'login' ? 'Welcome back!' : 'Create your free account'}</div>
        </div>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: '0.5rem' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: '#6b6b8a' }}>
          {mode === 'login'
            ? <p>Don't have an account? <span onClick={() => setMode('signup')} style={{ color: '#534AB7', cursor: 'pointer', fontWeight: 600 }}>Sign up free</span></p>
            : <p>Already have account? <span onClick={() => setMode('login')} style={{ color: '#534AB7', cursor: 'pointer', fontWeight: 600 }}>Login</span></p>}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span onClick={() => navigate('/')} style={{ fontSize: 12, color: '#b0b0c8', cursor: 'pointer' }}>Back to Home</span>
        </div>
      </div>
    </div>
  )
}
