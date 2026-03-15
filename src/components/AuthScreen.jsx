import { useState } from 'react'
import { supabase } from '../lib/supabase'

const COLORS = ["#e07b54","#5b8dd9","#6bbf8e","#d4669a","#c9a84c","#7c63c9"]

export function AuthScreen() {
  const [mode, setMode] = useState('signin')   // signin | signup | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handle = async () => {
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: name.trim(),
          avatar: name.trim().slice(0, 2).toUpperCase(),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        })
        setMessage('Check your email to confirm your account.')
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // onAuthStateChange in useAuth handles the rest
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setMessage('Password reset link sent — check your email.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    display: 'block', width: '100%', padding: '10px 12px',
    border: '1px solid #2a2826', borderRadius: 8,
    background: '#1e1e20', color: '#e8e6e1',
    fontSize: 14, fontFamily: 'inherit', marginBottom: 12,
    boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#141416',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: 'min(400px, 92vw)',
        border: '1px solid #2a2826', borderRadius: 16, padding: 32,
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#e8e6e1' }}>
            <span style={{ color: '#5b8dd9' }}>uni</span>squad
          </div>
          <div style={{ fontSize: 13, color: '#6e6c65', marginTop: 4 }}>
            {mode === 'signin' && 'Sign in to your group'}
            {mode === 'signup' && 'Create an account'}
            {mode === 'reset' && 'Reset your password'}
          </div>
        </div>

        {/* Fields */}
        {mode === 'signup' && (
          <input style={inp} placeholder="Your name" value={name}
            onChange={e => setName(e.target.value)} />
        )}
        <input style={inp} type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} />
        {mode !== 'reset' && (
          <input style={inp} type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()} />
        )}

        {/* Feedback */}
        {error && (
          <div style={{
            background: '#d4836e22', border: '1px solid #d4836e55',
            borderRadius: 8, padding: '8px 12px', fontSize: 13,
            color: '#d4836e', marginBottom: 12,
          }}>{error}</div>
        )}
        {message && (
          <div style={{
            background: '#6bbf8e22', border: '1px solid #6bbf8e55',
            borderRadius: 8, padding: '8px 12px', fontSize: 13,
            color: '#6bbf8e', marginBottom: 12,
          }}>{message}</div>
        )}

        {/* Submit */}
        <button onClick={handle} disabled={loading} style={{
          width: '100%', padding: '11px 0', borderRadius: 8, border: 'none',
          background: loading ? '#2a2826' : '#5b8dd9',
          color: loading ? '#6e6c65' : '#fff',
          fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
          fontFamily: 'inherit',
        }}>
          {loading ? 'Please wait…' :
            mode === 'signin' ? 'Sign in' :
            mode === 'signup' ? 'Create account' : 'Send reset link'}
        </button>

        {/* Mode switchers */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6e6c65' }}>
          {mode === 'signin' && <>
            <button onClick={() => setMode('signup')} style={linkBtn}>Create account</button>
            {' · '}
            <button onClick={() => setMode('reset')} style={linkBtn}>Forgot password?</button>
          </>}
          {mode === 'signup' && <>
            Already have an account?{' '}
            <button onClick={() => setMode('signin')} style={linkBtn}>Sign in</button>
          </>}
          {mode === 'reset' && (
            <button onClick={() => setMode('signin')} style={linkBtn}>← Back to sign in</button>
          )}
        </div>
      </div>
    </div>
  )
}

const linkBtn = {
  background: 'none', border: 'none', color: '#5b8dd9',
  cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0,
}