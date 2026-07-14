import { useState } from 'react'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Competitor() {
  const { isPaid } = useAuth()
  const [myUrl, setMyUrl] = useState('')
  const [compUrl, setCompUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function analyze() {
    if (!myUrl || !compUrl) return
    setError(''); setResult(null); setLoading(true)
    try {
      const data = await api.compareAudit(myUrl, compUrl)
      setResult(data.comparison)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }




