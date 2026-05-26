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

const MODULES = [
  { id: 'inventio',     roman: 'I',   label: 'Inventio',     color: 'var(--accent)', bgActive: 'rgba(184,146,42,0.07)',   groups: INVENTIO_GROUPS },
  { id: 'dispositio',   roman: 'II',  label: 'Dispositio',   color: 'var(--ai)',     bgActive: 'rgba(124,156,191,0.07)',  groups: DISPOSITIO_GROUPS },
  { id: 'elocutio',     roman: 'III', label: 'Elocutio',     color: '#9b7ec8',       bgActive: 'rgba(155,126,200,0.07)',  groups: ELOCUTIO_GROUPS },
  { id: 'memoria',      roman: 'IV',  label: 'Memoria',      color: '#6db8a0',       bgActive: 'rgba(109,184,160,0.07)',  groups: MEMORIA_GROUPS },
  { id: 'pronuntiatio', roman: 'V',   label: 'Pronuntiatio', color: '#c47c5a',       bgActive: 'rgba(196,124,90,0.07)',   groups: PRONUNTIATIO_GROUPS },
] as const

function statusDot(status: 'empty' | 'draft' | 'reviewed' | undefined): string {
  if (!status || status === 'empty') return 'var(--border)'
  if (status === 'draft') return 'var(--accent)'
  return 'var(--success)'
}

export default function WorkspaceClient({ user, project, initialSections }: Props) {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [activeSlug, setActiveSlug] = useState<string>('contexto_historico')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['contextual']))
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState<string>('')

  const activeDef = getSectionBySlug(activeSlug)
  const activeSection = sections.find(s => s.slug === activeSlug)

  const handleSectionUpdate = useCallback((updated: Section) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === updated.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next }
      return [...prev, updated]
    })
  }, [])

  function toggleGroup(groupId: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId)
      return next
    })
  }

  function getGroupProgress(groupId: string): { done: number; total: number } {
    const gs = getSectionsByGroup(groupId)
    return {
      total: gs.length,
      done: gs.filter(sd => {
        const s = sections.find(sec => sec.slug === sd.slug)
        return s?.status === 'draft' || s?.status === 'reviewed'
      }).length,
    }
  }

  const totalSections = WORKSPACE_SECTIONS.length
  const doneSections = WORKSPACE_SECTIONS.filter(sd => {
    const s = sections.find(sec => sec.slug === sd.slug)
    return s?.status === 'draft' || s?.status === 'reviewed'
  }).length
  const progressPct = Math.round((doneSections / totalSections) * 100)

  const activeModule = MODULES.find(m =>
    m.groups.some(g => getSectionsByGroup(g.id).some(s => s.slug === activeSlug))
  )
  const accentColor = activeModule?.color ?? 'var(--accent)'

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header style={{
        height: '46px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem 0 0.75rem',
        gap: '0',
        background: 'var(--surface)',
        flexShrink: 0,
        position: 'relative',
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '0.78rem', padding: '0.2rem 0.6rem 0.2rem 0.3rem',
            borderRadius: '4px', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ←
        </button>

        <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)', flexShrink: 0, marginRight: '0.6rem' }} />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', overflow: 'hidden', flex: 1, minWidth: 0 }}>
          <span style={{
            fontWeight: '600', fontSize: '0.86rem', color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 1,
          }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '0.75rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', tabularNums: true } as React.CSSProperties}>
            {progressPct}%
          </span>
          <div style={{ width: '60px', height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: accentColor, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        <button
          onClick={() => setAiOpen(o => !o)}
          title={aiOpen ? 'Fechar assistente' : 'Abrir assistente de IA'}
          style={{
            marginLeft: '0.75rem',
            background: aiOpen ? 'var(--ai-subtle)' : 'transparent',
            border: `1px solid ${aiOpen ? 'var(--ai)' : 'var(--border-subtle)'}`,
            color: aiOpen ? 'var(--ai)' : 'var(--text-muted)',
            borderRadius: '5px',
            padding: '0.2rem 0.55rem',
            fontSize: '0.73rem', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: '700',
            letterSpacing: '0.04em', flexShrink: 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!aiOpen) { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)' } }}
          onMouseLeave={e => { if (!aiOpen) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
        >
          IA
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <nav style={{
          width: '168px',
          flexShrink: 0,
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '1.5rem',
        }}>
          {MODULES.map((mod, modIdx) => (
            <div key={mod.id} style={{ marginTop: modIdx === 0 ? '0.5rem' : '0.25rem' }}>
              {modIdx > 0 && (
                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.5rem 0.75rem 0.25rem' }} />
              )}

              <div style={{
                padding: '0.4rem 0.85rem 0.2rem',
                fontSize: '0.58rem', fontWeight: '800',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: mod.color, opacity: 0.85,
              }}>
                {mod.roman} · {mod.label}
              </div>

              {mod.groups.map(group => {
                const groupOpen = expandedGroups.has(group.id)
                const { done, total } = getGroupProgress(group.id)
                const groupSections = getSectionsByGroup(group.id)

                return (
                  <div key={group.id}>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        padding: '0.3rem 0.85rem 0.3rem 0.75rem',
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', flexShrink: 0, opacity: 0.7 }}>
                        {groupOpen ? '▾' : '▸'}
                      </span>
                      <span style={{
                        fontSize: '0.72rem', color: 'var(--text-secondary)',
                        flex: 1, textAlign: 'left', fontWeight: '500',
                      }}>
                        {group.label}
                      </span>
                      {done > 0 && (
                        <span style={{
                          fontSize: '0.62rem',
                          color: done === total ? 'var(--success)' : 'var(--text-muted)',
                          flexShrink: 0, opacity: 0.8,
                        }}>
                          {done}/{total}
                        </span>
                      )}
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
                            background: isActive ? mod.bgActive : 'transparent',
                            border: 'none',
                            borderLeft: `2px solid ${isActive ? mod.color : 'transparent'}`,
                            padding: '0.3rem 0.6rem 0.3rem 1.1rem',
                            display: 'flex', alignItems: 'center', gap: '0.45rem',
                            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                        >
                          <span style={{
                            width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                            background: statusDot(sec?.status),
                            opacity: isActive ? 1 : 0.7,
                          }} />
                          <span style={{
                            fontSize: '0.76rem',
                            color: isActive ? mod.color : 'var(--text-secondary)',
                            lineHeight: '1.3', textAlign: 'left',
                            fontWeight: isActive ? '500' : '400',
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
          ))}
        </nav>

        {/* ── Content + AI drawer wrapper ──────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

          {/* Main content */}
          <main style={{ height: '100%', overflowY: 'auto', background: 'var(--background)' }}>
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
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', color: 'var(--text-muted)', fontSize: '0.88rem',
              }}>
                Selecione uma seção
              </div>
            )}
          </main>

          {/* AI drawer — overlay from right */}
          <aside style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: '340px',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex', flexDirection: 'column',
            transform: aiOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: aiOpen ? '-12px 0 40px rgba(0,0,0,0.18)' : 'none',
            zIndex: 20,
            willChange: 'transform',
          }}>
            <AIPanel
              project={project}
              activeSlug={activeSlug}
              activeTitle={activeDef?.title ?? ''}
              context={aiPrompt}
              onClearContext={() => setAiPrompt('')}
            />
          </aside>

          {/* Backdrop when AI is open on narrow screens */}
          {aiOpen && (
            <div
              onClick={() => setAiOpen(false)}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(14,17,25,0.3)',
                zIndex: 19,
                display: 'none', // visible only via media query below
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
