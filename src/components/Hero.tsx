import { useState, useEffect } from 'react'
import type { Contact } from '../types/portfolio'

interface HeroProps {
  name: string
  roles: string[]
  contact: Contact
  available: boolean
}

export default function Hero({ name, roles, contact, available }: HeroProps) {
  const [roleIdx, setRoleIdx]   = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = roles[roleIdx]
    if (!deleting && displayed.length < current.length) {
      const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 75)
      return () => clearTimeout(t)
    }
    if (!deleting && displayed.length === current.length) {
      const t = setTimeout(() => setDeleting(true), 2200)
      return () => clearTimeout(t)
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 35)
      return () => clearTimeout(t)
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false)
      setRoleIdx(i => (i + 1) % roles.length)
    }
  }, [displayed, deleting, roleIdx, roles])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gray-950 pt-14"
      aria-label="Introduction"
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-blue-700/25 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-3/4 left-1/3  w-[300px] h-[300px] bg-cyan-700/15  rounded-full blur-3xl animate-float" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'linear-gradient(to right,#ffffff08 1px,transparent 1px),linear-gradient(to bottom,#ffffff08 1px,transparent 1px)', backgroundSize: '72px 72px' }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-28 w-full">

        {available ? (
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-10">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" aria-hidden="true" />
            Available for opportunities
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-gray-500/10 border border-gray-500/20 text-gray-400 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-10">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" aria-hidden="true" />
            Not currently available
          </div>
        )}

        <h1 className="text-6xl sm:text-8xl font-extrabold leading-none mb-6 tracking-tight">
          <span className="text-white">{name.split(' ')[0]}&nbsp;</span>
          <span className="gradient-text">{name.split(' ').slice(1).join(' ')}</span>
        </h1>

        {/* Typewriter */}
        <div className="flex items-center gap-2 mb-10 h-9" aria-live="polite" aria-atomic="true">
          <span className="text-xl sm:text-2xl text-gray-300 font-light">{displayed}</span>
          <span className="inline-block w-0.5 h-7 bg-blue-400 animate-blink" aria-hidden="true" />
        </div>

        <div className="flex flex-wrap gap-4 mb-14">
          <a
            href="#experience"
            className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-700/30 hover:-translate-y-0.5"
          >
            View My Work
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/>
            </svg>
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-xl transition-all hover:bg-white/5"
          >
            Get in Touch
          </a>
        </div>

        {/* Social strip */}
        <div className="flex items-center gap-5 text-gray-500">
          {contact.github && (
            <a href={contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in new tab)" className="hover:text-gray-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in new tab)" className="hover:text-gray-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} aria-label={`Email ${contact.email}`} className="hover:text-gray-200 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </a>
          )}
          {contact.location && (
            <span className="flex items-center gap-1.5 text-sm">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              {contact.location}
            </span>
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-700" aria-hidden="true">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gray-700 to-transparent" />
      </div>
    </section>
  )
}
