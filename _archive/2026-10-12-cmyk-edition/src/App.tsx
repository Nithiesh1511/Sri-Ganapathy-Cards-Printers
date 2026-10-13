import { useRevealOnScroll } from '@/lib/hooks'
import ScrollInk from './components/ScrollInk'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Promises from './components/Promises'
import Showroom from './components/Showroom'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CallBar from './components/CallBar'

export default function App() {
  useRevealOnScroll()
  return (
    <>
      <ScrollInk />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Promises />
        <Showroom />
        <Contact />
      </main>
      <Footer />
      <CallBar />
    </>
  )
}
