import { useEffect, useRef } from 'react'
import './CustomCursor.css'

export default function CustomCursor() {
  const mainRef    = useRef(null)
  const trailRef   = useRef(null)
  const posRef     = useRef({ x: 0, y: 0 })
  const trailPos   = useRef({ x: 0, y: 0 })
  const frameRef   = useRef(null)

  useEffect(() => {
    // Only desktop pointer devices
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return

    const main  = mainRef.current
    const trail = trailRef.current
    if (!main || !trail) return

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY }
    }

    const lerp = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Main: exact follow
      main.style.transform = `translate(${posRef.current.x - 4}px, ${posRef.current.y - 4}px)`

      // Trail: lerp
      if (!reduced) {
        trailPos.current.x += (posRef.current.x - trailPos.current.x) * 0.12
        trailPos.current.y += (posRef.current.y - trailPos.current.y) * 0.12
      } else {
        trailPos.current = { ...posRef.current }
      }
      trail.style.transform = `translate(${trailPos.current.x - 2}px, ${trailPos.current.y - 2}px)`

      frameRef.current = requestAnimationFrame(lerp)
    }
    frameRef.current = requestAnimationFrame(lerp)

    // Hover states
    const onEnterInteractive = (e) => {
      if (!e.target || typeof e.target.closest !== 'function') return
      const el = e.target.closest('a, button, [role="button"], .cursor-pointer')
      if (el) {
        main.classList.add('cursor--hover')
        trail.classList.add('trail--hidden')
      }
    }
    const onLeaveInteractive = () => {
      main.classList.remove('cursor--hover')
      trail.classList.remove('trail--hidden')
    }
    const onEnterText = (e) => {
      if (!e.target || !e.target.tagName) return
      const el = e.target
      if (typeof el.closest === 'function' && el.closest('a, button, [role="button"], [role="tab"]')) {
        return
      }
      const tag = el.tagName
      if (tag === 'P' || tag === 'SPAN' || tag === 'H1' || tag === 'H2' ||
          tag === 'H3' || tag === 'LI' || tag === 'INPUT' || tag === 'TEXTAREA') {
        main.classList.add('cursor--text')
      }
    }
    const onLeaveText = () => {
      main.classList.remove('cursor--text')
    }

    window.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', onEnterInteractive)
      el.addEventListener('mouseleave', onLeaveInteractive)
    })

    // Delegate for dynamic elements
    document.addEventListener('mouseenter', onEnterInteractive, true)
    document.addEventListener('mouseleave', onLeaveInteractive, true)
    document.addEventListener('mouseenter', onEnterText, true)
    document.addEventListener('mouseleave', onLeaveText, true)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frameRef.current)
      document.removeEventListener('mouseenter', onEnterInteractive, true)
      document.removeEventListener('mouseleave', onLeaveInteractive, true)
      document.removeEventListener('mouseenter', onEnterText, true)
      document.removeEventListener('mouseleave', onLeaveText, true)
    }
  }, [])

  return (
    <>
      <div ref={mainRef}  className="cursor-main"  aria-hidden="true" />
      <div ref={trailRef} className="cursor-trail" aria-hidden="true" />
    </>
  )
}
