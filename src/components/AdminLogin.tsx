import { useState } from 'react'
import { verifyCredentials, setAdminSession, ADMIN_USER } from '../lib/auth'

interface AdminLoginProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AdminLogin({ onClose, onSuccess }: AdminLoginProps) {
  const [user, setUser]   = useState('')
  const [pass, setPass]   = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    const ok = await verifyCredentials(user, pass)
    setBusy(false)
    if (ok) {
      setAdminSession(true)
      onSuccess()
    } else {
      setError('Invalid username or password.')
      setPass('')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
      onClick={onClose}
    >
      <div className="glass rounded-2xl shadow-2xl w-full max-w-sm p-6 text-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 id="admin-login-title" className="text-lg font-semibold flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Admin Login
          </h2>
          <button onClick={onClose} aria-label="Close login" className="text-faint hover:text-muted p-1">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>
        <p className="text-muted text-xs mb-5">Sign in to manage portfolio content.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="admin-user" className="block text-xs font-medium text-muted mb-1.5">Username</label>
            <input
              id="admin-user"
              type="text"
              autoComplete="username"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder={ADMIN_USER}
              className="w-full bg-line/5 border border-line/10 rounded-lg px-3 py-2 text-sm text-content placeholder-faint focus:border-blue-500/50 focus:bg-line/10 outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-pass" className="block text-xs font-medium text-muted mb-1.5">Password</label>
            <input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full bg-line/5 border border-line/10 rounded-lg px-3 py-2 text-sm text-content focus:border-blue-500/50 focus:bg-line/10 outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1.5" role="alert">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-content font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
