import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ArchitectureSection } from '../components/landing/ArchitectureSection'
import { CtaBannerSection } from '../components/landing/CtaBannerSection'
import { DashboardPreviewSection } from '../components/landing/DashboardPreviewSection'
import { DifferentiatorsSection } from '../components/landing/DifferentiatorsSection'
import { FaqSection } from '../components/landing/FaqSection'
import { FeaturesSection } from '../components/landing/FeaturesSection'
import { FooterSection } from '../components/landing/FooterSection'
import { HeroSection } from '../components/landing/HeroSection'
import { HowItWorksSection } from '../components/landing/HowItWorksSection'
import { PricingSection } from '../components/landing/PricingSection'
// import { TechStackSection } from '../components/landing/TechStackSection'
import { TestimonialsSection } from '../components/landing/TestimonialsSection'

export function Landing() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const goToAppOrLogin = useCallback(() => {
    if (useAuthStore.getState().isAuthed()) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }, [navigate])

  return (
    <main className="bg-bg-page">
      <HeroSection
        onPrimary={goToAppOrLogin}
        onDemo={() => navigate('/p/demo')}
      />
      <DashboardPreviewSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DifferentiatorsSection />
      <ArchitectureSection />
      <TestimonialsSection />
      {/* <TechStackSection /> */}
      <PricingSection onCta={goToAppOrLogin} />
      <FaqSection
        openIndex={openFaq}
        onToggle={(index) =>
          setOpenFaq((prev) => (prev === index ? null : index))
        }
      />
      <CtaBannerSection
        onPrimary={goToAppOrLogin}
        onDemo={() => navigate('/p/demo')}
      />
      <FooterSection />
    </main>
  )
}
