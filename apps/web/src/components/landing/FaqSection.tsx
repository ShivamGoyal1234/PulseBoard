import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { SectionHeading, SectionLabel } from './SectionHeading'
import { FAQS } from './data'
import { LandingContain } from './LandingShell'

interface FaqSectionProps {
  openIndex: number | null
  onToggle: (index: number) => void
}

export function FaqSection({ openIndex, onToggle }: FaqSectionProps) {
  return (
    <section id="faq" className="py-20 scroll-mt-24">
      <LandingContain className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
        >
          <SectionLabel>FAQ</SectionLabel>
          <SectionHeading>Questions, answered</SectionHeading>
        </motion.div>
        <div>
          {FAQS.map((item, index) => {
            const open = openIndex === index
            return (
              <div key={item.q} className="border-b border-border py-4">
                <button
                  type="button"
                  className="flex w-full justify-between items-center cursor-pointer text-left gap-3"
                  onClick={() => onToggle(index)}
                  aria-expanded={open}
                >
                  <span className="text-sm font-medium text-txt-primary">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="size-5 text-txt-secondary" />
                  </motion.span>
                </button>
                {open ? (
                  <p className="text-sm text-txt-secondary leading-relaxed mt-3">
                    {item.a}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      </LandingContain>
    </section>
  )
}
