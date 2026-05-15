import { motion } from 'framer-motion'
import { SectionHeading, SectionLabel } from './SectionHeading'
import { TECHS } from './data'
import { LandingContain } from './LandingShell'

export function TechStackSection() {
  return (
    <section id="tech" className="py-20 scroll-mt-24">
      <LandingContain>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
        >
          <SectionLabel>Tech stack</SectionLabel>
          <SectionHeading>Modern, boring, reliable</SectionHeading>
        </motion.div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {TECHS.map(({ Icon, name, type }) => (
            <div
              key={name}
              className="bg-bg-surface border border-border rounded-xl p-3 text-center"
            >
              <Icon className="size-8 mx-auto mb-1 text-brand" aria-hidden />
              <div className="text-xs font-medium text-txt-primary">{name}</div>
              <div className="text-[10px] text-txt-tertiary mt-0.5">{type}</div>
            </div>
          ))}
        </div>
      </LandingContain>
    </section>
  )
}
