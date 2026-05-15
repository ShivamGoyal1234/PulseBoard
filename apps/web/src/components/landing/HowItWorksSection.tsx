import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { SectionHeading, SectionLabel } from './SectionHeading'
import { STEPS } from './data'
import { LandingContain } from './LandingShell'

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-bg-surface border-y border-border py-20 scroll-mt-24"
    >
      {/* Decorative gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 opacity-50"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 40% at 50% 0%, var(--brand-primary-bg) 0%, transparent 70%)',
        }}
      />

      <LandingContain>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 max-w-2xl mx-auto relative"
        >
          <SectionLabel>How it works</SectionLabel>
          <SectionHeading>From idea to insight in four steps</SectionHeading>
          <p className="text-base text-txt-secondary leading-relaxed">
            No setup, no training. Build, share, watch, publish.
          </p>
        </motion.div>

        {/* Step rail with connecting line */}
        <div className="relative">
          <div
            aria-hidden
            className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px"
            style={{
              backgroundImage:
                'linear-gradient(to right, transparent, var(--border-strong) 20%, var(--border-strong) 80%, transparent)',
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative text-center"
              >
                <div className="relative inline-flex items-center justify-center mb-5">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full blur-md"
                    style={{
                      background: 'var(--brand-primary-bg)',
                      transform: 'scale(1.6)',
                      opacity: 0.7,
                    }}
                  />
                  <span
                    className="relative inline-flex h-14 w-14 rounded-full text-base font-semibold items-center justify-center text-txt-inverse"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    {step.num}
                  </span>
                </div>
                <p className="text-base font-semibold text-txt-primary mb-2">
                  {step.title}
                </p>
                <p className="text-sm text-txt-secondary leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>

                {idx < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className="hidden md:inline-flex absolute right-0 top-6 translate-x-1/2 text-txt-tertiary"
                  >
                    <ArrowRight className="size-4" />
                  </span>
                ) : null}
                {idx < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className="md:hidden flex justify-center mt-4 text-txt-tertiary"
                  >
                    <ArrowDown className="size-4" />
                  </span>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </LandingContain>
    </section>
  )
}
