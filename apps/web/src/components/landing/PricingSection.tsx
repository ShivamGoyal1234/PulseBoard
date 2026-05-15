import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { SectionHeading, SectionLabel } from './SectionHeading'
import { PLANS } from './data'
import { LandingContain } from './LandingShell'

interface PricingSectionProps {
  onCta: () => void
}

export function PricingSection({ onCta }: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="bg-bg-surface border-y border-border py-16 scroll-mt-24"
    >
      <LandingContain>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <SectionLabel>Pricing</SectionLabel>
          <SectionHeading>Simple tiers. No surprises.</SectionHeading>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) =>
            plan.featured ? (
              <motion.div
                key={plan.name}
                className="relative rounded-xl p-6 bg-brand border border-brand text-white"
              >
                <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full mb-3 inline-block">
                  Most popular
                </span>
                <p className="text-xs font-medium text-white/80">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  <span className="text-sm text-white/80">{plan.period}</span>
                </div>
                <p className="text-xs leading-relaxed text-white/80 my-3">
                  {plan.desc}
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-xs text-white/95"
                    >
                      <Check className="size-3 shrink-0 mt-0.5 text-white" />
                      {line}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={onCta}
                  className="w-full rounded-lg h-9 text-sm font-medium bg-white text-brand"
                >
                  {plan.cta}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={plan.name}
                initial={{ y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <div className="bg-bg-subtle border border-border rounded-xl p-6 h-full flex flex-col">
                  <p className="text-xs font-medium text-txt-secondary">
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-semibold text-txt-primary">
                      {plan.price}
                    </span>
                    <span className="text-sm text-txt-secondary">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-xs text-txt-secondary leading-relaxed my-3">
                    {plan.desc}
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-2 text-xs text-txt-primary"
                      >
                        <Check className="size-3 shrink-0 mt-0.5 text-brand" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={onCta}
                    className="w-full rounded-lg h-9 text-sm font-medium border border-border bg-transparent text-txt-primary hover:bg-bg-subtle transition-colors"
                  >
                    {plan.cta}
                  </button>
                </div>
              </motion.div>
            )
          )}
        </div>
      </LandingContain>
    </section>
  )
}
