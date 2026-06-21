import { useInView } from '../hooks/useInView'
import type { Education as EducationType } from '../types/portfolio'

interface EducationProps {
  education: EducationType[]
  certifications: string[]
}

export default function Education({ education, certifications }: EducationProps) {
  const { ref, inView } = useInView()
  if (education.length === 0 && certifications.length === 0) return null

  return (
    <section id="education" className="section-pad bg-gray-900/50" aria-labelledby="education-heading">
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`max-w-5xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Background</p>
        <h2 id="education-heading" className="text-4xl font-bold text-white mb-10">
          Education &amp; Certifications
        </h2>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Education cards */}
          {education.length > 0 && (
            <ul className="lg:col-span-2 grid sm:grid-cols-2 gap-5" role="list">
              {education.map((ed, i) => (
                <li key={i} className="glass rounded-2xl p-6 flex flex-col gap-2 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <span className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </span>
                    {ed.score && (
                      <span className="text-xs font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">
                        {ed.score}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm leading-snug mt-1">{ed.degree}</h3>
                  <p className="text-blue-400 text-sm">{ed.institution}</p>
                  <p className="text-gray-500 text-xs mt-auto">
                    {[ed.location, ed.period].filter(Boolean).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-blue-400" aria-hidden="true">
                  <circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 22l5-3 5 3-1.21-8.11"/>
                </svg>
                Certifications
              </h3>
              <ul className="space-y-3" role="list">
                {certifications.map((cert, i) => (
                  <li key={i} className="flex gap-2.5 text-gray-300 text-sm leading-snug">
                    <span className="text-blue-500 mt-0.5 shrink-0" aria-hidden="true">✦</span>
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
