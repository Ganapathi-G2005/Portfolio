import { useEffect, useRef, useState } from 'react'
import CylinderCarousel from '../components/CylinderCarousel'
import './Projects.css'

const CARDS_DATA = [
  { id: 1, title: 'DermaGlass' },
  { id: 2, title: 'Sidekick AI' },
  { id: 3, title: 'FoodBridge' },
  { id: 4, title: 'Multimodal Pipeline' },
  { id: 5, title: 'Next Ship' },
]

/* ── Mobile scroll carousel ── */
function MobileCarousel() {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const cards = Array.from(track.querySelectorAll('.mcard'))
    const observers = cards.map((card, i) => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) setActiveIdx(i)
      }, { root: track, threshold: 0.6 })
      obs.observe(card)
      return obs
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <div className="mobile-carousel-wrap">
      <div className="mobile-carousel-track" ref={trackRef}>
        {CARDS_DATA.map((card, i) => (
          <div key={card.id} className={`mcard${i === activeIdx ? ' mcard--active' : ''}`}>
            <div className="mcard-inner">
              <h3 className="mcard-title">{card.title}</h3>
              <p className="mcard-num">{String(card.id).padStart(2,'0')} / {String(CARDS_DATA.length).padStart(2,'0')}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="cylinder-dots" style={{ marginTop: 16 }}>
        {CARDS_DATA.map((_, i) => (
          <button
            key={i}
            className={`cylinder-dot${i === activeIdx ? ' cylinder-dot--active' : ''}`}
            onClick={() => {
              const track = trackRef.current
              if (!track) return
              const cards = track.querySelectorAll('.mcard')
              cards[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center' })
            }}
            aria-label={`Project ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Projects() {
  const sectionRef = useRef(null)
  const [visible, setVisible]   = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const onChange = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="projects" className={`section projects${visible ? ' projects--visible' : ''}`} ref={sectionRef}>
      <div className="projects-inner">
        <div className="projects-header animate-child">
          <span className="section-badge">[ 003 / PROJECTS ]</span>
          <h2 className="section-header">THINGS I'VE SHIPPED</h2>
        </div>

        <div className="projects-carousel animate-child" style={{ animationDelay: '120ms' }}>
          {isMobile ? <MobileCarousel /> : <CylinderCarousel />}
        </div>
      </div>
    </section>
  )
}
