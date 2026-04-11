import { useEffect, useRef, useState } from 'react'
import './Skills.css'

/* ─── Data ─────────────────────────────────────────────────────── */
const SKILLS_ROW1 = [
  { label: 'Python',       cat: 'Backend' }, 
  { label: 'Data Science', cat: 'ML/AI' },
  { label: 'Machine Learning', cat: 'ML/AI' },
  { label: 'Deep Learning', cat: 'ML/AI' },
  { label: 'Agentic AI', cat: 'ML/AI' },
  { label: 'RAG', cat: 'ML/AI' },
  { label: 'PyTorch',       cat: 'ML/AI' },
  { label: 'LangChain',     cat: 'ML/AI' },
  { label: 'LangGraph',     cat: 'ML/AI' },
  { label: 'EfficientNet',  cat: 'ML/AI' },
  { label: 'OpenAI API',    cat: 'ML/AI' },
  { label: 'Gemini API',    cat: 'ML/AI' },
  { label: 'FastAPI',       cat: 'Backend' },
  { label: 'PostgreSQL',    cat: 'Backend' },
]

const SKILLS_ROW2 = [
  { label: 'Antigravity',   cat: 'Tools' },
  { label: 'Claude code', cat: 'Tools' },
  { label: 'Cursor', cat: 'Tools' },
  { label: 'VSCode', cat: 'Tools' },
  { label: 'Git',           cat: 'Tools' },
  { label: 'Docker',        cat: 'Tools' },
  { label: 'Vercel',        cat: 'Tools' },
  { label: 'Gradio',        cat: 'Tools' },
  { label: 'EmailJS',       cat: 'Tools' },
  { label: 'Playwright',    cat: 'Tools' },
  { label: 'Tavily',        cat: 'Tools' },
]

const CAT_DOT = {
  'ML/AI':    'var(--accent)',
  'Backend':  'var(--accent-2)',
  'Frontend': 'var(--accent-3)',
  'Tools':    'var(--text-secondary)',
}

const ACHIEVEMENTS = [
  {
    stat: '#2',
    title: 'DSA HACKATHON',
    sub:   'Codeathon · IIITDM Kancheepuram',
    color: 'var(--accent-2)',
  },
  {
    stat: '⚽',
    title: 'FOOTBALL CAPTAIN',
    sub:   'IFL - IIITDM Kancheepuram',
    color: 'var(--accent-3)',
  },
  {
    stat: '10+',
    title: 'PROJECTS COMPLETED',
    sub:   'Real problems',
    color: 'var(--accent)',
  },
  {
    stat: '300+',
    title: 'PROBLEMS SOLVED',
    sub:   'DSA',
    color: 'var(--card-4)',
  },
]

const EXTRAS = [
  { icon: '⚽', label: 'Football' },
  { icon: '🎾', label: 'Badminton'},
  { icon: '🛩️', label: 'RC Hobbies' },
  { icon: '📚', label: 'Reading Books'},
  { icon: '🌍', label: 'Travelling'}
]

/* ─── Ticker row ───────────────────────────────────────────────── */
function Ticker({ chips, direction }) {
  // Double the list for seamless loop
  const doubled = [...chips, ...chips]
  return (
    <div className={`ticker-row ticker-row--${direction}`}>
      <div className="ticker-track">
        {doubled.map((chip, i) => (
          <span key={`${chip.label}-${i}`} className="ticker-chip">
            <span
              className="ticker-dot"
              style={{ background: CAT_DOT[chip.cat] }}
              aria-hidden="true"
            />
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Achievement card ─────────────────────────────────────────── */
function AchCard({ stat, title, sub, color }) {
  return (
    <div className="ach-card">
      <div className="ach-stat" style={{ color }}>{stat}</div>
      <div className="ach-title">{title}</div>
      <div className="ach-sub">{sub}</div>
    </div>
  )
}

/* ─── Main section ─────────────────────────────────────────────── */
export default function Skills() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="skills" className={`section skills${visible ? ' skills--visible' : ''}`} ref={sectionRef}>
      <div className="skills-inner">

        {/* 6A — Ticker */}
        <div className="skills-block animate-child">
          <span className="mono-label">STACK</span>
          <div className="skills-ticker">
            <Ticker chips={SKILLS_ROW1} direction="left"  />
            <Ticker chips={SKILLS_ROW2} direction="right" />
          </div>
        </div>

        {/* 6B — Achievements */}
        <div className="skills-block animate-child" style={{ animationDelay: '80ms' }}>
          <span className="mono-label">WINS</span>
          <div className="ach-grid">
            {ACHIEVEMENTS.map(a => <AchCard key={a.title} {...a} />)}
          </div>
        </div>

        {/* 6C — Extracurriculars */}
        <div className="skills-block animate-child" style={{ animationDelay: '160ms' }}>
          <span className="mono-label">BEYOND CODE</span>
          <div className="extras-row">
            {EXTRAS.map(({ icon, label }) => (
              <span key={label} className="extras-tag">
                <span aria-hidden="true">{icon}</span> {label}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
