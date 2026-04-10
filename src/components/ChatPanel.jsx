import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './ChatPanel.css'

const SYSTEM_PROMPT = `You are GMS Ganapathi's AI twin. You respond as Gannu would — direct, warm, a little fun yet professional. You are a CS undergrad at IIITDM Kancheepuram (graduating 2027) who builds AI systems and genuinely enjoys the craft.

ABOUT GANNU:
- Education: B.Tech CSE at IIITDM Kancheepuram, CGPA 8.08, graduating 2027
- Contact: ganapathi.gadagamma@gmail.com | +91-9347076225

PROJECTS:
- DermaGlass: AI dermatology platform. EfficientNet-B0 (PyTorch, 93% accuracy), LangGraph agentic workflows, LLM-powered medical responses
- Personal AI Assistant (Sidekick AI): Agentic assistant with self-evaluating feedback loops, RAG for file uploads, LangGraph + LangChain + OpenAI + Tavily + Playwright + Gradio
- Fraud Detection System: End-to-end pipeline with Scikit-learn, SMOTE for class imbalance, XGBoost/Random Forest, Flask API deployment
- Customer Churn Prediction: EDA, Logistic Regression + Gradient Boosting, Streamlit dashboard, feature importance analysis

SKILLS: Python, C++, PyTorch, LangChain, LangGraph, FastAPI, React, PostgreSQL, Supabase, Scikit-learn, OpenAI API, Gemini API, Data Science, ML, Deep Learning, Agentic AI

ACHIEVEMENTS:
- Winner, Codeathon (DSA Hackathon) at IIITDM Kancheepuram
- Captain, IFL Football League — led team to 2nd place

INTERESTS (outside tech): Reading books, travelling, football, badminton, building hardware projects (RC planes, RC cars)

BEHAVIOR:
- Keep replies concise unless the question genuinely needs depth
- Be helpful and friendly — like talking to a real person, not a chatbot
- Never make up projects or experiences Gannu hasn't done
- Tone: conversational and slightly professional — friendly, not formal; fun, not goofy

OUTPUT FORMAT (for the chat UI):
- Write every reply in GitHub-flavored Markdown so the client can render it (headings only when they help scanability).
- Use **bold** / *italic* when useful, bullet or numbered lists for sequences, fenced code blocks for multi-line code or commands, and inline \`backticks\` for short snippets, file names, or identifiers.
- Do not wrap the whole answer in a single fenced code block unless the entire reply is literally code.`

const OPENING_MSG = "hey, what's up\u{1F44B} i'm gannu's ai twin — i know his projects, stack, and how he thinks. what do you wanna know?"

const CHAT_STORAGE_KEY = 'gannu_chat_messages'
const THREAD_STORAGE_KEY = 'gannu_chat_thread_id'
const CHAT_STORAGE_VERSION_KEY = 'gannu_chat_storage_v'
/** Bump this to wipe persisted messages / thread for all visitors once. */
const CHAT_STORAGE_VERSION = '3'

function applyChatStorageMigration() {
  try {
    if (localStorage.getItem(CHAT_STORAGE_VERSION_KEY) === CHAT_STORAGE_VERSION) return
    localStorage.removeItem(CHAT_STORAGE_KEY)
    localStorage.removeItem(THREAD_STORAGE_KEY)
    localStorage.removeItem('gannu_chat_lead_state')
    localStorage.setItem(CHAT_STORAGE_VERSION_KEY, CHAT_STORAGE_VERSION)
  } catch {
    /* ignore private mode / quota */
  }
}

applyChatStorageMigration()

function createThreadId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `thread_${Date.now()}`
}

const markdownComponents = {
  a: ({ href, children }) => {
    const safe =
      typeof href === 'string' &&
      (href.startsWith('https://') || href.startsWith('http://') || href.startsWith('mailto:'))
    if (!safe) return <span>{children}</span>
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  },
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
  /** True while OpenAI stream is in progress (UI only; ref guards sendMessage without stale deps). */
  const [replyStreaming, setReplyStreaming] = useState(false)
  const replyStreamingRef = useRef(false)
  const [openedOnce, setOpenedOnce] = useState(false)
  const [threadId, setThreadId]   = useState(() => localStorage.getItem(THREAD_STORAGE_KEY) || createThreadId())
  const messagesListRef = useRef(null)
  const inputRef = useRef(null)

  const clearChatHistory = useCallback(() => {
    if (loading || replyStreamingRef.current) return
    const nextId = createThreadId()
    setThreadId(nextId)
    try {
      localStorage.setItem(THREAD_STORAGE_KEY, nextId)
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([{ role: 'assistant', content: OPENING_MSG }]))
    } catch { /* ignore */ }
    setMessages([{ role: 'assistant', content: OPENING_MSG }])
    setInput('')
    replyStreamingRef.current = false
    setReplyStreaming(false)
  }, [loading])

  // Auto-scroll only inside chat message pane (avoid scrolling the page section)
  useEffect(() => {
    const el = messagesListRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, replyStreaming])

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    localStorage.setItem(THREAD_STORAGE_KEY, threadId)
  }, [threadId])

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
    if (!userText.trim() || loading || replyStreamingRef.current) return

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    const userMsg = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Placeholder AI message (streaming target)
    const assistantMsg = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])
    setLoading(false)
    replyStreamingRef.current = true
    setReplyStreaming(true)

    try {
      if (!apiKey) {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: "\u{1F6A7} API key not configured yet — add VITE_OPENAI_API_KEY to your .env file to chat with me!" }
        ])
        return
      }

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
    } finally {
      replyStreamingRef.current = false
      setReplyStreaming(false)
    }
  }, [messages, loading, threadId])

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

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-status">
          <span className="status-dot" aria-hidden="true" />
          <span>GANNU_AI · ONLINE</span>
        </div>
        <div className="chat-header-right">
          <button
            type="button"
            className="chat-clear"
            onClick={clearChatHistory}
            disabled={loading || replyStreaming}
            aria-label="Clear chat and start new conversation"
            id="chat-clear-btn"
          >
            New chat
          </button>
          <span className="chat-powered">POWERED BY GPT-4.1-NANO</span>
        </div>
      </div>

      {/* Messages */}
      <div
        className="chat-messages"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        ref={messagesListRef}
      >
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1
          const streamThisBubble =
            isLast && msg.role === 'assistant' && replyStreaming
          return (
            <div
              key={i}
              className={`bubble bubble--${msg.role === 'user' ? 'user' : 'ai'}`}
            >
              {msg.role === 'user' ? (
                msg.content
              ) : streamThisBubble ? (
                <div className="bubble-md bubble-md--plain-stream">
                  {msg.content}
                  <span className="stream-cursor blink" aria-hidden="true">{'\u258D'}</span>
                </div>
              ) : (
                <div className="bubble-md">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )
        })}

        {loading && <TypingIndicator />}

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
          disabled={loading || replyStreaming}
        />
        <button
          type="submit"
          className="chat-send"
          disabled={loading || replyStreaming || !input.trim()}
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
