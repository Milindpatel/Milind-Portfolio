import data from './data/portfolio.json'
import type { PortfolioData } from './types/portfolio'
import Layout from './components/Layout'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Education from './components/Education'
import Contact from './components/Contact'
import ResumeUpload from './components/ResumeUpload'

const portfolio = data as PortfolioData

export default function App() {
  // Typewriter roles come straight from the resume's job titles.
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

  return (
    <Layout name={portfolio.name} links={links}>
      <Hero name={portfolio.name} roles={roles} contact={portfolio.contact} />
      <About summary={portfolio.summary} />
      <Experience experience={portfolio.experience} />
      <Skills skills={portfolio.skills} />
      {portfolio.projects.length > 0 && <Projects projects={portfolio.projects} />}
      <Education education={portfolio.education} certifications={portfolio.certifications} />
      <Contact contact={portfolio.contact} />
      {import.meta.env.DEV && <ResumeUpload />}
    </Layout>
  )
}
