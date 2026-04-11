import { useEffect, useState, useRef } from 'react'
import './IntroSequence.css'

const WORDS = ['NOT', 'JUST', 'A', 'PORTFOLIO']

// Per-word stagger gap (ms)
const STAGGER_MS = 200
// How long each word's enter animation runs
const WORD_ENTER_MS = 600
// How long we hold everything visible after all words are in
const HOLD_MS = 1100
// Per-word stagger on exit
const EXIT_STAGGER_MS = 110
// How long each word's exit animation runs
const WORD_EXIT_MS = 480
// Extra time after last word exits before removing the overlay
const OVERLAY_FADE_MS = 650

export default function IntroSequence({ onComplete }) {
  const [phase, setPhase] = useState('enter')
  const [exitDelays, setExitDelays] = useState([])
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    // Time until all words are visually settled
    const allWordsIn = STAGGER_MS * (WORDS.length - 1) + WORD_ENTER_MS

    // Hold → trigger exit phase
    const holdTimer = setTimeout(() => {
      setPhase('exit')
      // Build per-word stagger delays for exit
      setExitDelays(WORDS.map((_, i) => i * EXIT_STAGGER_MS))
    }, allWordsIn + HOLD_MS)

    // After last exit word finishes + overlay fades out → call onComplete
    const lastWordExitEnd =
      allWordsIn + HOLD_MS +
      EXIT_STAGGER_MS * (WORDS.length - 1) + WORD_EXIT_MS +
      OVERLAY_FADE_MS

    const doneTimer = setTimeout(() => {
      setPhase('done')
      onCompleteRef.current?.()
    }, lastWordExitEnd)

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
              animationDelay:
                phase === 'enter'
                  ? `${i * STAGGER_MS}ms`
                  : `${exitDelays[i] ?? i * EXIT_STAGGER_MS}ms`,
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
