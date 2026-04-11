import { useEffect, useRef, useState } from 'react'
import CylinderCarousel from '../components/CylinderCarousel'
import { CARDS } from '../components/projectCards'
import './Projects.css'

/* ── Mobile scroll carousel ── */
function MobileProjectDetails({ card }) {
  if (!card) return null
  return (
    <div className="mobile-project-details">
      <div className="mobile-project-details-strip" style={{ background: card.color }} aria-hidden="true" />
      <p className="ccard-desc mobile-project-details-desc">{card.desc}</p>
      <div className="ccard-stack">
        {card.stack.map((s) => (
          <span key={s} className="ccard-badge">{s}</span>
        ))}
      </div>
      <div className="ccard-links">
        {card.live && (
          <a
            href={card.live}
            target="_blank"
            rel="noopener noreferrer"
            className="ccard-link"
            aria-label={`${card.title} — live demo`}
          >
            LIVE ↗
          </a>
        )}
        {card.github && (
          <a
            href={card.github}
            target="_blank"
            rel="noopener noreferrer"
            className="ccard-link"
            aria-label={`${card.title} — GitHub`}
          >
            GITHUB ↗
          </a>
        )}
      </div>
    </div>
  )
}

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
        {CARDS.map((card, i) => (
          <div key={card.id} className={`mcard${i === activeIdx ? ' mcard--active' : ''}`}>
            <div className="mcard-inner">
              <h3 className="mcard-title">{card.title}</h3>
              <p className="mcard-num">{String(card.id).padStart(2,'0')} / {String(CARDS.length).padStart(2,'0')}</p>
            </div>
          </div>
        ))}
      </div>
      <MobileProjectDetails card={CARDS[activeIdx]} />
      <div className="cylinder-dots" style={{ marginTop: 16 }}>
        {CARDS.map((_, i) => (
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
