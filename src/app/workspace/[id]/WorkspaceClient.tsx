'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Project, Section } from '@/types/database'
import {
  WORKSPACE_SECTIONS,
  INVENTIO_GROUPS,
  DISPOSITIO_GROUPS,
  ELOCUTIO_GROUPS,
  MEMORIA_GROUPS,
  PRONUNTIATIO_GROUPS,
  getSectionsByGroup,
  getSectionBySlug,
} from '@/lib/workspace-sections'
import SectionWorkspace from './SectionWorkspace'
import AIPanel from './AIPanel'

interface Props {
  user: User
  project: Project
  initialSections: Section[]
}

const OTHER_MODULES: { id: string; label: string; subtitle: string }[] = []

function statusDotColor(status: 'empty' | 'draft' | 'reviewed' | undefined): string {
  if (!status || status === 'empty') return 'var(--border)'
  if (status === 'draft') return 'var(--accent)'
  return 'var(--success)'
}

export default function WorkspaceClient({ user, project, initialSections }: Props) {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [activeSlug, setActiveSlug] = useState<string>('contexto_historico')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['contextual']))
  const [aiOpen, setAiOpen] = useState(true)
  const [aiPrompt, setAiPrompt] = useState<string>('')

  const activeDef = getSectionBySlug(activeSlug)
  const activeSection = sections.find(s => s.slug === activeSlug)

  const handleSectionUpdate = useCallback((updated: Section) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === updated.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = updated
        return next
      }
      return [...prev, updated]
    })
  }, [])

  function toggleGroup(groupId: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  function getGroupProgress(groupId: string): { done: number; total: number } {
    const groupSections = getSectionsByGroup(groupId)
    const total = groupSections.length
    const done = groupSections.filter(sd => {
      const s = sections.find(sec => sec.slug === sd.slug)
      return s?.status === 'draft' || s?.status === 'reviewed'
    }).length
    return { done, total }
  }

  // Overall progress across all INVENTIO sections
  const totalSections = WORKSPACE_SECTIONS.length
  const doneSections = WORKSPACE_SECTIONS.filter(sd => {
    const s = sections.find(sec => sec.slug === sd.slug)
    return s?.status === 'draft' || s?.status === 'reviewed'
  }).length
  const progressPct = Math.round((doneSections / totalSections) * 100)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header style={{
        height: '50px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        gap: '0.75rem',
        background: 'var(--surface)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← Keryx
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', flexShrink: 0 }} />

        <span style={{
          fontWeight: '600',
          fontSize: '0.88rem',
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '220px',
          flexShrink: 1,
        }}>
          {project.title}
        </span>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)', flexShrink: 0 }} />

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          {project.book} {project.passage_ref}
        </span>
        <span style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '3px',
          padding: '0.1rem 0.4rem',
          flexShrink: 0,
        }}>
          {project.original_language}
        </span>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <div style={{
            width: '80px',
            height: '3px',
            background: 'var(--border)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'var(--accent)',
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{progressPct}%</span>
        </div>

        {/* AI toggle */}
        <button
          onClick={() => setAiOpen(o => !o)}
          style={{
            marginLeft: 'auto',
            background: aiOpen ? 'var(--ai-subtle)' : 'transparent',
            border: `1px solid ${aiOpen ? 'var(--ai)' : 'var(--border)'}`,
            color: aiOpen ? 'var(--ai)' : 'var(--text-muted)',
            borderRadius: '6px',
            padding: '0.25rem 0.7rem',
            fontSize: '0.78rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: '600',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: aiOpen ? 'var(--ai)' : 'var(--text-muted)', display: 'inline-block' }} />
          IA
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left sidebar ──────────────────────────────────────────────────── */}
        <nav style={{
          width: '200px',
          flexShrink: 0,
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '0.5rem 0 1rem',
        }}>
          {/* INVENTIO label */}
          <div style={{
            padding: '0.5rem 0.85rem 0.35rem',
            fontSize: '0.65rem',
            fontWeight: '800',
            letterSpacing: '0.1em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
          }}>
            I · INVENTIO
          </div>

          {/* Groups */}
          {INVENTIO_GROUPS.map(group => {
            const groupOpen = expandedGroups.has(group.id)
            const { done, total } = getGroupProgress(group.id)
            const groupSections = getSectionsByGroup(group.id)

            return (
              <div key={group.id}>
                {/* Group toggle */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '0.45rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {groupOpen ? '▾' : '▸'}
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    flex: 1,
                    textAlign: 'left',
                  }}>
                    {group.label}
                  </span>
                  <span style={{
                    fontSize: '0.67rem',
                    color: done === total ? 'var(--success)' : 'var(--text-muted)',
                    background: 'var(--surface-2)',
                    borderRadius: '9px',
                    padding: '0.05rem 0.4rem',
                    flexShrink: 0,
                  }}>
                    {done}/{total}
                  </span>
                </button>

                {/* Section items */}
                {groupOpen && groupSections.map(sd => {
                  const sec = sections.find(s => s.slug === sd.slug)
                  const isActive = sd.slug === activeSlug
                  return (
                    <button
                      key={sd.slug}
                      onClick={() => setActiveSlug(sd.slug)}
                      style={{
                        width: '100%',
                        background: isActive ? 'var(--accent-subtle)' : 'transparent',
                        border: 'none',
                        borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                        padding: '0.45rem 0.75rem 0.45rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: statusDotColor(sec?.status),
                      }} />
                      <span style={{
                        fontSize: '0.79rem',
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        lineHeight: '1.3',
                        textAlign: 'left',
                      }}>
                        {sd.shortTitle}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}

          {/* DISPOSITIO — desbloqueado */}
          <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
            <div style={{
              padding: '0.5rem 0.85rem 0.35rem',
              fontSize: '0.65rem',
              fontWeight: '800',
              letterSpacing: '0.1em',
              color: '#7c9cbf',
              textTransform: 'uppercase',
            }}>
              II · DISPOSITIO
            </div>

            {DISPOSITIO_GROUPS.map(group => {
              const groupOpen = expandedGroups.has(group.id)
              const { done, total } = getGroupProgress(group.id)
              const groupSections = getSectionsByGroup(group.id)

              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.45rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {groupOpen ? '▾' : '▸'}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', flex: 1 }}>
                      {group.label}
                    </span>
                    <span style={{
                      fontSize: '0.67rem',
                      color: done === total ? 'var(--success)' : 'var(--text-muted)',
                      background: 'var(--surface-2)',
                      borderRadius: '9px',
                      padding: '0.05rem 0.4rem',
                      flexShrink: 0,
                    }}>
                      {done}/{total}
                    </span>
                  </button>

                  {groupOpen && groupSections.map(sd => {
                    const sec = sections.find(s => s.slug === sd.slug)
                    const isActive = sd.slug === activeSlug
                    return (
                      <button
                        key={sd.slug}
                        onClick={() => setActiveSlug(sd.slug)}
                        style={{
                          width: '100%',
                          background: isActive ? 'rgba(124,156,191,0.1)' : 'transparent',
                          border: 'none',
                          borderLeft: `2px solid ${isActive ? 'var(--ai)' : 'transparent'}`,
                          padding: '0.45rem 0.75rem 0.45rem 1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                        }}
                      >
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                          background: statusDotColor(sec?.status),
                        }} />
                        <span style={{
                          fontSize: '0.79rem',
                          color: isActive ? 'var(--ai)' : 'var(--text-secondary)',
                          lineHeight: '1.3',
                          textAlign: 'left',
                        }}>
                          {sd.shortTitle}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* ELOCUTIO */}
          {[
            { label: 'III · ELOCUTIO', color: '#9b7ec8', bgColor: 'rgba(155,126,200,0.1)', groups: ELOCUTIO_GROUPS },
            { label: 'IV · MEMORIA', color: '#6db8a0', bgColor: 'rgba(109,184,160,0.1)', groups: MEMORIA_GROUPS },
            { label: 'V · PRONUNTIATIO', color: '#c47c5a', bgColor: 'rgba(196,124,90,0.1)', groups: PRONUNTIATIO_GROUPS },
          ].map(mod => (
            <div key={mod.label} style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
              <div style={{ padding: '0.5rem 0.85rem 0.35rem', fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.1em', color: mod.color, textTransform: 'uppercase' }}>
                {mod.label}
              </div>
              {mod.groups.map(group => {
                const groupOpen = expandedGroups.has(group.id)
                const { done, total } = getGroupProgress(group.id)
                const groupSections = getSectionsByGroup(group.id)
                return (
                  <div key={group.id}>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', flexShrink: 0 }}>{groupOpen ? '▾' : '▸'}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', flex: 1, textAlign: 'left' }}>{group.label}</span>
                      <span style={{ fontSize: '0.67rem', color: done === total ? 'var(--success)' : 'var(--text-muted)', background: 'var(--surface-2)', borderRadius: '9px', padding: '0.05rem 0.4rem', flexShrink: 0 }}>
                        {done}/{total}
                      </span>
                    </button>
                    {groupOpen && groupSections.map(sd => {
                      const sec = sections.find(s => s.slug === sd.slug)
                      const isActive = sd.slug === activeSlug
                      return (
                        <button
                          key={sd.slug}
                          onClick={() => setActiveSlug(sd.slug)}
                          style={{ width: '100%', background: isActive ? mod.bgColor : 'transparent', border: 'none', borderLeft: `2px solid ${isActive ? mod.color : 'transparent'}`, padding: '0.45rem 0.75rem 0.45rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: statusDotColor(sec?.status) }} />
                          <span style={{ fontSize: '0.79rem', color: isActive ? mod.color : 'var(--text-secondary)', lineHeight: '1.3', textAlign: 'left' }}>
                            {sd.shortTitle}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── Main workspace ────────────────────────────────────────────────── */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--background)',
        }}>
          {activeDef ? (
            <SectionWorkspace
              key={activeSlug}
              sectionDef={activeDef}
              project={project}
              userId={user.id}
              existingSection={activeSection}
              onUpdate={handleSectionUpdate}
              onAskAI={(prompt) => {
                setAiPrompt(prompt)
                setAiOpen(true)
              }}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}>
              Selecione uma seção
            </div>
          )}
        </main>

        {/* ── AI Panel ──────────────────────────────────────────────────────── */}
        {aiOpen && (
          <aside style={{
            width: '360px',
            flexShrink: 0,
            borderLeft: '1px solid var(--border-subtle)',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <AIPanel
              project={project}
              activeSlug={activeSlug}
              activeTitle={activeDef?.title ?? ''}
              context={aiPrompt}
              onClearContext={() => setAiPrompt('')}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
