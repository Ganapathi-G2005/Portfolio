import { useEffect, useState, useRef } from 'react'
import './IntroSequence.css'

const WORDS = ['NOT', 'JUST', 'A', 'PORTFOLIO']

export default function IntroSequence({ onComplete }) {
  const [phase, setPhase] = useState('enter')
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Run intro once on mount. Do not depend on onComplete identity — an inline
  // parent callback would retrigger this effect every render and repeatedly
  // scroll to Hero.
  useEffect(() => {
    // Phase timeline (ms)
    const enterDuration = 150 * WORDS.length + 320 // stagger + last anim
    const holdDuration  = 600
    const exitDuration  = 400

    const holdTimer = setTimeout(() => setPhase('exit'), enterDuration + holdDuration)
    const doneTimer = setTimeout(() => {
      setPhase('done')
      onCompleteRef.current?.()
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
