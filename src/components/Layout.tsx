import { useState, useEffect } from 'react'

interface LayoutProps {
  name: string
  links: { label: string; href: string }[]
  children: React.ReactNode
  footerExtra?: React.ReactNode
}

export default function Layout({ name, links, children, footerExtra }: LayoutProps) {
  const [active, setActive]     = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      setScrollPct(Math.min(100, pct))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    document.querySelectorAll('section[id]').forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40">
        {/* Scroll progress bar */}
        <div
          className="h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 transition-all duration-100"
          style={{ width: `${scrollPct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(scrollPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Page scroll progress"
        />

        <nav
          className="glass border-b border-white/5 px-4 sm:px-6"
          aria-label="Main navigation"
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
            <a href="#hero" className="font-bold text-white text-base tracking-tight">
              {name.split(' ')[0]}
              <span className="gradient-text">.dev</span>
            </a>

            <ul className="hidden sm:flex gap-1" role="list">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                      active === href.slice(1)
                        ? 'text-white bg-white/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <button
              className="sm:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                {menuOpen
                  ? <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                  : <path fillRule="evenodd" clipRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                }
              </svg>
            </button>
          </div>
        </nav>

        {menuOpen && (
          <ul
            className="sm:hidden glass border-b border-white/5 px-4 pb-4 pt-2 flex flex-col gap-1"
            role="list"
          >
            {links.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="block text-sm font-medium text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <main id="main-content" className="bg-gray-950">
        {children}
      </main>

      <footer className="bg-gray-950 border-t border-gray-800/50 text-gray-500 text-sm py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} {name}</p>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">Built with React · Vite · Tailwind CSS</p>
            {footerExtra && <span className="text-gray-700" aria-hidden="true">·</span>}
            {footerExtra}
          </div>
        </div>
      </footer>
    </>
  )
}
