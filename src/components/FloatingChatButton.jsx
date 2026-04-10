import './FloatingChatButton.css'

export default function FloatingChatButton({ onScrollTo, activeSection }) {
  return (
    <button
      className="floating-chat"
      onClick={() => onScrollTo('chat')}
      aria-label="Chat with Gannu's AI"
      title="Chat with Gannu's AI"
      id="floating-chat-btn"
      style={{ display: activeSection === 'chat' ? 'none' : 'flex' }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  )
}
