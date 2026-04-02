'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError('Incorrect password. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#0D1B2A"/>
            <path d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10S8 23.523 8 18z" stroke="#2563EB" strokeWidth="2" fill="none"/>
            <path d="M13 18h10M18 13l5 5-5 5" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="13" cy="18" r="2" fill="#0D9488"/>
          </svg>
          <div>
            <div style={styles.brand}>CargoLoop</div>
            <div style={styles.brandSub}>Intelligence</div>
          </div>
        </div>

        <div style={styles.divider}/>

        <p style={styles.tagline}>Lane analytics & freight intelligence</p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Access password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            style={styles.input}
            autoFocus
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        <p style={styles.footer}>
          Powered by <strong>World Prime Logistics</strong><br/>
          <span style={{ color: '#94A3B8', fontSize: 11 }}>worldprimelogistics.com</span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0D1B2A',
    padding: '24px',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  brand: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0D1B2A',
    letterSpacing: '-0.5px',
  },
  brandSub: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: 500,
    letterSpacing: '0.05em',
  },
  divider: {
    height: 1,
    background: '#E2E8F0',
    marginBottom: 20,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 6,
    letterSpacing: '0.02em',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    outline: 'none',
    marginBottom: 16,
    background: '#F8FAFC',
    color: '#0F172A',
  },
  error: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 12,
  },
  btn: {
    width: '100%',
    padding: '11px',
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 24,
    transition: 'background 0.15s',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 1.6,
  },
}
