'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { SectionDef } from '@/lib/workspace-sections'
import HelpIcon from '@/components/help/HelpIcon'

type CardState = 'idle' | 'generating' | 'saving' | 'saved'

interface Props {
  sectionDef: SectionDef
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
}

function dotColor(text: string): string {
  if (!text.trim()) return 'var(--border)'
  if (text.trim().length < 80) return 'var(--accent)'
  return 'var(--success)'
}

function fieldStatus(text: string): 'empty' | 'draft' | 'reviewed' {
  if (!text.trim()) return 'empty'
  if (text.trim().length < 80) return 'draft'
  return 'reviewed'
}

const MODULE_COLORS: Record<string, string> = {
  inventio:     'var(--accent)',
  dispositio:   'var(--ai)',
  elocutio:     '#9b7ec8',
  memoria:      '#6db8a0',
  pronuntiatio: '#c47c5a',
}

export default function SectionWorkspace({
  sectionDef, project, userId, existingSection, onUpdate, onAskAI,
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

  useEffect(() => { latestContent.current = cardContent }, [cardContent])

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
    const payload = {
      project_id: project.id, user_id: userId,
      slug: sectionDef.slug, module: sectionDef.module,
      title: sectionDef.title, content: { cards: content },
      status: (hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
    }
    if (existingSection?.id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', existingSection.id).select().single()
      if (data) onUpdate(data as Section)
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
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
      if (next.has(cardId)) next.delete(cardId); else next.add(cardId)
      return next
    })
  }

  async function generateCard(cardId: string) {
    setCardStates(prev => ({ ...prev, [cardId]: 'generating' }))
    setExpandedCards(prev => new Set([...prev, cardId]))
    try {
      const res = await fetch('/api/claude/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug, cardId,
          project: { book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language },
        }),
      })
      const data = await res.json()
      const generated = data[cardId] ?? ''
      if (!generated) throw new Error('empty')
      const next = { ...latestContent.current, [cardId]: generated }
      setCardContent(next); latestContent.current = next
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionSlug: sectionDef.slug,
          project: { book: project.book, passage_ref: project.passage_ref, testament: project.testament, original_language: project.original_language },
        }),
      })
      const data = await res.json()
      const next = { ...latestContent.current }
      sectionDef.cards.forEach(c => { if (data[c.id]) next[c.id] = data[c.id] })
      setCardContent(next); latestContent.current = next
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

  const moduleColor = MODULE_COLORS[sectionDef.module] ?? 'var(--accent)'
  const hasAnyContent = Object.values(cardContent).some(v => v.trim().length > 0)
  const savedLabel = saving
    ? 'salvando…'
    : savedAt
    ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 2.5rem 5rem', fontFamily: 'var(--font-sans)' }}>

      {/* Breadcrumb */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        fontSize: '0.68rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: '0.75rem',
      }}>
        <span style={{ color: moduleColor, fontWeight: '700' }}>
          {sectionDef.module.charAt(0).toUpperCase() + sectionDef.module.slice(1)}
        </span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>{sectionDef.groupLabel}</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.7rem',
          color: saving ? 'var(--ai)' : savedAt ? 'var(--success)' : 'transparent',
          fontStyle: 'normal',
          textTransform: 'none',
          letterSpacing: 0,
          transition: 'color 0.3s',
        }}>
          {savedLabel || '·'}
        </span>
      </div>

      {/* Section title */}
      <h1 style={{
        fontSize: '1.6rem', fontWeight: '700',
        letterSpacing: '-0.025em', lineHeight: 1.2,
        color: 'var(--text-primary)', marginBottom: '0.85rem',
      }}>
        {sectionDef.title}
      </h1>

      {/* Reference */}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {project.book} {project.passage_ref} · {project.original_language}
      </p>

      {/* Objective — borderLeft quote style */}
      <p style={{
        fontSize: '0.87rem', color: 'var(--text-secondary)',
        lineHeight: '1.8', fontStyle: 'italic',
        borderLeft: `2px solid ${moduleColor}30`,
        paddingLeft: '1rem', marginBottom: '1.5rem',
      }}>
        {sectionDef.objective}
      </p>

      {/* Key questions */}
      <div style={{ marginBottom: '0.6rem' }}>
        <div style={{
          fontSize: '0.62rem', fontWeight: '800',
          letterSpacing: '0.1em', color: 'var(--text-muted)',
          textTransform: 'uppercase', marginBottom: '0.55rem',
        }}>
          Perguntas centrais
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {sectionDef.keyQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => onAskAI(q)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '0.28rem 0.6rem',
                fontSize: '0.76rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit',
                lineHeight: '1.35', textAlign: 'left',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = moduleColor; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Authors */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', paddingLeft: '0.1rem' }}>
        {sectionDef.relevantAuthors.map(author => (
          <span key={author} style={{
            fontSize: '0.72rem', color: 'var(--text-muted)',
            fontStyle: 'italic',
          }}>
            {author}
          </span>
        ))}
      </div>

      {/* ── Fields ──────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {sectionDef.cards.map((card, idx) => {
          const content = cardContent[card.id] ?? ''
          const expanded = expandedCards.has(card.id)
          const dc = dotColor(content)
          const state = cardStates[card.id] ?? 'idle'
          const isWorking = state === 'generating' || state === 'saving'
          const preview = !expanded && content.trim()
            ? content.trim().slice(0, 130) + (content.trim().length > 130 ? '…' : '')
            : ''

          const isLast = idx === sectionDef.cards.length - 1

          return (
            <div
              key={card.id}
              style={{
                borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                paddingBottom: expanded ? '1.25rem' : preview ? '0.85rem' : '0.85rem',
              }}
            >
              {/* Field header row */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  cursor: 'pointer', userSelect: 'none',
                  marginBottom: expanded ? '0.8rem' : '0',
                }}
                onClick={() => toggleCard(card.id)}
              >
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                  background: dc,
                  boxShadow: dc !== 'var(--border)' ? `0 0 4px ${dc}50` : 'none',
                }} />

                <span style={{
                  fontSize: '0.72rem', fontWeight: '700',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: expanded ? 'var(--text-primary)' : 'var(--text-secondary)',
                  flex: 1,
                }}>
                  {card.title}
                </span>

                <HelpIcon cardId={card.id} onAskAI={onAskAI} />

                <button
                  onClick={e => { e.stopPropagation(); if (!isWorking) generateCard(card.id) }}
                  disabled={isWorking || generatingAll}
                  style={{
                    background: 'transparent', border: 'none',
                    color: state === 'saved' ? 'var(--success)' : isWorking ? 'var(--text-muted)' : 'var(--ai)',
                    cursor: isWorking || generatingAll ? 'wait' : 'pointer',
                    fontFamily: 'inherit', fontSize: '0.71rem', fontWeight: '600',
                    padding: '0', letterSpacing: '0.01em', whiteSpace: 'nowrap',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isWorking && state !== 'saved') e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { if (!isWorking && state !== 'saved') e.currentTarget.style.color = 'var(--ai)' }}
                >
                  {state === 'generating' ? 'Gerando…'
                    : state === 'saving' ? 'Salvando…'
                    : state === 'saved' ? 'Salvo ✓'
                    : 'Gerar ↑'}
                </button>

                <span style={{
                  fontSize: '0.6rem', color: 'var(--text-muted)',
                  marginLeft: '0.25rem', userSelect: 'none',
                }}>
                  {expanded ? '▲' : '▼'}
                </span>
              </div>

              {/* Preview (collapsed + has content) */}
              {!expanded && preview && (
                <p style={{
                  fontSize: '0.83rem', color: 'var(--text-muted)',
                  lineHeight: '1.55', fontStyle: 'italic',
                  marginLeft: '0.9rem', marginTop: '0.25rem',
                }}>
                  {preview}
                </p>
              )}

              {/* Expanded textarea */}
              {expanded && (
                <>
                  <textarea
                    value={content}
                    onChange={e => scheduleAutosave(card.id, e.target.value)}
                    placeholder={card.placeholder}
                    rows={6}
                    style={{
                      width: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.9rem 1rem',
                      color: 'var(--text-primary)',
                      fontSize: '0.92rem', lineHeight: '1.78',
                      resize: 'vertical', outline: 'none',
                      fontFamily: 'var(--font-serif)',
                      boxSizing: 'border-box',
                      caretColor: moduleColor,
                    }}
                    onFocus={e => e.target.style.borderColor = moduleColor + '60'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.3rem' }}>
                    <span style={{
                      fontSize: '0.67rem',
                      color: fieldStatus(content) === 'empty' ? 'transparent' : fieldStatus(content) === 'draft' ? 'var(--accent)' : 'var(--success)',
                      opacity: 0.75,
                    }}>
                      {fieldStatus(content) === 'draft' ? 'rascunho' : fieldStatus(content) === 'reviewed' ? 'revisado' : ''}
                    </span>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer actions */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        marginTop: '2rem', paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <button
          onClick={generateAll}
          disabled={generatingAll}
          style={{
            background: 'transparent',
            border: `1px solid ${generatingAll ? 'var(--border)' : 'var(--ai)'}`,
            color: generatingAll ? 'var(--text-muted)' : 'var(--ai)',
            borderRadius: '6px', padding: '0.45rem 0.9rem',
            fontSize: '0.79rem', cursor: generatingAll ? 'wait' : 'pointer',
            fontFamily: 'inherit', fontWeight: '600',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!generatingAll) { e.currentTarget.style.background = 'var(--ai-subtle)' } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          {generatingAll ? 'Gerando…' : 'Gerar seção completa com IA'}
        </button>

        {hasAnyContent && (
          <button
            onClick={manualSave}
            disabled={saving}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '6px', padding: '0.45rem 0.9rem',
              fontSize: '0.79rem', cursor: saving ? 'wait' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        )}
      </div>
    </div>
  )
}
