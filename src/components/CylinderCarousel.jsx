import { useEffect, useRef, useState, useCallback } from 'react'
import './CylinderCarousel.css'

export const CARDS = [
  {
    id: 1,
    title: 'DermaGlass',
    desc: 'Full stack AI healthcare platform for automated skin disease diagnosis - Deep Learning - Agentic reasoning.',
    stack: ['PyTorch', 'EfficientNet', 'LangGraph', 'FastAPI'],
    color: '#FF3B00',
    live: 'https://dermaglass.vercel.app/',
  },
  {
    id: 2,
    title: 'Sidekick AI',
    desc: 'Personal AI assistant - agentic architecture - Self evaluating - RAG pipeline - Tool usage.',
    stack: ['LangGraph', 'RAG', 'FastAPI', 'OpenAI', 'Playwright', 'Tavily'],
    color: '#FFD600',
    live: 'https://personal-assistant-xi-steel.vercel.app/',
  },
  {
    id: 3,
    title: 'Next Ship',
    desc: 'Something is cooking — stay tuned. Check the GitHub for early drops.',
    stack: ['TBD'],
    color: '#3B82F6',
    github: 'https://github.com/Ganapathi-G2005',
  },
]

const N = CARDS.length
const CARD_W = 300
const CARD_H = 400

function getRadius(n, w) {
  return (w / 2) / Math.tan(Math.PI / n)
}

export default function CylinderCarousel() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [angle, setAngle]         = useState(0)   // current rotation degrees
  const containerRef = useRef(null)
  const dragging = useRef(false)
  const startX   = useRef(0)
  const startAngle = useRef(0)
  const momentum = useRef(0)
  const animFrame= useRef(null)
  const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const RADIUS = getRadius(N, CARD_W)

  // Snap to nearest card
  const snapToCard = useCallback((fromAngle) => {
    const step = 360 / N
    const nearest = Math.round(fromAngle / step) * step
    setAngle(nearest)
    const idx = ((Math.round(-nearest / step) % N) + N) % N
    setActiveIdx(idx)
  }, [])

  // Lerp to target angle
  const lerpTo = useCallback((target) => {
    if (reduced) { setAngle(target); return }
    cancelAnimationFrame(animFrame.current)
    let current = angle
    const step = () => {
      current += (target - current) * 0.12
      setAngle(current)
      if (Math.abs(target - current) > 0.1) {
        animFrame.current = requestAnimationFrame(step)
      } else {
        setAngle(target)
      }
    }
    animFrame.current = requestAnimationFrame(step)
  }, [angle, reduced])

  const rotateTo = useCallback((idx) => {
    const step = 360 / N
    const target = -idx * step
    lerpTo(target)
    setActiveIdx(idx)
  }, [lerpTo])

  const rotateBy = useCallback((delta) => {
    const step = 360 / N
    const newIdx = ((activeIdx + delta) % N + N) % N
    rotateTo(newIdx)
  }, [activeIdx, rotateTo])

  // Mouse drag
  const onMouseDown = (e) => {
    dragging.current = true
    startX.current = e.clientX
    startAngle.current = angle
    cancelAnimationFrame(animFrame.current)
  }
  const onMouseMove = (e) => {
    if (!dragging.current) return
    const delta = (e.clientX - startX.current) * 0.4
    setAngle(startAngle.current + delta)
  }
  const onMouseUp = (e) => {
    if (!dragging.current) return
    dragging.current = false
    snapToCard(angle)
  }

  // Touch drag
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    startAngle.current = angle
    cancelAnimationFrame(animFrame.current)
  }
  const onTouchMove = (e) => {
    const delta = (e.touches[0].clientX - startX.current) * 0.4
    setAngle(startAngle.current + delta)
  }
  const onTouchEnd = () => snapToCard(angle)

  useEffect(() => {
    return () => cancelAnimationFrame(animFrame.current)
  }, [])

  return (
    <div className="cylinder-outer">
      {/* Left arrow */}
      <button
        className="cylinder-arrow cylinder-arrow--left"
        onClick={() => rotateBy(-1)}
        aria-label="Previous project"
        id="cylinder-prev"
      >
        ←
      </button>

      {/* 3D scene */}
      <div
        className="cylinder-scene"
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'none' }}
        role="region"
        aria-label="3D project carousel"
      >
        <div
          className="cylinder"
          style={{ transform: `rotateY(${angle}deg)` }}
        >
          {CARDS.map((card, i) => {
            const cardAngle = (360 / N) * i
            const isActive  = i === activeIdx
            return (
              <div
                key={card.id}
                className={`cylinder-card${isActive ? ' cylinder-card--active' : ''}`}
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(${RADIUS}px)`,
                  '--card-color': card.color,
                  boxShadow: isActive
                    ? `8px 8px 0 ${card.color}`
                    : 'none',
                }}
                onClick={() => !dragging.current && rotateTo(i)}
              >
                {/* Top accent strip */}
                <div className="ccard-strip" style={{ background: card.color }} />

                {/* Card number */}
                <span className="ccard-num">
                  {String(card.id).padStart(2,'0')} / {String(N).padStart(2,'0')}
                </span>

                {/* Title */}
                <h3 className="ccard-title">{card.title}</h3>

                {/* Stack badges */}
                <div className="ccard-stack">
                  {card.stack.map(s => (
                    <span key={s} className="ccard-badge">{s}</span>
                  ))}
                </div>

                {/* Description */}
                <p className="ccard-desc">{card.desc}</p>

                {/* Links */}
                <div className="ccard-links">
                  {card.live && (
                    <a
                      href={card.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ccard-link"
                      onClick={e => e.stopPropagation()}
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
                      onClick={e => e.stopPropagation()}
                      aria-label={`${card.title} — GitHub`}
                    >
                      GITHUB ↗
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right arrow */}
      <button
        className="cylinder-arrow cylinder-arrow--right"
        onClick={() => rotateBy(1)}
        aria-label="Next project"
        id="cylinder-next"
      >
        →
      </button>

      {/* Dot indicators */}
      <div className="cylinder-dots" role="tablist" aria-label="Project cards">
        {CARDS.map((card, i) => (
          <button
            key={card.id}
            className={`cylinder-dot${i === activeIdx ? ' cylinder-dot--active' : ''}`}
            onClick={() => rotateTo(i)}
            role="tab"
            aria-selected={i === activeIdx}
            aria-label={`Project ${i + 1}: ${card.title}`}
          />
        ))}
      </div>
    </div>
  )
}
