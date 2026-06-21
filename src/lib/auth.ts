// Lightweight client-side admin gate. NOTE: this is a static site with no backend,
// so this is UI gating, not real security — the credential hash ships in the bundle.
// It is appropriate here because the gated action (resume upload) only affects the
// visitor's own browser (localStorage), never the deployed site for others.
//
// To change the password, run:  npm run hash -- "your-new-password"
// and paste the printed hash into ADMIN_PASS_HASH below.

export const ADMIN_USER = 'admin'
export const AUTH_SALT = 'milind-portfolio-v1'
export const ADMIN_PASS_HASH = '19f1b3b92c62b3a0834738ff42caa3b3159306b472611ca240c7e5a63f2a647b'

const SESSION_KEY = 'portfolio-admin'

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyCredentials(user: string, pass: string): Promise<boolean> {
  if (user.trim().toLowerCase() !== ADMIN_USER) return false
  const hash = await sha256Hex(`${AUTH_SALT}:${pass}`)
  return hash === ADMIN_PASS_HASH
}

export function isAdminSession(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}

export function setAdminSession(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, '1')
    else sessionStorage.removeItem(SESSION_KEY)
  } catch { /* storage unavailable */ }
}
