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
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#C9A84C', textAlign: 'center', marginBottom: 8 }}>IA Audit Pro</div>
        <div style={{ fontSize: 14, color: '#555', textAlign: 'center', marginBottom: '2rem' }}>
          {mode === 'login' ? 'Welcome back!' : 'Create your free account'}
        </div>

        {error && <div style={{ background: '#1a0000', border: '1px solid #A32D2D', color: '#ff6b6b', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#aaa', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
              style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, fontSize: 14, color: '#fff', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#aaa', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: 8, fontSize: 14, color: '#fff', outline: 'none' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#C9A84C', color: '#000', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 13, color: '#555' }}>
          {mode === 'login'
            ? <p>Account nahi hai? <span onClick={() => setMode('signup')} style={{ color: '#C9A84C', cursor: 'pointer', fontWeight: 600 }}>Sign up free</span></p>
            : <p>Already have account? <span onClick={() => setMode('login')} style={{ color: '#C9A84C', cursor: 'pointer', fontWeight: 600 }}>Login</span></p>
          }
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span onClick={() => navigate('/')} style={{ fontSize: 12, color: '#444', cursor: 'pointer' }}>Back to Home</span>
        </div>
      </div>
    </div>
  )
}
