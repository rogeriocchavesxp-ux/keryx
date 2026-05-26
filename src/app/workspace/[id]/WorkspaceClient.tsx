'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Project, Section } from '@/types/database'
import {
  WORKSPACE_SECTIONS,
  SYNTHESIS_DEFS,
  getSectionsByGroup,
  getSectionBySlug,
  isSynthesisSlug,
  getSynthesisBySlug,
} from '@/lib/workspace-sections'
import SectionWorkspace from './SectionWorkspace'
import SynthesisView from './SynthesisView'
import AIPanel from './AIPanel'

interface Props {
  user: User
  project: Project
  initialSections: Section[]
}

// ── Estrutura de navegação em duas fases ───────────────────────────────────

const NAV_PHASES = [
  {
    id: 'interpretar',
    roman: 'I',
    label: 'Interpretar',
    latinNote: 'Inventio',
    color: 'var(--accent)',
    bgActive: 'rgba(184,146,42,0.08)',
    modules: ['inventio'],
    groups: [
      { id: 'contextual', label: 'Estudo Contextual' },
      { id: 'textual',    label: 'Estudo Textual' },
      { id: 'teologico',  label: 'Estudo Teológico' },
    ],
  },
  {
    id: 'comunicar',
    roman: 'II',
    label: 'Comunicar',
    latinNote: 'Dispositio · Elocutio · Memoria · Pronuntiatio',
    color: 'var(--ai)',
    bgActive: 'rgba(124,156,191,0.08)',
    modules: ['dispositio', 'elocutio', 'memoria', 'pronuntiatio'],
    groups: [
      { id: 'proposicao',         label: 'Ideia e Propósito' },
      { id: 'estrutura',          label: 'Estrutura do Sermão' },
      { id: 'encerramento',       label: 'Aplicação e Conclusão' },
      { id: 'vocabulario',        label: 'Linguagem e Clareza' },
      { id: 'imagens',            label: 'Imagens e Retórica' },
      { id: 'tom',                label: 'Tom Pastoral' },
      { id: 'memorizacao',        label: 'Internalização · Memoria' },
      { id: 'entrega',            label: 'Entrega · Pronuntiatio' },
      { id: 'avaliacao_pregacao', label: 'Avaliação' },
    ],
  },
] as const

type PhaseId = typeof NAV_PHASES[number]['id']

function getPhaseFor(slug: string): PhaseId {
  if (isSynthesisSlug(slug)) return 'interpretar'
  const sec = getSectionBySlug(slug)
  return sec?.module === 'inventio' ? 'interpretar' : 'comunicar'
}

function getGroupFor(slug: string): string | undefined {
  if (isSynthesisSlug(slug)) return getSynthesisBySlug(slug)?.groupId
  return getSectionBySlug(slug)?.group
}

function statusDot(status: 'empty' | 'draft' | 'reviewed' | undefined): string {
  if (!status || status === 'empty') return 'var(--border)'
  if (status === 'draft') return 'var(--accent)'
  return 'var(--success)'
}

// ── Componente principal ────────────────────────────────────────────────────

