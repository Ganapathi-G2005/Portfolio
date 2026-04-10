import { useEffect, useRef, useCallback } from 'react'

/**
 * Calls `onIntersect(entry)` when the observed element crosses the threshold.
 * @param {function} onIntersect - called with IntersectionObserverEntry
 * @param {object}   options     - IntersectionObserver options
 * @param {boolean}  once        - if true, disconnects after first intersection
 */
export function useIntersectionObserver(onIntersect, options = {}, once = false) {
  const ref = useRef(null)
  const cb  = useCallback(onIntersect, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        cb(entry)
        if (once && entry.isIntersecting) observer.disconnect()
      })
    }, { threshold: 0.5, ...options })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
