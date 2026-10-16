import { useRevealOnScroll } from '@/lib/hooks'
import Navigation from './components/Navigation'
import HeroSection from './components/HeroSection'
import ScrollStory from './components/ScrollStory'
import ServiceGallery from './components/ServiceGallery'
import SchoolPrinting from './components/SchoolPrinting'
import PrintingPress from './components/PrintingPress'
import ProductCustomizer from './components/ProductCustomizer'
import Craftsmanship from './components/Craftsmanship'
import BrandStory from './components/BrandStory'
import WhyChooseUs from './components/WhyChooseUs'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import CallBar from './components/CallBar'

export default function App() {
  useRevealOnScroll()
  return (
    <>
      <a href="#services" className="sr-only z-[60] rounded-full bg-plum px-5 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Navigation />
      <main>
        <HeroSection />
        <ScrollStory />
        <ServiceGallery />
        <SchoolPrinting />
        <PrintingPress />
        <ProductCustomizer />
        <Craftsmanship />
        <BrandStory />
        <WhyChooseUs />
        <ContactSection />
      </main>
      <Footer />
      <CallBar />
    </>
  )
}
