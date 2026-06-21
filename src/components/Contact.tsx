import { useInView } from '../hooks/useInView'
import type { Contact as ContactType } from '../types/portfolio'

interface ContactProps {
  contact: ContactType
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

export default function Contact({ contact }: ContactProps) {
  const { ref, inView } = useInView()

  const links = [
    contact.email    && { label: 'Email',    href: `mailto:${contact.email}`,    Icon: EmailIcon,    display: contact.email },
    contact.linkedin && { label: 'LinkedIn', href: contact.linkedin,             Icon: LinkedInIcon, display: 'LinkedIn' },
    contact.github   && { label: 'GitHub',   href: contact.github,               Icon: GitHubIcon,   display: 'GitHub' },
  ].filter(Boolean) as { label: string; href: string; Icon: () => React.JSX.Element; display: string }[]

  return (
    <section id="contact" className="section-pad relative overflow-hidden bg-gray-950" aria-labelledby="contact-heading">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-3xl" />
      </div>

      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`relative max-w-5xl mx-auto text-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Say Hello</p>
        <h2 id="contact-heading" className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Let's Work Together
        </h2>
        <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto">
          Open to new opportunities, collaborations, and conversations about building great things on the web.
        </p>

        {links.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-4 mb-10" role="list">
            {links.map(({ label, href, Icon, display }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(href.startsWith('mailto') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  aria-label={`${label}${href.startsWith('mailto') ? '' : ' (opens in new tab)'}`}
                  className="inline-flex items-center gap-2.5 glass hover:bg-white/15 text-gray-200 hover:text-white rounded-xl px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
                >
                  <Icon />
                  {display}
                </a>
              </li>
            ))}
          </ul>
        )}

        {contact.location && (
          <p className="text-gray-600 text-sm flex items-center justify-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
            Based in {contact.location}
          </p>
        )}

        <p className="text-gray-700 text-xs mt-6">
          Portfolio auto-generated from resume · last updated {new Date().getFullYear()}
        </p>
      </div>
    </section>
  )
}
