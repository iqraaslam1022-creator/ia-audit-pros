import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [plan, setPlan] = useState('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      refreshPlan()
    }
    setLoading(false)
  }, [])

  async function refreshPlan() {
    try {
      const data = await api.getPlan()
      setPlan(data.plan || 'free')
    } catch (e) {
      setPlan('free')
    }
  }

  function login(userData, token) {
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
    setUser(userData)
    refreshPlan()
  }

  function logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setPlan('free')
  }

  return (
    <AuthContext.Provider value={{ user, loading, plan, isPaid: plan !== 'free', refreshPlan, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

