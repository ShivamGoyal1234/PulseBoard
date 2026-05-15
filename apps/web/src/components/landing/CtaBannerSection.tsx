import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { LandingContain } from './LandingShell'

interface CtaBannerSectionProps {
  onPrimary: () => void
  onDemo: () => void
}

export function CtaBannerSection({ onPrimary, onDemo }: CtaBannerSectionProps) {
  return (
    <section className="relative overflow-hidden py-20">
      <LandingContain>
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-16 sm:px-12 sm:py-20 text-center"
          style={{
            background:
              'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 50%, #06B6D4 100%)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Grid texture overlay */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage:
                'radial-gradient(ellipse 60% 80% at 50% 50%, black 30%, transparent 80%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 60% 80% at 50% 50%, black 30%, transparent 80%)',
            }}
          />

          {/* Floating orbs */}
          <motion.div
            aria-hidden
            className="absolute -top-24 -left-12 h-72 w-72 rounded-full blur-3xl"
            style={{ background: 'rgba(168,85,247,0.45)' }}
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full blur-3xl"
            style={{ background: 'rgba(34,211,238,0.45)' }}
            animate={{ x: [0, -25, 0], y: [0, -30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur border border-white/20 px-3 py-1.5 text-[11px] font-medium text-white mb-6"
            >
              <Sparkles className="size-3.5" /> Free forever for personal polls
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-semibold tracking-tight text-white mb-4 leading-[1.1]"
            >
              Ready to run a poll
              <br />
              <span className="text-white/80">that actually matters?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-white/80 max-w-md mx-auto mb-10 leading-relaxed"
            >
              Create your first poll in 2 minutes. No credit card. Cancel
              anytime. Watch the responses land in real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-3 justify-center flex-wrap"
            >
              <button
                type="button"
                onClick={onPrimary}
                className="inline-flex items-center gap-2 bg-white text-[#1E1B4B] rounded-xl px-7 py-3.5 text-base font-semibold hover:bg-white/90 transition-colors shadow-lg"
              >
                Get started free
                <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={onDemo}
                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/25 rounded-xl px-7 py-3.5 text-base font-semibold hover:bg-white/15 transition-colors backdrop-blur"
              >
                <Play className="size-4" />
                Try the live demo
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.7 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-xs text-white/70 mt-6"
            >
              Join 12,400+ teams collecting smarter feedback
            </motion.p>
          </div>
        </div>
      </LandingContain>
    </section>
  )
}
