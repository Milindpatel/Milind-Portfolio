import { useState, useRef, useEffect } from 'react'
import type { PortfolioData } from '../types/portfolio'
import type { MLCEngine } from '@mlc-ai/web-llm'
import {
  buildSystemPrompt, loadEngine, streamLocalChat, webGPUAvailable,
  MODEL_LABEL, MODEL_SIZE, type ChatMessage,
} from '../lib/aiAssistant'

interface AiChatProps {
  portfolio: PortfolioData
}

const SUGGESTIONS = [
  'What does Milind do?',
  'Summarize his experience',
  'What are his strongest skills?',
  'Tell me about his AI work',
]

type Phase = 'intro' | 'loading' | 'ready' | 'unsupported'

export default function AiChat({ portfolio }: AiChatProps) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>(() => (webGPUAvailable() ? 'intro' : 'unsupported'))
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const engineRef = useRef<MLCEngine | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, phase])

  async function startLoad() {
    setPhase('loading'); setError('')
    try {
      const engine = await loadEngine(report => {
        setProgress(Math.round((report.progress ?? 0) * 100))
        setProgressText(report.text ?? '')
      })
      engineRef.current = engine
      setPhase('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the model.')
      setPhase('intro')
    }
  }

  async function send(text: string) {
    const question = text.trim()
    const engine = engineRef.current
    if (!question || busy || !engine) return
    setError(''); setInput('')
    const next: ChatMessage[] = [...messages, { role: 'user', content: question }]
    setMessages([...next, { role: 'assistant', content: '' }])
    setBusy(true)
    try {
      await streamLocalChat({
        engine,
        system: buildSystemPrompt(portfolio),
        messages: next,
        onText: delta => setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: copy[copy.length - 1].content + delta }
          return copy
        }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Ask AI about this portfolio"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold pl-3 pr-4 py-3 rounded-full shadow-2xl shadow-violet-900/40 transition-all hover:-translate-y-0.5"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2zm7 11l.95 2.55L22.5 16.5l-2.55.95L19 20l-.95-2.55L15.5 16.5l2.55-.95L19 13zM5 14l.7 1.9L7.6 16.6l-1.9.7L5 19.2l-.7-1.9L2.4 16.6l1.9-.7L5 14z"/>
        </svg>
        Ask AI
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[22rem] max-w-[calc(100vw-3rem)] h-[28rem] max-h-[70vh] glass rounded-2xl shadow-2xl flex flex-col text-content overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line/10">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z"/></svg>
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Ask AI about {portfolio.name.split(' ')[0]}</p>
                <p className="text-[10px] text-faint">{MODEL_LABEL} · free &amp; private</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-faint hover:text-content p-1">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>

          {phase === 'unsupported' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-faint" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
              </svg>
              <p className="text-sm text-muted">This on-device AI needs <strong>WebGPU</strong>, which your browser doesn't support. Try the latest <strong>Chrome</strong> or <strong>Edge</strong> on desktop.</p>
            </div>
          )}

          {phase === 'intro' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="text-sm text-muted">
                Chat with an AI about {portfolio.name}'s background. The model runs <strong>entirely in your browser</strong> — completely free, no account, and fully private (nothing you type leaves your device).
              </p>
              <p className="text-xs text-faint">First use downloads the model ({MODEL_SIZE}, one time — cached afterwards).</p>
              <button onClick={startLoad} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors">
                Load AI assistant
              </button>
              {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
            </div>
          )}

          {phase === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3 text-center">
              <svg className="animate-spin text-blue-400" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <div className="w-full max-w-[14rem]">
                <div className="h-1.5 rounded-full bg-line/15 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-faint mt-2">{progress}% · downloading & preparing model</p>
                <p className="text-[10px] text-faint mt-1 truncate" title={progressText}>{progressText}</p>
              </div>
            </div>
          )}

          {phase === 'ready' && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted">Ready! Ask me anything about {portfolio.name}.</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 glass rounded-full text-muted hover:text-content hover:bg-line/10 transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-line/10 text-content rounded-bl-sm'
                    }`}>
                      {m.content || (busy && i === messages.length - 1
                        ? <span className="inline-flex gap-1 py-1" aria-label="Thinking">
                            <span className="w-1.5 h-1.5 rounded-full bg-faint animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-faint animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-faint animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        : '')}
                    </div>
                  </div>
                ))}
                {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
              </div>

              <div className="border-t border-line/10 p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
                    placeholder={`Ask about ${portfolio.name.split(' ')[0]}…`}
                    className="flex-1 resize-none bg-line/5 border border-line/10 rounded-xl px-3 py-2 text-sm text-content placeholder-faint focus:border-blue-500/50 outline-none max-h-24"
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={busy || !input.trim()}
                    aria-label="Send"
                    className="shrink-0 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M1.5 8.67L17.6 1.6a1 1 0 011.3 1.3L11.83 18.5a1 1 0 01-1.86.06l-2.3-5.32-5.32-2.3a1 1 0 01.05-1.87z"/>
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-faint mt-2 text-center">Runs on your device · free · private</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
