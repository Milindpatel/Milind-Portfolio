import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RESUME_DIR = path.join(__dirname, 'public', 'resumes')
const TSX_BIN    = path.join(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')

function resumeUploadPlugin() {
  return {
    name: 'resume-upload',
    configureServer(server: { middlewares: { use: (path: string, fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use('/_upload', (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk: string) => { body += chunk })
        req.on('end', () => {
          try {
            const { filename, data } = JSON.parse(body) as { filename: string; data: string }
            const ext = path.extname(filename).toLowerCase()
            if (!['.pdf', '.docx'].includes(ext)) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Only PDF or DOCX accepted' }))
              return
            }
            fs.mkdirSync(RESUME_DIR, { recursive: true })
            fs.writeFileSync(path.join(RESUME_DIR, filename), Buffer.from(data, 'base64'))
            execSync(`"${TSX_BIN}" scripts/parse-resume.ts`, { cwd: __dirname, stdio: 'inherit' })
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), resumeUploadPlugin()],
  base: '/Milind-Portfolio/',
})
