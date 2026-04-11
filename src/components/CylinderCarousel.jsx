import { useRef, useState, useCallback, useEffect } from 'react'
import { CARDS } from './projectCards'
import './CylinderCarousel.css'

const N      = CARDS.length
const CARD_W = 300

/** ms — time-based ease reads smoother than exponential lerp */
const CAROUSEL_MS = 520

function getRadius(n, w) {
  return (w / 2) / Math.tan(Math.PI / n)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** Which card faces the camera at this cylinder angle (same grid as snap). */
function frontIndexFromAngle(a) {
  const step = 360 / N
  const nearest = Math.round(a / step) * step
  return ((Math.round(-nearest / step) % N) + N) % N
}

/** Keep angle in (−360, 360] so numeric drift does not grow forever */
function wrapCylinderAngle(a) {
  return a - Math.round(a / 360) * 360
}

export default function CylinderCarousel() {
  const [angle, setAngle] = useState(0)

  const containerRef   = useRef(null)
  const dragging       = useRef(false)
  const startX         = useRef(0)
  const startAngle     = useRef(0)
  const animFrame      = useRef(null)
  const angleRef       = useRef(0)

  const reduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const RADIUS = getRadius(N, CARD_W)

  useEffect(() => { angleRef.current = angle }, [angle])

  const frontIdx = frontIndexFromAngle(angle)

  const runAngleAnimation = useCallback((from, to) => {
    if (reduced) {
      const w = wrapCylinderAngle(to)
      setAngle(w)
      angleRef.current = w
      return
    }
    if (Math.abs(to - from) < 1e-4) {
      const w = wrapCylinderAngle(to)
      setAngle(w)
      angleRef.current = w
      return
    }
    cancelAnimationFrame(animFrame.current)
    const t0 = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / CAROUSEL_MS)
      const cur = from + (to - from) * easeInOutCubic(t)
      setAngle(cur)
      angleRef.current = cur
      if (t < 1) {
        animFrame.current = requestAnimationFrame(tick)
      } else {
        const w = wrapCylinderAngle(to)
        setAngle(w)
        angleRef.current = w
      }
    }
    animFrame.current = requestAnimationFrame(tick)
  }, [reduced])

  // ── snap to nearest card ─────────────────────────────────────────
  const snapToCard = useCallback((fromAngle) => {
    const step    = 360 / N
    const nearest = Math.round(fromAngle / step) * step
    runAngleAnimation(fromAngle, nearest)
  }, [runAngleAnimation])

  // Pick −idx·step + m·360 closest to current angle (shortest path for dots / card tap)
  const canonicalTarget = useCallback((idx) => {
    const step = 360 / N
    const base = -idx * step
    const cur  = angleRef.current
    let best = base
    let bestAbs = Math.abs(base - cur)
    for (let m = -3; m <= 3; m++) {
      const t = base + m * 360
      const d = Math.abs(t - cur)
      if (d < bestAbs) {
        best = t
        bestAbs = d
      }
    }
    return best
  }, [])

  // ── rotate to specific index (shortest path) ─────────────────────
  const rotateTo = useCallback((idx) => {
    const target = canonicalTarget(idx)
    const from = angleRef.current
    runAngleAnimation(from, target)
  }, [canonicalTarget, runAngleAnimation])

  // One step in carousel order (wrap: last → right = one more −step, not shortest to 0°)
  const rotateBy = useCallback((delta) => {
    const step = 360 / N
    const from = angleRef.current
    const target = from - delta * step
    runAngleAnimation(from, target)
  }, [runAngleAnimation])

  // ── mouse ────────────────────────────────────────────────────────
  const onMouseDown = (e) => {
    dragging.current   = true
    startX.current     = e.clientX
    startAngle.current = angleRef.current
    cancelAnimationFrame(animFrame.current)
  }
  const onMouseMove = (e) => {
    if (!dragging.current) return
    const next = startAngle.current + (e.clientX - startX.current) * 0.45
    setAngle(next)
    angleRef.current = next
  }
  const onMouseUp = () => {
    if (!dragging.current) return
    dragging.current = false
    snapToCard(angleRef.current)
  }

  // ── touch ────────────────────────────────────────────────────────
  const onTouchStart = (e) => {
    startX.current     = e.touches[0].clientX
    startAngle.current = angleRef.current
    cancelAnimationFrame(animFrame.current)
  }
  const onTouchMove = (e) => {
    const next = startAngle.current + (e.touches[0].clientX - startX.current) * 0.45
    setAngle(next)
    angleRef.current = next
  }
  const onTouchEnd = () => snapToCard(angleRef.current)

  // ── keyboard ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  rotateBy(-1)
      if (e.key === 'ArrowRight') rotateBy(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rotateBy])

  useEffect(() => () => cancelAnimationFrame(animFrame.current), [])

  return (
    <div className="cylinder-outer">

      {/* left arrow */}
      <button
        className="cylinder-arrow cylinder-arrow--left"
        onClick={() => rotateBy(-1)}
        aria-label="Previous project"
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
            const isActive  = i === frontIdx
            return (
              <div
                key={card.id}
                className={`cylinder-card${isActive ? ' cylinder-card--active' : ''}`}
                style={{
                  transform    : `rotateY(${cardAngle}deg) translateZ(${RADIUS}px)`,
                  '--card-color': card.color,
                  boxShadow    : isActive ? `8px 8px 0 ${card.color}` : 'none',
                }}
                onClick={() => !dragging.current && rotateTo(i)}
              >
                {/* top accent strip */}
                <div className="ccard-strip" style={{ background: card.color }} />

                {/* card number */}
                <span className="ccard-num">
                  {String(card.id).padStart(2, '0')} / {String(N).padStart(2, '0')}
                </span>

                {/* title */}
                <h3 className="ccard-title">{card.title}</h3>

                {/* stack badges */}
                <div className="ccard-stack">
                  {card.stack.map(s => (
                    <span key={s} className="ccard-badge">{s}</span>
                  ))}
                </div>

                {/* description */}
                <p className="ccard-desc">{card.desc}</p>

                {/* links */}
                <div className="ccard-links">
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
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* right arrow */}
      <button
        className="cylinder-arrow cylinder-arrow--right"
        onClick={() => rotateBy(1)}
        aria-label="Next project"
      >
        →
      </button>

      {/* dot indicators — active dot uses card's own accent color */}
      <div className="cylinder-dots" role="tablist" aria-label="Project cards">
        {CARDS.map((card, i) => (
          <button
            key={card.id}
            className={`cylinder-dot${i === frontIdx ? ' cylinder-dot--active' : ''}`}
            style={i === frontIdx ? { background: card.color, borderColor: card.color } : {}}
            onClick={() => rotateTo(i)}
            role="tab"
            aria-selected={i === frontIdx}
            aria-label={`Project ${i + 1}: ${card.title}`}
          />
        ))}
      </div>
    </div>
  )
}