// Generates a clean, ATS-friendly, print-ready HTML resume from the curated
// portfolio data (src/data/portfolio.json). Convert to PDF by printing the HTML
// (Ctrl+P → Save as PDF) or via headless Edge/Chrome --print-to-pdf.
//
// Usage:  npm run resume -- "<output-directory>"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { PortfolioData } from '../src/types/portfolio.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'portfolio.json'), 'utf8')) as PortfolioData

const outDir = process.argv[2] || path.join(ROOT, 'resume')
fs.mkdirSync(outDir, { recursive: true })

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const c = data.contact
const contactBits = [
  c.email && `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`,
  c.phone && `<a href="tel:${c.phone.replace(/[^\d+]/g, '')}">${esc(c.phone)}</a>`,
  c.github && `<a href="${esc(c.github)}">${esc(c.github.replace(/^https?:\/\//, ''))}</a>`,
  c.location && `<span>${esc(c.location)}</span>`,
].filter(Boolean).join('<span class="sep">•</span>')

const skills = data.skills.map(g => `
    <div class="skill-row">
      <span class="skill-cat">${esc(g.category)}</span>
      <span class="skill-items">${g.items.map(esc).join(', ')}</span>
    </div>`).join('')

const experience = data.experience.map(j => `
    <div class="job">
      <div class="job-head">
        <span class="job-title">${esc(j.title)}</span>
        <span class="job-dates">${esc(j.startDate)} – ${esc(j.endDate)}</span>
      </div>
      <div class="job-sub">${esc(j.company)}${j.location ? `, ${esc(j.location)}` : ''}</div>
      <ul>${j.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
      ${j.tech && j.tech.length ? `<div class="job-tech"><strong>Technologies:</strong> ${j.tech.map(esc).join(', ')}</div>` : ''}
    </div>`).join('')

const education = data.education.map(e => `
    <div class="edu">
      <div class="edu-head">
        <span class="edu-degree">${esc(e.degree)}</span>
        ${e.period ? `<span class="edu-dates">${esc(e.period)}</span>` : ''}
      </div>
      <div class="edu-sub">${esc(e.institution)}${e.location ? `, ${esc(e.location)}` : ''}${e.score ? ` &nbsp;·&nbsp; Score: ${esc(e.score)}` : ''}</div>
    </div>`).join('')

const certs = data.certifications.length
  ? `<section><h2>Certifications</h2><ul class="certs">${data.certifications.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>`
  : ''

const projects = data.projects.length
  ? `<section><h2>Projects</h2>${data.projects.map(p => `
      <div class="proj"><strong>${esc(p.name)}</strong>${p.description ? ` — ${esc(p.description)}` : ''}${p.technologies && p.technologies.length ? `<div class="proj-tech">${p.technologies.map(esc).join(', ')}</div>` : ''}</div>`).join('')}</section>`
  : ''

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(data.name)} — Resume</title>
<style>
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: "Calibri", "Segoe UI", Arial, sans-serif;
    color: #1a1a1a; font-size: 10.5pt; line-height: 1.4;
    max-width: 8.5in; margin: 0 auto; padding: 0.5in 0.6in;
  }
  a { color: #1d4ed8; text-decoration: none; }
  header { border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 14px; }
  h1 { font-size: 22pt; margin: 0; color: #0f172a; letter-spacing: 0.5px; }
  .role { font-size: 12pt; color: #1d4ed8; font-weight: 600; margin: 2px 0 8px; }
  .contact { font-size: 9.5pt; color: #334155; }
  .contact .sep { margin: 0 8px; color: #94a3b8; }
  h2 {
    font-size: 11pt; text-transform: uppercase; letter-spacing: 1px;
    color: #0f172a; border-bottom: 1px solid #cbd5e1;
    padding-bottom: 3px; margin: 16px 0 8px;
  }
  section { margin-bottom: 4px; }
  p.summary { margin: 0 0 4px; text-align: justify; }
  .skill-row { display: flex; margin-bottom: 4px; }
  .skill-cat { flex: 0 0 165px; font-weight: 700; color: #0f172a; }
  .skill-items { flex: 1; }
  .job { margin-bottom: 11px; }
  .job-head { display: flex; justify-content: space-between; align-items: baseline; }
  .job-title { font-weight: 700; font-size: 11pt; color: #0f172a; }
  .job-dates { font-size: 9.5pt; color: #475569; white-space: nowrap; }
  .job-sub { color: #1d4ed8; font-weight: 600; font-size: 10pt; margin-bottom: 4px; }
  ul { margin: 4px 0 0; padding-left: 18px; }
  li { margin-bottom: 2px; }
  .job-tech { font-size: 9pt; color: #475569; margin-top: 4px; }
  .edu { margin-bottom: 8px; }
  .edu-head { display: flex; justify-content: space-between; align-items: baseline; }
  .edu-degree { font-weight: 700; color: #0f172a; }
  .edu-dates { font-size: 9.5pt; color: #475569; }
  .edu-sub { color: #334155; font-size: 9.5pt; }
  .certs { columns: 2; }
  .proj-tech { font-size: 9pt; color: #475569; }
  @media print { body { padding: 0.4in 0.5in; } a { color: #1d4ed8; } }
</style>
</head>
<body>
  <header>
    <h1>${esc(data.name)}</h1>
    <div class="role">${esc(data.title)}</div>
    <div class="contact">${contactBits}</div>
  </header>

  <section>
    <h2>Professional Summary</h2>
    <p class="summary">${esc(data.summary)}</p>
  </section>

  <section>
    <h2>Technical Skills</h2>
    ${skills}
  </section>

  <section>
    <h2>Professional Experience</h2>
    ${experience}
  </section>

  <section>
    <h2>Education</h2>
    ${education}
  </section>

  ${certs}
  ${projects}
</body>
</html>`

const outFile = path.join(outDir, 'Milind_Patel_Resume.html')
fs.writeFileSync(outFile, html)
console.log(`Resume written: ${outFile}`)
