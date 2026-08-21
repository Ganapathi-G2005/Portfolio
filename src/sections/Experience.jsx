import { useEffect, useRef, useState } from 'react'
import './Experience.css'

const HIGHLIGHTS = [
  'Developed an end-to-end AI-driven molecular generation pipeline for CCR5 inhibitor design, combining molecular language models, reinforcement learning, and molecular docking.',
  'Built a CCR5 molecule collection pipeline using PubChem and ChEMBL, resulting in 4,012 experimentally reported CCR5-related molecules.',
  'Prepared a docking-based reward dataset using the CCR5 receptor structure (PDB 4MBS) and used it to seed the reinforcement-learning experience replay buffer.',
  'Fine-tuned NovoMolGen-32M, a transformer-based molecular language model pretrained on 1.5B molecules, using the Augmented Hill Climb (AHC) reinforcement-learning approach.',
  'Designed and executed a 2x2x2 hyperparameter sweep across reward scaling (sigma), likelihood penalty (lambda), and learning rate to study the trade-off between molecular reward and training stability.',
  'Analyzed docking reward, gradient norms, KL divergence, and molecular diversity to identify unstable RL configurations and determine robust training settings.',
  'Identified sigma approximately 500 as the most promising reward-pull setting, achieving strong top-10 docking rewards around -13.1 to -13.5 kcal/mol while substantially reducing gradient instability compared with the baseline.',
]

export default function Experience() {
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
    <section id="experience" className={`section experience${visible ? ' experience--visible' : ''}`} ref={sectionRef}>
      <div className="experience-inner">
        <div className="experience-header animate-child">
          <span className="section-badge">[ 004 / EXPERIENCE ]</span>
          <h2 className="section-header">WHERE I&apos;VE LEARNED</h2>
        </div>

        <article className="experience-card animate-child" style={{ animationDelay: '100ms' }}>
          <div className="experience-meta">
            <span className="experience-period">MAY 2026 - JULY 2026</span>
            <span className="experience-type">SUMMER INTERN</span>
          </div>

          <div className="experience-content">
            <div className="experience-title-row">
              <div>
                <h3 className="experience-role">AI INTERN</h3>
                <p className="experience-org">WADHWANI SCHOOL OF DATA SCIENCE &amp; AI, IIT MADRAS</p>
              </div>
              <span className="experience-mark" aria-hidden="true">WSAI</span>
            </div>
            <p className="experience-mentors">DR. NIRAV BHATT <span>/</span> MR. ROSHAN</p>

            <ul className="experience-list">
              {HIGHLIGHTS.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  )
}