import { useInView } from '../hooks/useInView'
import type { SkillGroup } from '../types/portfolio'

interface SkillsProps {
  skills: SkillGroup[]
}

export default function Skills({ skills }: SkillsProps) {
  const { ref, inView } = useInView(0.1)
  if (skills.length === 0) return null

  return (
    <section id="skills" className="section-pad bg-gray-950" aria-labelledby="skills-heading">
      <div ref={ref as React.RefObject<HTMLDivElement>} className="max-w-5xl mx-auto">
        <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Toolkit</p>
        <h2 id="skills-heading" className="text-4xl font-bold text-white mb-10">
          Skills
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((group, gi) => (
            <div
              key={group.category}
              className={`glass rounded-2xl p-5 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${gi * 80}ms` }}
            >
              <h3 className="text-gray-300 text-xs font-semibold tracking-widest uppercase mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
                {group.category}
              </h3>
              <ul className="flex flex-wrap gap-2" role="list" aria-label={`${group.category} skills`}>
                {group.items.map((skill, i) => (
                  <li
                    key={i}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-200 hover:bg-blue-500/15 hover:border-blue-500/40 hover:text-white transition-all cursor-default"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
