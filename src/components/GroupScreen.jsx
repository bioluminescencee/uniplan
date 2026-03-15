import { useState } from 'react'

export function GroupScreen({ onCreate, onJoin }) {
  const [mode, setMode] = useState(null)   // 'create' | 'join'
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handle = async () => {
    if (!value.trim()) return
    setError(null)
    setLoading(true)
    try {
      if (mode === 'create') await onCreate(value.trim())
      else await onJoin(value.trim())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const btn = (label, active, onClick) => (
    <button onClick={onClick} style={{
      flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
      background: active ? '#5b8dd9' : '#1e1e20',
      color: active ? '#fff' : '#6e6c65',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    }}>{label}</button>
  )

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
        <div style={{ fontSize: 22, fontWeight: 700, color: '#e8e6e1', marginBottom: 6 }}>
          <span style={{ color: '#5b8dd9' }}>uni</span>squad
        </div>
        <div style={{ fontSize: 13, color: '#6e6c65', marginBottom: 28 }}>
          Create a friend group or join one with an invite code
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {btn('Create group', mode === 'create', () => { setMode('create'); setValue('') })}
          {btn('Join group', mode === 'join', () => { setMode('join'); setValue('') })}
        </div>

        {mode && (
          <>
            <input
              autoFocus
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
              placeholder={mode === 'create' ? 'Group name, e.g. "UNSW 2026"' : 'Invite code'}
              style={{
                display: 'block', width: '100%', padding: '10px 12px',
                border: '1px solid #2a2826', borderRadius: 8,
                background: '#1e1e20', color: '#e8e6e1',
                fontSize: 14, fontFamily: 'inherit', marginBottom: 12,
                boxSizing: 'border-box', outline: 'none',
              }}
            />
            {error && (
              <div style={{
                background: '#d4836e22', border: '1px solid #d4836e55',
                borderRadius: 8, padding: '8px 12px',
                fontSize: 13, color: '#d4836e', marginBottom: 12,
              }}>{error}</div>
            )}
            <button onClick={handle} disabled={loading} style={{
              width: '100%', padding: '11px 0', borderRadius: 8, border: 'none',
              background: loading ? '#2a2826' : '#5b8dd9',
              color: loading ? '#6e6c65' : '#fff',
              fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}>
              {loading ? 'Please wait…' : mode === 'create' ? 'Create' : 'Join'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}