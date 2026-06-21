import { useInView } from '../hooks/useInView'

interface AboutProps {
  summary: string
}

export default function About({ summary }: AboutProps) {
  const { ref, inView } = useInView()
  if (!summary) return null

  return (
    <section id="about" className="section-pad bg-gray-950" aria-labelledby="about-heading">
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`max-w-5xl mx-auto transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">About</p>
        <h2 id="about-heading" className="text-4xl font-bold text-white mb-8">
          Who I am
        </h2>

        <div className="grid sm:grid-cols-[1fr_auto] gap-10 items-start">
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
            {summary}
          </p>

          <div className="flex flex-col gap-4 min-w-[160px]">
            {[
              { value: '5+', label: 'Years Leading Teams' },
              { value: '20+', label: 'Projects Shipped' },
              { value: '∞',  label: 'Lines of Code' },
            ].map(({ value, label }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <p className="text-2xl font-bold gradient-text">{value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
