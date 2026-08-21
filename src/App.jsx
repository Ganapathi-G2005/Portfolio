import { useRef, useState, useEffect, useCallback } from 'react'

import IntroSequence       from './components/IntroSequence'
import CustomCursor        from './components/CustomCursor'
import Nav                 from './components/Nav'
import FloatingChatButton  from './components/FloatingChatButton'
import Hero                from './sections/Hero'
import Skills              from './sections/Skills'
import Projects            from './sections/Projects'
import Experience          from './sections/Experience'
import Chat                from './sections/Chat'
import Contact             from './sections/Contact'

import { useScrollNav }           from './hooks/useScrollNav'
import { useViewportHeightCssVar } from './hooks/useViewportHeightCssVar'

const SECTIONS = ['hero', 'skills', 'projects', 'experience', 'chat', 'contact']

export default function App() {
  const containerRef    = useRef(null)
  const [activeSection, setActiveSection] = useState('hero')

  useViewportHeightCssVar()

  // Keyboard arrow navigation
  useScrollNav(containerRef)

  // Track active section via IntersectionObserver (threshold 0.6)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observers = SECTIONS.map((id) => {
      const el = document.getElementById(id)
      if (!el) return null

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id)
        },
        { root: container, threshold: 0.6 }
      )
      obs.observe(el)
      return obs
    }).filter(Boolean)

    return () => observers.forEach(o => o.disconnect())
  }, [])

  // Scroll to a named section (stable ref — passed to children / intro callback)
  const scrollTo = useCallback((id) => {
    const section = document.getElementById(id)
    section?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const onIntroComplete = useCallback(() => {
    scrollTo('hero')
  }, [scrollTo])

  // Always start from top on refresh so intro reveals Hero first.
  useEffect(() => {
    const container = containerRef.current
    if (container) container.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  return (
    <>
      {/* Intro overlay — sits on top of content, content always in DOM */}
      <IntroSequence onComplete={onIntroComplete} />

      {/* Custom cursor (desktop only) */}
      <CustomCursor />

      {/* Sticky nav */}
      <Nav containerRef={containerRef} activeSection={activeSection} />

      {/* Main scroll container — always visible; intro overlay covers it */}
      <main
        className="scroll-container"
        ref={containerRef}
        id="scroll-container"
        role="main"
      >
        <Hero    onScrollTo={scrollTo} />
        <Skills  />
        <Projects />
        <Experience />
        <Chat    />
        <Contact />
      </main>

      {/* Floating chat button */}
      <FloatingChatButton onScrollTo={scrollTo} activeSection={activeSection} />
    </>
  )
}
