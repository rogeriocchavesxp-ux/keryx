'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'

type CardState = 'idle' | 'generating' | 'saving' | 'saved'

interface Props {
  sectionDef: SectionDef
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
}

function statusColor(text: string): string {
  if (!text.trim()) return 'var(--border)'
  if (text.trim().length < 80) return 'var(--accent)'
  return 'var(--success)'
}

function statusLabel(text: string): 'empty' | 'draft' | 'reviewed' {
  if (!text.trim()) return 'empty'
  if (text.trim().length < 80) return 'draft'
  return 'reviewed'
}

export default function SectionWorkspace({
  sectionDef,
  project,
  userId,
  existingSection,
  onUpdate,
  onAskAI,
}: Props) {
  const supabase = createClient()

  const loadCards = useCallback((): Record<string, string> => {
    const stored = existingSection?.content as Record<string, unknown> | null
    if (stored && typeof stored === 'object' && 'cards' in stored) {
      return stored.cards as Record<string, string>
    }
    return {}
  }, [existingSection])

  const [cardContent, setCardContent] = useState<Record<string, string>>(loadCards)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(() => new Set([sectionDef.cards[0]?.id]))
  const [orientationOpen, setOrientationOpen] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({})
  const [generatingAll, setGeneratingAll] = useState(false)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestContent = useRef(cardContent)

  useEffect(() => {
    setCardContent(loadCards())
    setExpandedCards(new Set([sectionDef.cards[0]?.id]))
    setSavedAt(null)
  }, [sectionDef.slug, loadCards])

  useEffect(() => {
    latestContent.current = cardContent
  }, [cardContent])

  function scheduleAutosave(cardId: string, value: string) {
    const next = { ...latestContent.current, [cardId]: value }
    setCardContent(next)
    latestContent.current = next
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(next), 1500)
  }

  async function performSave(content: Record<string, string>) {
    setSaving(true)
    const hasContent = Object.values(content).some(v => v.trim().length > 0)
    const sectionStatus = hasContent ? 'draft' : 'empty'

    const payload = {
      project_id: project.id,
      user_id: userId,
      slug: sectionDef.slug,
      module: sectionDef.module,
      title: sectionDef.title,
      content: { cards: content },
      status: sectionStatus as 'empty' | 'draft' | 'reviewed',
    }

    if (existingSection?.id) {
      const { data } = await supabase
        .from('sections')
        .update(payload)
        .eq('id', existingSection.id)
        .select()
        .single()
      if (data) onUpdate(data as Section)
    } else {
      const { data } = await supabase
        .from('sections')
        .insert(payload)
        .select()
        .single()
      if (data) onUpdate(data as Section)
    }

    setSaving(false)
    setSavedAt(new Date())
  }

  async function manualSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await performSave(latestContent.current)
  }

  function toggleCard(cardId: string) {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  async function generateCard(cardId: string) {
    setCardStates(prev => ({ ...prev, [cardId]: 'generating' }))
    setExpandedCards(prev => new Set([...prev, cardId]))

    try {
      const res = await fetch('/api/claude/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug,
          cardId,
          project: {
            book: project.book,
            passage_ref: project.passage_ref,
            testament: project.testament,
            original_language: project.original_language,
          },
        }),
      })
      const data = await res.json()
      const generated = data[cardId] ?? ''
      if (!generated) throw new Error('empty')

      const next = { ...latestContent.current, [cardId]: generated }
      setCardContent(next)
      latestContent.current = next

      setCardStates(prev => ({ ...prev, [cardId]: 'saving' }))
      await performSave(next)
      setCardStates(prev => ({ ...prev, [cardId]: 'saved' }))
      setTimeout(() => setCardStates(prev => ({ ...prev, [cardId]: 'idle' })), 2000)
    } catch {
      setCardStates(prev => ({ ...prev, [cardId]: 'idle' }))
    }
  }

  async function generateAll() {
    setGeneratingAll(true)
    const allGenerating: Record<string, CardState> = {}
    sectionDef.cards.forEach(c => { allGenerating[c.id] = 'generating' })
    setCardStates(allGenerating)
    setExpandedCards(new Set(sectionDef.cards.map(c => c.id)))

    try {
      const res = await fetch('/api/claude/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug,
          project: {
            book: project.book,
            passage_ref: project.passage_ref,
            testament: project.testament,
            original_language: project.original_language,
          },
        }),
      })
      const data = await res.json()

      const next = { ...latestContent.current }
      sectionDef.cards.forEach(c => { if (data[c.id]) next[c.id] = data[c.id] })
      setCardContent(next)
      latestContent.current = next

      const allSaving: Record<string, CardState> = {}
      sectionDef.cards.forEach(c => { allSaving[c.id] = 'saving' })
      setCardStates(allSaving)

      await performSave(next)

      const allSaved: Record<string, CardState> = {}
      sectionDef.cards.forEach(c => { allSaved[c.id] = 'saved' })
      setCardStates(allSaved)
      setTimeout(() => setCardStates({}), 2500)
    } catch {
      setCardStates({})
    } finally {
      setGeneratingAll(false)
    }
  }

  const savedLabel = saving
    ? 'Salvando...'
    : savedAt
    ? `Salvo às ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  const hasAnyContent = Object.values(cardContent).some(v => v.trim().length > 0)

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'var(--font-sans)' }}>

      {/* Breadcrumb / header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
            {sectionDef.groupLabel}
          </span>
          <span style={{ color: 'var(--border)', fontSize: '0.72rem' }}>·</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {sectionDef.module.charAt(0).toUpperCase() + sectionDef.module.slice(1)}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {savedLabel}
          </span>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          {sectionDef.title}
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {project.book} {project.passage_ref} · {project.original_language}
        </p>
      </div>

      {/* Orientation block */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        marginBottom: '1.25rem',
        overflow: 'hidden',
      }}>
        <button
          onClick={() => setOrientationOpen(o => !o)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--ai)', textTransform: 'uppercase' }}>
            ORIENTACAO
          </span>
          <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {!orientationOpen && sectionDef.objective.slice(0, 80) + '…'}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {orientationOpen ? '▲' : '▼'}
          </span>
        </button>

        {orientationOpen && (
          <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '1rem', paddingTop: '0.75rem' }}>
              {sectionDef.objective}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Key questions */}
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Perguntas centrais
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {sectionDef.keyQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => onAskAI(q)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '0.4rem 0.65rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.79rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'inherit',
                        lineHeight: '1.4',
                        transition: 'border-color 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget
                        el.style.borderColor = 'var(--ai)'
                        el.style.color = 'var(--text-primary)'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget
                        el.style.borderColor = 'var(--border-subtle)'
                        el.style.color = 'var(--text-secondary)'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Relevant authors */}
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Autores relevantes
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {sectionDef.relevantAuthors.map(author => (
                    <span
                      key={author}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.76rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                      }}
                    >
                      {author}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {sectionDef.cards.map(card => {
          const content = cardContent[card.id] ?? ''
          const expanded = expandedCards.has(card.id)
          const dotColor = statusColor(content)
          const preview = !expanded && content.trim() ? content.trim().slice(0, 80) + (content.trim().length > 80 ? '…' : '') : ''

          return (
            <div
              key={card.id}
              style={{
                background: 'var(--surface)',
                border: `1px solid ${expanded ? 'var(--border)' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Card header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.65rem 0.85rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => toggleCard(card.id)}
              >
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: dotColor, flexShrink: 0,
                  boxShadow: dotColor !== 'var(--border)' ? `0 0 5px ${dotColor}40` : 'none',
                }} />
                <span style={{
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  color: expanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                  flexShrink: 0,
                }}>
                  {card.title}
                </span>
                {preview && (
                  <span style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                  }}>
                    {preview}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto', flexShrink: 0 }}>
                  {(() => {
                    const state = cardStates[card.id] ?? 'idle'
                    const isWorking = state === 'generating' || state === 'saving'
                    const label = state === 'generating' ? 'Gerando...' : state === 'saving' ? 'Salvando...' : state === 'saved' ? 'Salvo ✓' : 'Gerar com IA'
                    return (
                      <button
                        onClick={e => { e.stopPropagation(); if (!isWorking) generateCard(card.id) }}
                        disabled={isWorking || generatingAll}
                        style={{
                          background: state === 'saved' ? 'rgba(109,184,160,0.12)' : 'var(--ai-subtle)',
                          border: `1px solid ${state === 'saved' ? 'var(--success)' : 'transparent'}`,
                          borderRadius: '4px',
                          padding: '0.15rem 0.55rem',
                          fontSize: '0.72rem',
                          color: state === 'saved' ? 'var(--success)' : isWorking ? 'var(--text-muted)' : 'var(--ai)',
                          cursor: isWorking || generatingAll ? 'wait' : 'pointer',
                          fontFamily: 'inherit',
                          fontWeight: '600',
                          letterSpacing: '0.02em',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (!isWorking) e.currentTarget.style.borderColor = 'var(--ai)' }}
                        onMouseLeave={e => { if (state !== 'saved') e.currentTarget.style.borderColor = 'transparent' }}
                      >
                        {label}
                      </button>
                    )
                  })()}
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '0.2rem' }}>
                    {expanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Card body */}
              {expanded && (
                <div style={{ padding: '0 0.85rem 0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <textarea
                    value={content}
                    onChange={e => scheduleAutosave(card.id, e.target.value)}
                    placeholder={card.placeholder}
                    rows={5}
                    style={{
                      width: '100%',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.75rem 0.85rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      lineHeight: '1.7',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'var(--font-serif)',
                      marginTop: '0.65rem',
                      boxSizing: 'border-box',
                      caretColor: 'var(--accent)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--border)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: statusColor(content) !== 'var(--border)' ? statusColor(content) : 'var(--text-muted)' }}>
                      {statusLabel(content) === 'empty' ? 'vazio' : statusLabel(content) === 'draft' ? 'rascunho' : 'revisado'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <button
          onClick={generateAll}
          disabled={generatingAll}
          style={{
            background: generatingAll ? 'var(--surface-2)' : 'var(--ai-subtle)',
            border: `1px solid ${generatingAll ? 'var(--border)' : 'var(--ai)'}`,
            color: generatingAll ? 'var(--text-muted)' : 'var(--ai)',
            borderRadius: '7px',
            padding: '0.5rem 1rem',
            fontSize: '0.82rem',
            cursor: generatingAll ? 'wait' : 'pointer',
            fontFamily: 'inherit',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
        >
          {generatingAll ? 'Gerando todos os campos...' : 'Gerar seção completa com IA'}
        </button>
        {hasAnyContent && (
          <button
            onClick={manualSave}
            disabled={saving}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: '7px',
              padding: '0.5rem 1rem',
              fontSize: '0.82rem',
              cursor: saving ? 'wait' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {savedLabel}
        </span>
      </div>
    </div>
  )
}
