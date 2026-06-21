import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type {
  PortfolioData, Experience, Education, Project, Contact, SkillGroup,
} from '../src/types/portfolio.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const RESUME_DIR = path.join(ROOT, 'public', 'resumes')
const OUT_FILE = path.join(ROOT, 'src', 'data', 'portfolio.json')
const OVERRIDES_FILE = path.join(ROOT, 'src', 'data', 'overrides.json')

// ── Section heading detection ─────────────────────────────────────────────────
// A heading is a short line that matches a known section name (anchored at start).
function sectionKey(line: string): string | null {
  const t = line.trim()
  if (t.length > 42) return null
  if (/^(highlight of qualification|professional summary|summary|profile|objective|about)/i.test(t)) return 'summary'
  if (/^(technical skill|skills|core competenc|technologies\b)/i.test(t)) return 'skills'
  if (/^(work experience|professional experience|experience|employment|career)/i.test(t)) return 'experience'
  if (/^(certification)/i.test(t)) return 'certifications'
  if (/^(project)/i.test(t)) return 'projects'
  if (/^(education|academic)/i.test(t)) return 'education'
  return null
}

// ── Split raw text into sections ──────────────────────────────────────────────
function splitSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {
    header: [], summary: [], skills: [], experience: [],
    certifications: [], projects: [], education: [],
  }
  let current = 'header'
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const key = sectionKey(line)
    if (key) { current = key; continue }   // heading line itself is dropped
    sections[current].push(line)
  }
  return sections
}

// ── Header: name, title, contact line ─────────────────────────────────────────
function extractNameTitle(header: string[]): { name: string; title: string } {
  const name = header[0]?.trim() ?? 'Your Name'
  // First line after the name that isn't a contact line.
  const titleLine = header.slice(1).find(l => !/@|\d{3}.*\d{4}|https?:|linkedin|github/i.test(l))
  const title = (titleLine ?? '').replace(/^\(+|\)+$/g, '').trim() || 'Professional'
  return { name, title }
}

function extractContact(text: string, fallbackLocation?: string): Contact {
  const email         = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)?.[0]
  const phone         = text.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0]
  const linkedinMatch = text.match(/linkedin\.com\/in\/([\w-]+)/i)
  const githubMatch   = text.match(/github\.com\/([\w-]+)/i)
  return {
    ...(email         && { email }),
    ...(phone         && { phone }),
    ...(linkedinMatch && { linkedin: `https://linkedin.com/in/${linkedinMatch[1]}` }),
    ...(githubMatch   && { github:   `https://github.com/${githubMatch[1]}` }),
    ...(fallbackLocation && { location: fallbackLocation }),
  }
}

// ── Skills: preserve category grouping ────────────────────────────────────────
// Lines without commas are category labels; comma lines are their skill lists.
function parseSkills(lines: string[]): SkillGroup[] {
  const groups: SkillGroup[] = []
  let current: SkillGroup | null = null
  for (const line of lines) {
    if (line.includes(',')) {
      const items = line.split(',').map(s => s.trim()).filter(Boolean)
      if (!current) { current = { category: 'Skills', items: [] }; groups.push(current) }
      current.items.push(...items)
    } else {
      current = { category: line.trim(), items: [] }
      groups.push(current)
    }
  }
  return groups.filter(g => g.items.length > 0)
}

// ── Experience ────────────────────────────────────────────────────────────────
const DATE_RANGE = /^([A-Za-z]{3,9}\.?\s*\d{4}|\d{4})\s*[–—-]\s*([A-Za-z]{3,9}\.?\s*\d{4}|Present|Current|\d{4})/i
const TOOLS_LINE = /^tools?\s*(and|&)?\s*tech/i

