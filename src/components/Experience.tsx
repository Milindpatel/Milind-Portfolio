import { useInView } from '../hooks/useInView'
import type { Experience as ExperienceType } from '../types/portfolio'

interface ExperienceProps {
  experience: ExperienceType[]
}

function ExperienceItem({ job, index }: { job: ExperienceType; index: number }) {
  const { ref, inView } = useInView(0.1)

  return (
    <li
      ref={ref as React.RefObject<HTMLLIElement>}
      className={`pl-8 relative transition-all duration-700 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <span
        className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-gray-950 ring-2 ring-blue-500/30"
        aria-hidden="true"
      />

      <div className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold text-lg">{job.title}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap font-mono">
            {job.startDate} — {job.endDate}
          </span>
        </div>

        <p className="text-blue-400 text-sm font-medium mb-4">
          {job.company}
          {job.location && <span className="text-gray-600 font-normal"> · {job.location}</span>}
        </p>

        {job.bullets.length > 0 && (
          <ul className="space-y-2" aria-label={`Responsibilities at ${job.company}`}>
            {job.bullets.map((b, j) => (
              <li key={j} className="flex gap-2.5 text-gray-400 text-sm leading-relaxed">
                <span className="text-blue-500 mt-0.5 shrink-0" aria-hidden="true">▸</span>
                {b}
              </li>
            ))}
          </ul>
        )}

        {job.tech && job.tech.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/5" aria-label={`Technologies used at ${job.company}`}>
            {job.tech.map((t, j) => (
              <li key={j} className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded text-xs font-medium">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export default function Experience({ experience }: ExperienceProps) {
  if (experience.length === 0) return null

  return (
    <section id="experience" className="section-pad bg-gray-950" aria-labelledby="experience-heading">
      <div className="max-w-5xl mx-auto">
        <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Career</p>
        <h2 id="experience-heading" className="text-4xl font-bold text-white mb-12">
          Experience
        </h2>

        <ol className="relative border-l border-gray-800 space-y-8 ml-2" aria-label="Work history">
          {experience.map((job, i) => (
            <ExperienceItem key={i} job={job} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
