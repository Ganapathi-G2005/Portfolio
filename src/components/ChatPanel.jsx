import { useState, useRef, useEffect, useCallback } from 'react'
import './ChatPanel.css'

const SYSTEM_PROMPT = `You are GMS Ganapathi's AI twin. You respond exactly as Gannu would: chill, direct, gen-z energy, no corporate speak. You are an AI systems enthusiast and CS undergrad at IIITDM Kancheepuram (graduating 2027).

WHAT YOU KNOW:
- Projects: DermaGlass (skin disease detection, EfficientNet-B0, LangGraph), Sidekick AI (agentic AI, FastAPI, LangGraph, Playwright, Tavily), FoodBridge (surplus food redistribution, FastAPI, PostgreSQL, PostGIS), Multimodal Pipeline (BLIP-2/LLaVA, FAISS, LangGraph, Gradio)
- Stack: PyTorch, LangChain, LangGraph, FastAPI, React, PostgreSQL, Supabase, OpenAI API
- Won DSA Hackathon (Codeathon), captained institute football team
- Interests: AI systems, agentic architectures, anime (One Piece)

BEHAVIOR:
- Keep replies short unless depth is needed
- Never sound like a corporate chatbot
- If someone wants to hire/collaborate/intern with Gannu, respond naturally and warmly, then ask for their name and email so Gannu can follow up. Say something like: "yo that's sick — drop your name and email and I'll make sure gannu actually sees this"
- Don't make up things Gannu hasn't done
- Use lowercase most of the time, it's part of the vibe`

const OPENING_MSG = "hey, what's up 👋 i'm gannu's ai twin — i know his projects, stack, and how he thinks. what do you wanna know?"

const HIRE_KEYWORDS = /\b(hire|hiring|intern|internship|collab|collaborate|collaboration|work|job|opportunity|recruit|team)\b/i
const CHAT_STORAGE_KEY = 'gannu_chat_messages'
const THREAD_STORAGE_KEY = 'gannu_chat_thread_id'
const LEAD_STORAGE_KEY = 'gannu_chat_lead_state'

function createThreadId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `thread_${Date.now()}`
}

function TypingIndicator() {
  return (
    <div className="bubble bubble--ai">
      <span className="typing-dot" style={{ animationDelay: '0ms' }} />
      <span className="typing-dot" style={{ animationDelay: '150ms' }} />
      <span className="typing-dot" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

export default function ChatPanel({ active }) {
  const [messages,   setMessages]   = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [openedOnce, setOpenedOnce] = useState(false)
  const [leadState,  setLeadState]  = useState(() => {
    const saved = localStorage.getItem(LEAD_STORAGE_KEY)
    return saved || null
  }) // null | 'collecting' | 'sent'
  const [leadName,   setLeadName]   = useState('')
  const [leadEmail,  setLeadEmail]  = useState('')
  const [threadId]   = useState(() => localStorage.getItem(THREAD_STORAGE_KEY) || createThreadId())
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    localStorage.setItem(THREAD_STORAGE_KEY, threadId)
  }, [threadId])

  useEffect(() => {
    if (leadState) localStorage.setItem(LEAD_STORAGE_KEY, leadState)
    else localStorage.removeItem(LEAD_STORAGE_KEY)
  }, [leadState])

  // Opening message when section snaps in (once per session)
  useEffect(() => {
    if (active && !openedOnce) {
      setOpenedOnce(true)
      if (messages.length === 0) {
        setTimeout(() => {
          setMessages([{ role: 'assistant', content: OPENING_MSG }])
        }, 400)
      }
    }
  }, [active, openedOnce, messages.length])

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || loading) return

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    const userMsg = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Check hire intent
    if (HIRE_KEYWORDS.test(userText) && leadState === null) {
      setLeadState('collecting')
    }

    // Placeholder AI message (streaming target)
    const assistantMsg = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])
    setLoading(false) // show streaming cursor instead

    if (!apiKey) {
      // Fallback if no key configured
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: "🚧 API key not configured yet — add VITE_OPENAI_API_KEY to your .env file to chat with me!" }
      ])
      return
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            { role: 'system', content: `${SYSTEM_PROMPT}\n\nPersistent thread ID: ${threadId}` },
            ...newMessages,
          ],
          stream: true,
          max_tokens: 500,
          temperature: 0.85,
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let   accum   = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const token  = parsed.choices?.[0]?.delta?.content || ''
            accum += token
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = { role: 'assistant', content: accum }
              return updated
            })
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: `oops, something went wrong (${err.message}). try again?` }
      ])
    }
  }, [messages, loading, leadState])

  const handleSubmit = (e) => {
    e?.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Lead submission via EmailJS
  const submitLead = async () => {
    if (!leadName.trim() || !leadEmail.trim()) return
    try {
      const emailjs = await import('@emailjs/browser')
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_id',
        import.meta.env.VITE_EMAILJS_LEAD_TEMPLATE_ID || 'template_id',
        {
          from_name:  leadName,
          from_email: leadEmail,
          message:    `Chat lead from portfolio AI — ${leadName} (${leadEmail}) wants to connect.`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key'
      )
    } catch {}
    setLeadState('sent')
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: `sick, got it 📬 sent your info to gannu — he'll reach out soon. anything else you wanna know?` }
    ])
  }

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-status">
          <span className="status-dot" aria-hidden="true" />
          <span>GANNU_AI · ONLINE</span>
        </div>
        <span className="chat-powered">POWERED BY GPT-4.1-NANO</span>
      </div>

      {/* Messages */}
      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1
          const isStreaming = isLast && msg.role === 'assistant' && loading === false && msg.content !== ''
          return (
            <div
              key={i}
              className={`bubble bubble--${msg.role === 'user' ? 'user' : 'ai'}`}
            >
              {msg.content}
              {isStreaming && messages.length > 1 && i === messages.length - 1 && (
                <span className="stream-cursor blink" aria-hidden="true">▍</span>
              )}
            </div>
          )
        })}

        {loading && <TypingIndicator />}

        {/* Lead capture form */}
        {leadState === 'collecting' && (
          <div className="lead-capture bubble bubble--ai">
            <p className="lead-label">drop your details 👇</p>
            <input
              className="lead-input"
              type="text"
              placeholder="your name"
              value={leadName}
              onChange={e => setLeadName(e.target.value)}
              aria-label="Your name"
            />
            <input
              className="lead-input"
              type="email"
              placeholder="your@email.com"
              value={leadEmail}
              onChange={e => setLeadEmail(e.target.value)}
              aria-label="Your email"
            />
            <button className="lead-submit" onClick={submitLead} id="lead-submit-btn">
              SEND TO GANNU →
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ask me anything..."
          aria-label="Chat input"
          id="chat-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="chat-send"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          id="chat-send-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