function jobFromHeader(line: string): Experience {
  const [left, right = ''] = line.split('|').map(s => s.trim())
  const parts = left.split(',').map(s => s.trim()).filter(Boolean)
  return {
    title:     right,
    company:   parts[0] ?? '',
    ...(parts.length > 1 ? { location: parts.slice(1).join(', ') } : {}),
    startDate: '',
    endDate:   '',
    bullets:   [],
  }
}

function parseExperience(lines: string[]): Experience[] {
  const jobs: Experience[] = []
  let current: Experience | null = null

  for (const line of lines) {
    if (TOOLS_LINE.test(line)) {
      const after = line.slice(line.indexOf(':') + 1)
      if (current && line.includes(':')) {
        current.tech = after.split(',').map(s => s.trim()).filter(Boolean)
      }
      continue
    }
    const date = line.match(DATE_RANGE)
    if (date) {
      if (current) { current.startDate = date[1].trim(); current.endDate = date[2].trim() }
      continue
    }
    if (line.includes('|')) {           // new job header "Company, City | Title"
      if (current) jobs.push(current)
      current = jobFromHeader(line)
      continue
    }
    if (current) current.bullets.push(line.replace(/^[•·\-*]\s*/, ''))
  }
  if (current) jobs.push(current)
  return jobs.filter(j => j.company)
}

// ── Education: "Institution || Degree" then "Location | Period" then "Score:" ──
function parseEducation(lines: string[]): Education[] {
  const results: Education[] = []
  let current: Education | null = null

  for (const line of lines) {
    if (line.includes('||')) {
      if (current) results.push(current)
      const [inst, degree = ''] = line.split('||').map(s => s.trim())
      current = { institution: inst, degree }
    } else if (current && /^score/i.test(line)) {
      current.score = line.replace(/^score:?\s*/i, '').trim()
    } else if (current && line.includes('|')) {
      const [loc, period = ''] = line.split('|').map(s => s.trim())
      current.location = loc
      if (period) current.period = period
    } else if (current && !current.degree) {
      current.degree = line
    }
  }
  if (current) results.push(current)
  return results
}

// ── Certifications: one per line ──────────────────────────────────────────────
function parseCertifications(lines: string[]): string[] {
  return lines.map(l => l.trim()).filter(l => l.length > 2)
}

// ── Projects: "Name | Context" then "Tools and Technologies: ..." ─────────────
function parseProjects(lines: string[]): Project[] {
  const results: Project[] = []
  let current: Project | null = null

  for (const line of lines) {
    if (TOOLS_LINE.test(line) || /^tools?\s*(and|&)?\s*technolog/i.test(line)) {
      if (current && line.includes(':')) {
        current.technologies = line.slice(line.indexOf(':') + 1).split(',').map(s => s.trim()).filter(Boolean)
      }
      continue
    }
    if (line.includes('|')) {
      if (current) results.push(current)
      const [name, context = ''] = line.split('|').map(s => s.trim())
      current = { name, description: context, technologies: [] }
    } else if (current) {
      current.description = current.description ? `${current.description} ${line}` : line
    }
  }
  if (current) results.push(current)
  return results.filter(p => p.name)
}

// ── Raw text → PortfolioData ──────────────────────────────────────────────────
function parseText(text: string): PortfolioData {
  const lines    = text.split('\n')
  const sections = splitSections(lines)
  const { name, title } = extractNameTitle(sections.header)

  const experience = parseExperience(sections.experience)
  const fallbackLocation = experience[0]?.location?.split(',')[0]

  return {
    name,
    title,
    summary:        sections.summary.join(' ').replace(/\s+/g, ' ').trim(),
    contact:        extractContact(text, fallbackLocation),
    experience,
    skills:         parseSkills(sections.skills),
    education:      parseEducation(sections.education),
    certifications: parseCertifications(sections.certifications),
    projects:       parseProjects(sections.projects),
    lastUpdated:    new Date().toISOString(),
  }
}

// ── File readers ──────────────────────────────────────────────────────────────
async function readPdf(filePath: string): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(fs.readFileSync(filePath))
  return data.text
}

