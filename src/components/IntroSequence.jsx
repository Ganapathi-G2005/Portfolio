import { useEffect, useState } from 'react'
import './IntroSequence.css'

const WORDS = ['NOT', 'JUST', 'A', 'PORTFOLIO']

export default function IntroSequence({ onComplete }) {
  // Check session flag synchronously so there's no flash
  const alreadyShown = sessionStorage.getItem('intro_shown') === 'true'
  const [phase, setPhase] = useState(alreadyShown ? 'done' : 'enter')

  useEffect(() => {
    // Already shown this session: fire callback immediately, no overlay
    if (alreadyShown) {
      onComplete?.()
      return
    }

    // Phase timeline (ms)
    const enterDuration = 150 * WORDS.length + 320 // stagger + last anim
    const holdDuration  = 600
    const exitDuration  = 400

    const holdTimer = setTimeout(() => setPhase('exit'), enterDuration + holdDuration)
    const doneTimer = setTimeout(() => {
      sessionStorage.setItem('intro_shown', 'true')
      setPhase('done')
      onComplete?.()
    }, enterDuration + holdDuration + exitDuration)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  if (phase === 'done') return null

  return (
    <div className={`intro-overlay intro-overlay--${phase}`} aria-hidden="true">
      <div className="intro-words">
        {WORDS.map((word, i) => (
          <span
            key={word}
            className={`intro-word intro-word--${phase}`}
            style={{
              animationDelay: phase === 'enter' ? `${i * 150}ms` : '0ms',
              color: word === 'PORTFOLIO' ? 'var(--accent)' : 'var(--white)',
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}
