import { useInView } from '../hooks/useInView'
import type { Project } from '../types/portfolio'

interface ProjectsProps {
  projects: Project[]
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { ref, inView } = useInView(0.1)

  return (
    <li
      ref={ref as React.RefObject<HTMLLIElement>}
      className={`glass rounded-2xl p-6 flex flex-col gap-4 hover:bg-line/10 hover:-translate-y-1 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <h3 className="font-semibold text-content text-base">{project.name}</h3>

      {project.description && (
        <p className="text-muted text-sm leading-relaxed flex-1">{project.description}</p>
      )}

      {project.technologies && project.technologies.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Technologies used">
          {project.technologies.map((tech, j) => (
            <li key={j} className="px-2 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded text-xs font-medium">
              {tech}
            </li>
          ))}
        </ul>
      )}

      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${project.name} (opens in new tab)`}
          className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mt-auto"
        >
          View project
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M3.5 3a.5.5 0 000 1H7.29L2.15 9.15a.5.5 0 10.7.7L8 4.71V8.5a.5.5 0 001 0v-5a.5.5 0 00-.5-.5h-5z"/>
          </svg>
        </a>
      )}
    </li>
  )
}

export default function Projects({ projects }: ProjectsProps) {
  if (projects.length === 0) return null

  return (
    <section id="projects" className="section-pad bg-app" aria-labelledby="projects-heading">
      <div className="max-w-5xl mx-auto">
        <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Work</p>
        <h2 id="projects-heading" className="text-4xl font-bold text-content mb-10">
          Projects
        </h2>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
          {projects.map((project, i) => (
            <ProjectCard key={i} project={project} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
