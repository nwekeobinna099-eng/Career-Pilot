import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import CompanyTicker from '@/components/landing/CompanyTicker'
import FeaturesSection from '@/components/landing/FeaturesSection'
import ComparisonSection from '@/components/landing/ComparisonSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 overflow-x-hidden font-sans">
      {/* Global Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <Navbar />

      <main>
        <HeroSection />
        <CompanyTicker />
        <FeaturesSection />
        <ComparisonSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}
