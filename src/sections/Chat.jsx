import { useEffect, useRef, useState } from 'react'
import ChatPanel from '../components/ChatPanel'
import './Chat.css'

export default function Chat() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [active,  setActive]  = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting)
      if (entry.isIntersecting) setVisible(true)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="chat" className={`section chat${visible ? ' chat--visible' : ''}`} ref={sectionRef}>
      <div className="chat-inner">
        {/* Left intro */}
        <div className="chat-intro animate-child">
          <span className="section-badge">[ 004 / CHAT ]</span>
          <h2 className="section-header chat-title">TALK TO MY AI.</h2>
          <p className="chat-subtext">
            Knows my projects, my stack, how I think. Ask it anything — it's actually me, kind of.
          </p>
          <p className="chat-poweredby">POWERED BY GPT-4.1-NANO</p>
        </div>

        {/* Right chat panel */}
        <div className="chat-panel-wrap animate-child" style={{ animationDelay: '100ms' }}>
          <ChatPanel active={active} />
        </div>
      </div>
    </section>
  )
}
