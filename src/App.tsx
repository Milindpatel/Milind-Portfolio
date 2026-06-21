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
import { isAdminSession, setAdminSession } from './lib/auth'

const defaultData = builtIn as PortfolioData

function loadInitial(): { data: PortfolioData; custom: boolean } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { data: JSON.parse(saved) as PortfolioData, custom: true }
  } catch { /* ignore corrupt storage */ }
  return { data: defaultData, custom: false }
}

export default function App() {
  const [{ data: portfolio, custom }, setState] = useState(loadInitial)
  const [isAdmin, setIsAdmin] = useState(isAdminSession)
  const [loginOpen, setLoginOpen] = useState(false)

  // Typewriter roles come straight from the résumé's job titles.
  const roles = Array.from(
    new Set([portfolio.title, ...portfolio.experience.map(e => e.title)].filter(Boolean)),
  )

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

  const adminControl = isAdmin ? (
    <button onClick={logout} className="text-gray-500 hover:text-gray-300 transition-colors">
      Logout
    </button>
  ) : (
    <button onClick={() => setLoginOpen(true)} className="text-gray-600 hover:text-gray-400 transition-colors">
      Admin
    </button>
  )

  return (
    <Layout name={portfolio.name} links={links} footerExtra={adminControl}>
      <Hero name={portfolio.name} roles={roles} contact={portfolio.contact} />
      <About summary={portfolio.summary} />
      <Experience experience={portfolio.experience} />
      <Skills skills={portfolio.skills} />
      {portfolio.projects.length > 0 && <Projects projects={portfolio.projects} />}
      <Education education={portfolio.education} certifications={portfolio.certifications} />
      <Contact contact={portfolio.contact} />

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
