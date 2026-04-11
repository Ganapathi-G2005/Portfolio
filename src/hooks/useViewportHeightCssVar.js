import { useEffect } from 'react'

/**
 * Sets --vh on :root to 1% of the visible viewport height (px).
 * Use calc(var(--vh) * 100) where full viewport height is needed so mobile
 * browser chrome (URL bar, etc.) does not push content below the fold.
 */
export function useViewportHeightCssVar() {
  useEffect(() => {
    const setVh = () => {
      const h = window.visualViewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--vh', `${h * 0.01}px`)
    }

    setVh()

    window.addEventListener('resize', setVh)
    window.addEventListener('orientationchange', setVh)

    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', setVh)
      vv.addEventListener('scroll', setVh)
    }

    return () => {
      window.removeEventListener('resize', setVh)
      window.removeEventListener('orientationchange', setVh)
      if (vv) {
        vv.removeEventListener('resize', setVh)
        vv.removeEventListener('scroll', setVh)
      }
    }
  }, [])
}