async function readDocx(filePath: string): Promise<string> {
  const mammoth = await import('mammoth')
  const result  = await mammoth.extractRawText({ path: filePath })
  return result.value
}

// ── Manual overrides ──────────────────────────────────────────────────────────
// src/data/overrides.json lets you hand-correct parsed data (e.g. a promotion)
// without losing auto-generation. It is merged on top of the parsed resume.
// Experience patches are matched by `company`; an unmatched patch is prepended.
function applyOverrides(data: PortfolioData): PortfolioData {
  if (!fs.existsSync(OVERRIDES_FILE)) return data
  const ov = JSON.parse(fs.readFileSync(OVERRIDES_FILE, 'utf8')) as Partial<PortfolioData>

  if (ov.name)    data.name = ov.name
  if (ov.title)   data.title = ov.title
  if (ov.summary) data.summary = ov.summary
  if (ov.contact) data.contact = { ...data.contact, ...ov.contact }
  if (ov.skills)         data.skills = ov.skills
  if (ov.education)      data.education = ov.education
  if (ov.certifications) data.certifications = ov.certifications
  if (ov.projects)       data.projects = ov.projects

  if (Array.isArray(ov.experience)) {
    // Match an existing role by company + startDate (a stable key), so a patch can
    // freely rewrite its title/bullets without creating a duplicate. Falls back to
    // company + title, then company alone. An unmatched patch is prepended as a new
    // role — this is how a promotion (same company, later startDate) is added.
    for (const patch of ov.experience as Experience[]) {
      const idx = data.experience.findIndex(e =>
        e.company === patch.company &&
        (patch.startDate ? e.startDate === patch.startDate
          : patch.title ? e.title === patch.title
            : true),
      )
      if (idx >= 0) data.experience[idx] = { ...data.experience[idx], ...patch }
      else data.experience.unshift(patch)
    }
  }

  console.log(`Applied overrides from ${path.basename(OVERRIDES_FILE)}`)
  return data
}

// ── Seed (no resume present) ──────────────────────────────────────────────────
function seed(): PortfolioData {
  return {
    name: 'Your Name',
    title: 'Web Development Manager',
    summary: 'Add a resume (PDF or DOCX) to public/resumes/ to auto-generate this portfolio.',
    contact: { email: 'milindpatel647@gmail.com', github: 'https://github.com/Milindpatel' },
    experience: [],
    skills: [],
    education: [],
    certifications: [],
    projects: [],
    lastUpdated: new Date().toISOString(),
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  const files = fs.existsSync(RESUME_DIR)
    ? fs.readdirSync(RESUME_DIR).filter(f => /\.(pdf|docx)$/i.test(f))
    : []

  if (files.length === 0) {
    console.log('No resumes in public/resumes/ — writing seed data.')
    fs.writeFileSync(OUT_FILE, JSON.stringify(applyOverrides(seed()), null, 2))
    return
  }

  const latest = files
    .map(f => ({ f, mtime: fs.statSync(path.join(RESUME_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0].f

  console.log(`Parsing resume: ${latest}`)
  const ext  = path.extname(latest).toLowerCase()
  const text = ext === '.pdf'
    ? await readPdf(path.join(RESUME_DIR, latest))
    : await readDocx(path.join(RESUME_DIR, latest))

  const data = applyOverrides(parseText(text))
  fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2))
  console.log(`Written: ${OUT_FILE}`)
  console.log(`  Name:           ${data.name}`)
  console.log(`  Title:          ${data.title}`)
  console.log(`  Experience:     ${data.experience.length} roles`)
  console.log(`  Skill groups:   ${data.skills.length}`)
  console.log(`  Education:       ${data.education.length}`)
  console.log(`  Certifications:  ${data.certifications.length}`)
  console.log(`  Projects:        ${data.projects.length}`)
}

main().catch(err => { console.error(err); process.exit(1) })
