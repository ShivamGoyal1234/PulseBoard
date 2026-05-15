import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { SectionHeading, SectionLabel } from './SectionHeading'
import { TESTIMONIALS } from './data'
import { LandingContain } from './LandingShell'

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="bg-bg-surface border-y border-border py-16 scroll-mt-24"
    >
      <LandingContain>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <SectionLabel>Testimonials</SectionLabel>
          <SectionHeading>Loved by product teams across India</SectionHeading>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-bg-subtle rounded-xl p-5 border border-border"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-3 text-amber-400 fill-amber-400"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-sm text-txt-primary leading-relaxed mb-4 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${t.avatarBg} ${t.avatarColor}`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-xs font-medium text-txt-primary">
                    {t.name}
                  </div>
                  <div className="text-xs text-txt-secondary">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </LandingContain>
    </section>
  )
}
