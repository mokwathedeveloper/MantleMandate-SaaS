'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, Loader2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED = [
  'How do I deploy my first agent?',
  'Why did my agent pause?',
  'How does the mandate parser work?',
  'How to set risk limits?',
]

export function ChatWidget() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your MantleMandate support agent. How can I help you today?" },
  ])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply ?? 'Sorry, something went wrong. Please try again.',
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please check your internet and try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-fit bg-primary hover:bg-primary-hover text-white text-xs px-3 py-1.5 rounded-md transition-colors"
      >
        Start Chat →
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Chat panel */}
      <div className={cn(
        'fixed bottom-0 right-0 z-50 flex flex-col transition-transform duration-300 ease-in-out',
        'w-full sm:w-[400px] h-[560px] sm:h-[600px] sm:bottom-6 sm:right-6 sm:rounded-xl overflow-hidden',
        open ? 'translate-y-0' : 'translate-y-[110%]',
      )}
        style={{ background: '#161B22', border: '1px solid #21262D', boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ background: '#1C2128', borderBottom: '1px solid #21262D' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary">MantleMandate Support</p>
              <p className="text-[10px] flex items-center gap-1 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block animate-pulse" />
                Online · AI-powered
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex gap-2.5', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              {m.role === 'assistant' && (
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div className={cn(
                'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                m.role === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'text-text-primary rounded-tl-sm',
              )}
                style={m.role === 'assistant' ? { background: '#1C2128', border: '1px solid #21262D' } : {}}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-3.5 py-3 flex items-center gap-1.5"
                style={{ background: '#1C2128', border: '1px solid #21262D' }}
              >
                <Loader2 className="h-3.5 w-3.5 text-text-secondary animate-spin" />
                <span className="text-[12px] text-text-secondary">Typing…</span>
              </div>
            </div>
          )}

          {/* Suggested questions — only at start */}
          {messages.length === 1 && !loading && (
            <div className="flex flex-col gap-1.5 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Quick questions</p>
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left text-[12px] px-3 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid #21262D' }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: '#0D1117', border: '1px solid #30363D' }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask a question…"
              disabled={loading}
              className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-disabled outline-none"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="h-7 w-7 rounded-md bg-primary hover:bg-primary-hover disabled:bg-border disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
          <p className="text-center text-[10px] text-text-disabled mt-2">Powered by Claude AI · Responses may not be perfect</p>
        </div>
      </div>
    </>
  )
}
