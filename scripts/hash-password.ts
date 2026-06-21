// Generate the SHA-256 hash for an admin password.
// Usage:  npm run hash -- "your-password"
// Paste the printed value into ADMIN_PASS_HASH in src/lib/auth.ts.
import crypto from 'node:crypto'
import { AUTH_SALT } from '../src/lib/auth.ts'

const pass = process.argv[2]
if (!pass) {
  console.error('Usage: npm run hash -- "your-password"')
  process.exit(1)
}

const hash = crypto.createHash('sha256').update(`${AUTH_SALT}:${pass}`).digest('hex')
console.log(hash)
