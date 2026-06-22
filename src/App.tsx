import { useState } from 'react'
import builtIn from './data/portfolio.json'
import type { PortfolioData } from './types/portfolio'
import Layout from './components/Layout'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Education from './components/Education'
import Contact from './components/Contact'
import ResumeUpload, { STORAGE_KEY } from './components/ResumeUpload'
import AdminLogin from './components/AdminLogin'
import BackToTop from './components/BackToTop'
import AiChat from './components/AiChat'
import { isAdminSession, setAdminSession } from './lib/auth'

const defaultData = builtIn as PortfolioData
const AVAIL_KEY = 'portfolio-available'

function loadInitial(): { data: PortfolioData; custom: boolean } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { data: JSON.parse(saved) as PortfolioData, custom: true }
  } catch { /* ignore corrupt storage */ }
  return { data: defaultData, custom: false }
}

function loadAvailable(fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(AVAIL_KEY)
    if (v === '1') return true
    if (v === '0') return false
  } catch { /* ignore */ }
  return fallback
}

export default function App() {
  const [{ data: portfolio, custom }, setState] = useState(loadInitial)
  const [isAdmin, setIsAdmin] = useState(isAdminSession)
  const [loginOpen, setLoginOpen] = useState(false)
  const [available, setAvailable] = useState(() => loadAvailable(defaultData.available ?? true))

  // Typewriter roles come straight from the résumé's job titles.
  const roles = Array.from(
    new Set([portfolio.title, ...portfolio.experience.map(e => e.title)].filter(Boolean)),
  )

  // Stats derived from the résumé so they update automatically with new data.
  const startYears = portfolio.experience
    .map(e => Number(e.startDate.match(/\d{4}/)?.[0]))
    .filter(y => !Number.isNaN(y))
  const earliestYear = startYears.length ? Math.min(...startYears) : null
  const companies = new Set(portfolio.experience.map(e => e.company)).size

  const stats = [
    earliestYear !== null && { value: `${earliestYear}`, label: 'Working Since' },
    companies > 0         && { value: `${companies}`, label: 'Companies' },
    portfolio.experience.length > 0 && { value: `${portfolio.experience.length}`, label: 'Roles' },
  ].filter(Boolean) as { value: string; label: string }[]

  const hasEducation = portfolio.education.length > 0 || portfolio.certifications.length > 0

  const links = [
    { label: 'About',      href: '#about' },
    portfolio.experience.length > 0 && { label: 'Experience', href: '#experience' },
    portfolio.skills.length > 0     && { label: 'Skills',     href: '#skills' },
    portfolio.projects.length > 0   && { label: 'Projects',   href: '#projects' },
    hasEducation                    && { label: 'Education',  href: '#education' },
    { label: 'Contact',    href: '#contact' },
  ].filter(Boolean) as { label: string; href: string }[]

  function logout() {
    setAdminSession(false)
    setIsAdmin(false)
  }

  function toggleAvailable() {
    const next = !available
    setAvailable(next)
    try { localStorage.setItem(AVAIL_KEY, next ? '1' : '0') } catch { /* ignore */ }
  }

  const adminControl = isAdmin ? (
    <span className="flex items-center gap-4">
      <span className="flex items-center gap-2">
        <span className="text-faint">Available</span>
        <button
          type="button"
          role="switch"
          aria-checked={available}
          aria-label="Toggle availability badge"
          onClick={toggleAvailable}
          className={`relative w-9 h-5 rounded-full transition-colors ${available ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${available ? 'translate-x-4' : ''}`} />
        </button>
      </span>
      <button onClick={logout} className="text-faint hover:text-muted transition-colors">
        Logout
      </button>
    </span>
  ) : (
    <button onClick={() => setLoginOpen(true)} className="text-faint hover:text-muted transition-colors">
      Admin
    </button>
  )

  return (
    <Layout name={portfolio.name} links={links} footerExtra={adminControl}>
      <Hero name={portfolio.name} roles={roles} contact={portfolio.contact} available={available} />
      <About summary={portfolio.summary} stats={stats} />
      <Experience experience={portfolio.experience} />
      <Skills skills={portfolio.skills} />
      {portfolio.projects.length > 0 && <Projects projects={portfolio.projects} />}
      <Education education={portfolio.education} certifications={portfolio.certifications} />
      <Contact contact={portfolio.contact} />

      <BackToTop />
      <AiChat portfolio={portfolio} />

      {isAdmin && (
        <ResumeUpload
          onUpdate={data => setState({ data, custom: true })}
          isCustom={custom}
          onReset={() => setState({ data: defaultData, custom: false })}
        />
      )}

      {loginOpen && (
        <AdminLogin
          onClose={() => setLoginOpen(false)}
          onSuccess={() => { setIsAdmin(true); setLoginOpen(false) }}
        />
      )}
    </Layout>
  )
}