export default function WorkspaceClient({ user, project, initialSections }: Props) {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [activeSlug, setActiveSlug] = useState('contexto_historico')
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => new Set(['interpretar']))
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(['contextual']))
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  const activeDef = getSectionBySlug(activeSlug)
  const activeSection = sections.find(s => s.slug === activeSlug)
  const activePhase = NAV_PHASES.find(p => p.id === getPhaseFor(activeSlug))

  const handleSectionUpdate = useCallback((updated: Section) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === updated.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next }
      return [...prev, updated]
    })
  }, [])

  function togglePhase(id: string) {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function navigate(slug: string) {
    setExpandedPhases(prev => new Set([...prev, getPhaseFor(slug)]))
    const g = getGroupFor(slug)
    if (g) setExpandedGroups(prev => new Set([...prev, g]))
    setActiveSlug(slug)
  }

  function groupProgress(groupId: string) {
    const gs = getSectionsByGroup(groupId)
    return {
      total: gs.length,
      done: gs.filter(sd => {
        const s = sections.find(sec => sec.slug === sd.slug)
        return s?.status === 'draft' || s?.status === 'reviewed'
      }).length,
    }
  }

  const totalSecs = WORKSPACE_SECTIONS.length
  const doneSecs = WORKSPACE_SECTIONS.filter(sd => {
    const s = sections.find(sec => sec.slug === sd.slug)
    return s?.status === 'draft' || s?.status === 'reviewed'
  }).length
  const pct = Math.round((doneSecs / totalSecs) * 100)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>

      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <header style={{
        height: '46px', flexShrink: 0,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center',
        padding: '0 1rem 0 0.75rem', gap: '0',
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: '0.78rem',
            padding: '0.2rem 0.6rem 0.2rem 0.3rem', borderRadius: '4px',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center',
            gap: '0.3rem', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ←
        </button>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)', marginRight: '0.6rem', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: '0.45rem', overflow: 'hidden' }}>
          <span style={{ fontWeight: '600', fontSize: '0.86rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1 }}>
            {project.title}
          </span>
          <span style={{ color: 'var(--border)', fontSize: '0.78rem', flexShrink: 0 }}>·</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {project.book} {project.passage_ref}
          </span>
          <span style={{
            fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0,
            background: 'var(--surface-2)', border: '1px solid var(--border-subtle)',
            borderRadius: '3px', padding: '0.05rem 0.35rem',
          }}>
            {project.original_language}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0, marginLeft: '0.75rem' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{pct}%</span>
          <div style={{ width: '56px', height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: activePhase?.color ?? 'var(--accent)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        <button
          onClick={() => setAiOpen(o => !o)}
          style={{
            marginLeft: '0.75rem', flexShrink: 0,
            background: aiOpen ? 'var(--ai-subtle)' : 'transparent',
            border: `1px solid ${aiOpen ? 'var(--ai)' : 'var(--border-subtle)'}`,
            color: aiOpen ? 'var(--ai)' : 'var(--text-muted)',
            borderRadius: '5px', padding: '0.2rem 0.55rem',
            fontSize: '0.73rem', fontWeight: '700', letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!aiOpen) { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)' } }}
          onMouseLeave={e => { if (!aiOpen) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
        >
          IA
        </button>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <nav style={{
          width: '196px', flexShrink: 0,
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          paddingBottom: '2rem',
        }}>

          {NAV_PHASES.map((phase, phaseIdx) => {
            const phaseOpen = expandedPhases.has(phase.id)

            return (
              <div key={phase.id}>

                {/* Phase toggle button */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  style={{
                    width: '100%', border: 'none', cursor: 'pointer',
                    background: 'transparent', textAlign: 'left',
                    padding: phaseIdx === 0 ? '1rem 0.9rem 0.55rem' : '0.9rem 0.9rem 0.55rem',
                    borderTop: phaseIdx > 0 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <span style={{
                        fontSize: '0.58rem', fontWeight: '800',
                        color: phase.color, opacity: 0.55,
                        letterSpacing: '0.08em',
                      }}>
                        {phase.roman}
                      </span>
                      <span style={{
                        fontSize: '0.85rem', fontWeight: '700',
                        color: phase.color, letterSpacing: '-0.01em',
                      }}>
                        {phase.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)', opacity: 0.6 }}>
                      {phaseOpen ? '▾' : '▸'}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.63rem', color: 'var(--text-muted)',
                    fontStyle: 'italic', display: 'block', lineHeight: '1.3',
                    paddingLeft: '0.05rem',
                  }}>
                    {phase.latinNote}
                  </span>
                </button>

                {/* Groups */}
                {phaseOpen && (
                  <div style={{ paddingBottom: '0.6rem' }}>
                    {phase.groups.map(group => {
                      const groupOpen = expandedGroups.has(group.id)
                      const secs = getSectionsByGroup(group.id)
                      if (secs.length === 0) return null
                      const { done, total } = groupProgress(group.id)

                      return (
                        <div key={group.id}>

                          {/* Group toggle */}
                          <button
                            onClick={() => toggleGroup(group.id)}
                            style={{
                              width: '100%', background: 'transparent', border: 'none',
                              padding: '0.38rem 0.9rem 0.35rem 0.7rem',
                              display: 'flex', alignItems: 'center', gap: '0.35rem',
                              cursor: 'pointer', textAlign: 'left',
                            }}
                          >
                            <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)', opacity: 0.55, flexShrink: 0 }}>
                              {groupOpen ? '▾' : '▸'}
                            </span>
                            <span style={{
                              fontSize: '0.71rem', fontWeight: '500',
                              color: 'var(--text-secondary)', flex: 1, lineHeight: '1.3',
                            }}>
                              {group.label}
                            </span>
                            {done > 0 && (
                              <span style={{
                                fontSize: '0.59rem', flexShrink: 0,
                                color: done === total ? 'var(--success)' : 'var(--text-muted)',
                                opacity: 0.8,
                              }}>
                                {done}/{total}
                              </span>
                            )}
                          </button>

                          {/* Section items */}
                          {groupOpen && secs.map(sd => {
                            const sec = sections.find(s => s.slug === sd.slug)
                            const isActive = sd.slug === activeSlug
                            return (
                              <button
                                key={sd.slug}
                                onClick={() => navigate(sd.slug)}
                                style={{
                                  width: '100%', border: 'none', fontFamily: 'inherit',
                                  background: isActive ? phase.bgActive : 'transparent',
                                  borderLeft: `2px solid ${isActive ? phase.color : 'transparent'}`,
                                  padding: '0.28rem 0.6rem 0.28rem 1.3rem',
                                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                                  cursor: 'pointer', textAlign: 'left',
                                  transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                              >
                                <span style={{
                                  width: '4px', height: '4px', borderRadius: '50%',
                                  flexShrink: 0, background: statusDot(sec?.status),
                                  opacity: isActive ? 1 : 0.55,
                                }} />
                                <span style={{
                                  fontSize: '0.75rem', lineHeight: '1.3',
                                  color: isActive ? phase.color : 'var(--text-secondary)',
                                  fontWeight: isActive ? '500' : '400',
                                }}>
                                  {sd.shortTitle}
                                </span>
                              </button>
                            )
                          })}

                          {/* Synthesis item (only for groups that have one) */}
                          {groupOpen && (() => {
                            const syn = SYNTHESIS_DEFS[group.id]
                            if (!syn) return null
                            const isSynActive = activeSlug === syn.slug
                            return (
                              <button
                                onClick={() => navigate(syn.slug)}
                                style={{
                                  width: '100%', border: 'none', fontFamily: 'inherit',
                                  background: isSynActive ? phase.bgActive : 'transparent',
                                  borderLeft: `2px solid ${isSynActive ? phase.color : 'var(--border-subtle)'}`,
                                  padding: '0.28rem 0.6rem 0.28rem 1.3rem',
                                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                                  cursor: 'pointer', textAlign: 'left',
                                  marginTop: '0.2rem',
                                  transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => { if (!isSynActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                onMouseLeave={e => { if (!isSynActive) e.currentTarget.style.background = 'transparent' }}
                              >
                                <span style={{
                                  width: '4px', height: '2px', borderRadius: '1px',
                                  flexShrink: 0,
                                  background: isSynActive ? phase.color : 'var(--border)',
                                }} />
                                <span style={{
                                  fontSize: '0.72rem', lineHeight: '1.3',
                                  color: isSynActive ? phase.color : 'var(--text-muted)',
                                  fontWeight: isSynActive ? '500' : '400',
                                  fontStyle: 'italic', flex: 1,
                                }}>
                                  {syn.shortTitle}
                                </span>
                                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', opacity: 0.5 }}>→</span>
                              </button>
                            )
                          })()}

                        </div>
                      )
                    })}
                  </div>
                )}

              </div>
            )
          })}
        </nav>

        {/* ── Content + AI drawer ───────────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <main style={{ height: '100%', overflowY: 'auto', background: 'var(--background)' }}>
            {activeDef ? (
              <SectionWorkspace
                key={activeSlug}
                sectionDef={activeDef}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : isSynthesisSlug(activeSlug) ? (
              <SynthesisView
                key={activeSlug}
                synthesisDef={getSynthesisBySlug(activeSlug)!}
                project={project}
                savedSections={sections}
                onNavigate={navigate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: 'var(--text-muted)', fontSize: '0.88rem',
              }}>
                Selecione uma seção
              </div>
            )}
          </main>

          <aside style={{
            position: 'absolute', inset: '0 0 0 auto',
            width: '340px',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column',
            transform: aiOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: aiOpen ? '-12px 0 40px rgba(0,0,0,0.18)' : 'none',
            zIndex: 20, willChange: 'transform',
          }}>
            <AIPanel
              project={project}
              activeSlug={activeSlug}
              activeTitle={activeDef?.title ?? ''}
              context={aiPrompt}
              onClearContext={() => setAiPrompt('')}
            />
          </aside>
        </div>

      </div>
    </div>
  )
}
