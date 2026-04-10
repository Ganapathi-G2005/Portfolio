import { useState, useEffect, useRef } from 'react'
import './Nav.css'

const NAV_LINKS = [
  { label: 'HERO',     id: 'hero' },
  { label: 'SKILLS',   id: 'skills' },
  { label: 'PROJECTS', id: 'projects' },
  { label: 'CHAT',     id: 'chat' },
  { label: 'CONTACT',  id: 'contact' },
]

export default function Nav({ containerRef, activeSection }) {
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  // Track scroll for border transition
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return
    const onScroll = () => setScrolled(container.scrollTop > 20)
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [containerRef])

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const scrollTo = (id) => {
    const container = containerRef?.current
    const section   = document.getElementById(id)
    if (!container || !section) return
    section.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      <nav
        className={`nav${scrolled ? ' nav--scrolled' : ''}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <button
          className="nav-logo"
          onClick={() => scrollTo('hero')}
          aria-label="Go to top"
        >
          GMS
        </button>

        {/* Desktop center links */}
        <ul className="nav-links" role="list">
          {NAV_LINKS.map(({ label, id }) => (
            <li key={id}>
              <button
                className={`nav-link${activeSection === id ? ' nav-link--active' : ''}`}
                onClick={() => scrollTo(id)}
                aria-current={activeSection === id ? 'page' : undefined}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <button
          className="nav-cta"
          onClick={() => scrollTo('chat')}
          aria-label="Chat with me"
        >
          CHAT WITH ME →
        </button>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div className="nav-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            className="nav-overlay-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
          <ul className="nav-overlay-links" role="list">
            {NAV_LINKS.map(({ label, id }, i) => (
              <li
                key={id}
                className="nav-overlay-item"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <button
                  className="nav-overlay-link"
                  onClick={() => scrollTo(id)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
