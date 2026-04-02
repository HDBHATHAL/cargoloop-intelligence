'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [agreed, setAgreed]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const canvasRef               = useRef(null)
  const router                  = useRouter()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, t = 0

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const LINES = 14
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < LINES; i++) {
        const prog  = i / (LINES - 1)
        const yBase = canvas.height * (0.32 + prog * 0.36)
        const amp   = 50 + prog * 90
        const freq  = 0.0025 + prog * 0.0012
        const speed = 0.35 + prog * 0.25
        const alpha = 0.04 + (1 - Math.abs(prog - 0.5) * 2) * 0.14
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`
        ctx.lineWidth   = 0.75
        for (let x = 0; x <= canvas.width; x += 2) {
          const y = yBase
            + Math.sin(x * freq + t * speed) * amp
            + Math.sin(x * freq * 1.8 + t * speed * 0.7 + i * 0.5) * (amp * 0.35)
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      t += 0.01
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!agreed || !password) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) { router.push('/'); router.refresh() }
      else { setError('Incorrect password. Please try again.'); setLoading(false) }
    } catch { setError('Connection error. Please try again.'); setLoading(false) }
  }

  const canSubmit = agreed && password.length > 0 && !loading

  return (
    <>
      <style>{`
        @keyframes shine {
          0%   { background-position: 100% center; }
          100% { background-position: -100% center; }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: rgba(0,255,204,0.4) !important; outline: none; }
        button:hover:not(:disabled) { opacity: 0.88 !important; }
      `}</style>

      <div style={S.page}>
        <canvas ref={canvasRef} style={S.canvas}/>

        <div style={S.content}>
          {/* Brand header */}
          <div style={S.brandBlock}>
            <div style={S.logoRow}>
              <svg width="26" height="26" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
                <path d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10S8 23.523 8 18z" stroke="#00FFCC" strokeWidth="1.5" fill="none"/>
                <path d="M13 18h10M18 13l5 5-5 5" stroke="#00FFCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="13" cy="18" r="1.8" fill="#00FFCC"/>
              </svg>
              <span style={S.logoLabel}>CargoLoop <span style={{ color: '#00FFCC' }}>Intelligence</span></span>
            </div>

            <h1 style={S.title}>World Prime Logistics</h1>
            <p style={S.subtitle}>Where Technology Meets Purpose in Motion</p>
          </div>

          {/* Card */}
          <div style={S.card}>
            {/* Disclaimer */}
            <div style={S.disclaimerBox}>
              <div style={S.dHeader}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="#00FFCC" strokeWidth="2">
                  <path d="M10 2L2 17h16L10 2z"/>
                  <line x1="10" y1="9" x2="10" y2="13"/>
                  <circle cx="10" cy="15.5" r="0.8" fill="#00FFCC" stroke="none"/>
                </svg>
                <span style={S.dTitle}>Confidentiality Notice</span>
              </div>
              <p style={S.dText}>
                This platform contains <strong style={{ color: 'rgba(255,255,255,0.8)' }}>proprietary and confidential business data</strong> belonging exclusively to <strong style={{ color: 'rgba(255,255,255,0.8)' }}>World Prime Logistics (WPL)</strong>. Access is restricted to authorized personnel only.
              </p>
              <p style={{ ...S.dText, marginBottom: 0 }}>
                Unauthorized access, use, disclosure, or distribution of any information herein — including lane data, rate intelligence, shipper relationships, and operational metrics — is strictly prohibited and may result in <strong style={{ color: '#00FFCC' }}>civil and criminal legal action</strong>.
              </p>
            </div>

            {/* Agree checkbox */}
            <label style={S.checkRow}>
              <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ position:'absolute', opacity:0, width:0, height:0 }}/>
                <div style={{ ...S.checkBox, ...(agreed ? S.checkOn : {}) }}>
                  {agreed && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><polyline points="2,6 5,9 10,3"/></svg>}
                </div>
              </div>
              <span style={S.checkLabel}>
                I acknowledge the confidentiality terms above and confirm I am an authorized user of this platform.
              </span>
            </label>

            <div style={S.rule}/>

            {/* Password */}
            <form onSubmit={handleSubmit}>
              <label style={S.label}>Access password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={!agreed}
                style={{ ...S.input, ...(!agreed ? { opacity: 0.3, cursor: 'not-allowed' } : {}) }}
              />
              {error && <p style={S.error}>{error}</p>}
              <button type="submit" disabled={!canSubmit} style={{ ...S.btn, ...(!canSubmit ? { opacity: 0.25, cursor: 'not-allowed' } : {}) }}>
                {loading ? 'Verifying…' : 'Access Dashboard'}
              </button>
            </form>

            <p style={S.footerText}>worldprimelogistics.com</p>
          </div>
        </div>
      </div>
    </>
  )
}

const S = {
  page:       { minHeight:'100vh', background:'#000', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden', fontFamily:'system-ui,-apple-system,sans-serif' },
  canvas:     { position:'absolute', inset:0, pointerEvents:'none', zIndex:0 },
  content:    { position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', width:'100%', maxWidth:480, gap:28 },
  brandBlock: { textAlign:'center' },
  logoRow:    { display:'flex', alignItems:'center', justifyContent:'center', gap:9, marginBottom:18 },
  logoLabel:  { fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase' },
  title:      { fontSize:30, fontWeight:800, letterSpacing:'-0.3px', margin:'0 0 10px', color:'rgba(220,220,220,0.682)', background:'linear-gradient(120deg,rgba(255,255,255,0) 40%,rgba(255,255,255,0.8),rgba(255,255,255,0) 60%) 0% 0%/200% 100% text', WebkitBackgroundClip:'text', backgroundClip:'text', animation:'shine 5s linear infinite' },
  subtitle:   { fontSize:13, color:'rgba(255,255,255,0.35)', margin:0, letterSpacing:'0.02em' },
  card:       { background:'rgba(255,255,255,0.025)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'26px 26px 20px', width:'100%', backdropFilter:'blur(16px)' },
  disclaimerBox: { background:'rgba(0,255,204,0.03)', border:'0.5px solid rgba(0,255,204,0.18)', borderRadius:8, padding:'13px 15px', marginBottom:16 },
  dHeader:    { display:'flex', alignItems:'center', gap:7, marginBottom:9 },
  dTitle:     { fontSize:10, fontWeight:700, color:'#00FFCC', textTransform:'uppercase', letterSpacing:'0.1em' },
  dText:      { fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.7, margin:'0 0 7px' },
  checkRow:   { display:'flex', alignItems:'flex-start', gap:11, cursor:'pointer', marginBottom:18 },
  checkBox:   { width:17, height:17, border:'1.5px solid rgba(255,255,255,0.2)', borderRadius:4, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' },
  checkOn:    { background:'#00FFCC', borderColor:'#00FFCC' },
  checkLabel: { fontSize:11, color:'rgba(255,255,255,0.45)', lineHeight:1.65 },
  rule:       { height:'0.5px', background:'rgba(255,255,255,0.07)', marginBottom:18 },
  label:      { display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:7 },
  input:      { width:'100%', padding:'10px 13px', fontSize:14, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.12)', borderRadius:6, color:'#fff', outline:'none', marginBottom:14, boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.15s' },
  error:      { color:'#FF6B6B', fontSize:11, marginBottom:10, marginTop:-6 },
  btn:        { width:'100%', padding:'11px', background:'#fff', color:'#000', border:'none', borderRadius:4, fontSize:14, fontWeight:700, cursor:'pointer', letterSpacing:'0.02em', transition:'opacity 0.15s', marginBottom:14, fontFamily:'inherit' },
  footerText: { textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.2)', margin:0, letterSpacing:'0.06em' },
}
