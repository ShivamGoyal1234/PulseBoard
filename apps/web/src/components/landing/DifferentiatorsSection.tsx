import { motion } from 'framer-motion'
import { Card } from '../Card'
import { SectionHeading, SectionLabel } from './SectionHeading'
import { DIFFS } from './data'
import { LandingContain } from './LandingShell'

export function DifferentiatorsSection() {
  return (
    <section id="differentiators" className="py-20 scroll-mt-24">
      <LandingContain>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
        >
          <SectionLabel>Why PulseBoard</SectionLabel>
          <SectionHeading>Built for teams who care about signal</SectionHeading>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIFFS.map((d) => (
            <Card key={d.title} className="p-5 rounded-xl">
              <div className="flex flex-row gap-4">
                <div
                  className={`w-11 h-11 rounded-xl ${d.iconBg} flex items-center justify-center shrink-0`}
                >
                  <d.icon className={`size-5 ${d.iconColor}`} aria-hidden />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-sm font-semibold text-txt-primary mb-1.5">
                    {d.title}
                  </h3>
                  <p className="text-xs text-txt-secondary leading-relaxed mb-3">
                    {d.desc}
                  </p>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 w-fit ${d.tagBg} ${d.tagColor}`}
                  >
                    {d.tag}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </LandingContain>
    </section>
  )
}
