'use client'

import { useState, useRef, useEffect } from 'react'
import type { Project } from '@/types/database'
import { getSectionBySlug } from '@/lib/workspace-sections'
import { getToolAreaBySlug } from '@/lib/tools-content'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  project: Project
  activeSlug: string
  activeTitle: string
  context: string
  onClearContext: () => void
}

export default function AIPanel({ project, activeSlug, activeTitle, context, onClearContext }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const streamBufferRef = useRef('')

  useEffect(() => {
    if (context) {
      queueMicrotask(() => {
        setInput(context)
        onClearContext()
      })
    }
  }, [context, onClearContext])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text?: string) {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    const userMsg: Message = { role: 'user', content: userText }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(m => [...m, assistantMsg])

    try {
      const res = await fetch('/api/claude/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          project: {
            id: project.id,
            book: project.book,
            passage_ref: project.passage_ref,
            testament: project.testament,
            original_language: project.original_language,
          },
          activeSlug,
          activeTitle,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro na API' }))
        setMessages(m => {
          const next = [...m]
          next[next.length - 1] = { role: 'assistant', content: `Erro: ${err.error || 'Tente novamente.'}` }
          return next
        })
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      streamBufferRef.current = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.delta?.text ?? ''
              streamBufferRef.current += delta
              const full = streamBufferRef.current
              setMessages(m => {
                const next = [...m]
                next[next.length - 1] = { role: 'assistant', content: full }
                return next
              })
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch {
      setMessages(m => {
        const next = [...m]
        next[next.length - 1] = { role: 'assistant', content: 'Erro de conexão. Tente novamente.' }
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        padding: '0.85rem 1rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexShrink: 0,
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ai)', display: 'inline-block' }} />
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--ai)' }}>Keryx IA</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {activeTitle.split(' ').slice(0, 3).join(' ')}
        </span>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '0.75rem', fontFamily: 'inherit',
              padding: '0.1rem 0.3rem',
            }}
            title="Limpar conversa"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', lineHeight: '1.65', padding: '0.5rem 0' }}>
            <p style={{ marginBottom: '0.75rem' }}>Pergunte sobre <strong style={{ color: 'var(--text-secondary)' }}>{activeTitle}</strong> para {project.book} {project.passage_ref}.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {quickPrompts(activeSlug, project).map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'inherit',
                    lineHeight: '1.4',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.7rem',
                color: msg.role === 'user' ? 'var(--text-muted)' : 'var(--ai)',
                marginBottom: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: '600',
              }}>
                {msg.role === 'user' ? 'Você' : 'Keryx'}
              </div>
              <div style={{
                fontSize: '0.87rem',
                lineHeight: '1.7',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                fontFamily: msg.role === 'assistant' ? 'var(--font-serif)' : 'inherit',
              }}>
                {msg.content}
                {loading && i === messages.length - 1 && msg.role === 'assistant' && !msg.content && (
                  <span style={{ opacity: 0.5 }}>▌</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.75rem',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Pergunte sobre o texto..."
            rows={3}
            style={{
              flex: 1,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '0.55rem 0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.5',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--ai)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? 'var(--surface-3)' : 'var(--ai)',
              border: 'none',
              borderRadius: '7px',
              padding: '0 0.75rem',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              color: loading || !input.trim() ? 'var(--text-muted)' : '#fff',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            {loading ? '…' : '↑'}
          </button>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          Enter para enviar · Shift+Enter para nova linha
        </div>
      </div>
    </div>
  )
}

function quickPrompts(slug: string, project: Project): string[] {
  const ref = `${project.book} ${project.passage_ref}`
  if (slug === 'colagens') {
    return [
      `Sugira conexões entre minhas colagens e ${ref}.`,
      'Organize minhas colagens por tags, categorias e uso homilético.',
      'Transforme uma citação longa em resumo acadêmico com aplicação pastoral.',
      'Identifique temas recorrentes nas minhas notas e insights.',
    ]
  }

  const toolArea = getToolAreaBySlug(slug)
  if (toolArea) {
    return toolArea.actions.slice(0, 4).map(action => action.prompt)
  }

  const sectionDef = getSectionBySlug(slug)
  if (sectionDef && sectionDef.keyQuestions.length > 0) {
    // Return up to 4 key questions for the active section
    return sectionDef.keyQuestions.slice(0, 4)
  }
  return [
    `Analise ${ref} no contexto de ${project.book}.`,
    `Quais os pontos exegéticos centrais desta seção?`,
  ]
}
