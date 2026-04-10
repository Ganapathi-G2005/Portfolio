import { useEffect } from 'react'

const SECTIONS = ['hero', 'skills', 'projects', 'chat', 'contact']

/**
 * Enables Up/Down arrow key navigation across scroll-snap sections.
 * Reads the `data-section` attribute on .section elements.
 */
export function useScrollNav(containerRef) {
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    const handleKey = (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return

      // Don't hijack inside inputs/textareas
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      e.preventDefault()

      const sections = Array.from(container.querySelectorAll('.section'))
      const scrollTop = container.scrollTop
      const vh = container.clientHeight

      const currentIndex = Math.round(scrollTop / vh)
      const nextIndex = e.key === 'ArrowDown'
        ? Math.min(currentIndex + 1, sections.length - 1)
        : Math.max(currentIndex - 1, 0)

      container.scrollTo({ top: nextIndex * vh, behavior: 'smooth' })
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [containerRef])
}
