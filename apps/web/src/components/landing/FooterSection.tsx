import { LandingContain } from './LandingShell'

export function FooterSection() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[#141412] pt-12 pb-8">
      <LandingContain className="max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <span className="inline-flex h-8 w-8 rounded-md bg-brand items-center justify-center text-txt-inverse text-sm font-bold mb-3">
              P
            </span>
            <p className="text-xs text-[#5A5856] leading-relaxed max-w-[180px]">
              Real-time polls with analytics that matter. Built for teams who ship.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#8C8A86] uppercase tracking-wider mb-3">
              Product
            </p>
            <a
              href="#features"
              className="text-xs text-[#5A5856] hover:text-[#8C8A86] block mb-2 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-xs text-[#5A5856] hover:text-[#8C8A86] block mb-2 transition-colors"
            >
              Pricing
            </a>
            <span className="text-xs text-[#5A5856] block mb-2">Changelog</span>
            <span className="text-xs text-[#5A5856] block mb-2">Roadmap</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[#8C8A86] uppercase tracking-wider mb-3">
              Developers
            </p>
            <a
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#5A5856] hover:text-[#8C8A86] block mb-2 transition-colors"
            >
              API docs (Swagger)
            </a>
            <a
              href="#architecture"
              className="text-xs text-[#5A5856] hover:text-[#8C8A86] block mb-2 transition-colors"
            >
              Architecture
            </a>
            <span className="text-xs text-[#5A5856] block mb-2">GitHub</span>
            <span className="text-xs text-[#5A5856] block mb-2">Status</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[#8C8A86] uppercase tracking-wider mb-3">
              Company
            </p>
            <span className="text-xs text-[#5A5856] block mb-2">About</span>
            <span className="text-xs text-[#5A5856] block mb-2">Blog</span>
            <span className="text-xs text-[#5A5856] block mb-2">Privacy</span>
            <span className="text-xs text-[#5A5856] block mb-2">Terms</span>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#5A5856]">
            © {year} PulseBoard. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-[#5A5856]">
            <a href="#faq" className="hover:text-[#8C8A86] transition-colors">
              Privacy
            </a>
            <span aria-hidden>·</span>
            <a href="#faq" className="hover:text-[#8C8A86] transition-colors">
              Terms
            </a>
            <span aria-hidden>·</span>
            <span>Cookies</span>
          </div>
        </div>
      </LandingContain>
    </footer>
  )
}
