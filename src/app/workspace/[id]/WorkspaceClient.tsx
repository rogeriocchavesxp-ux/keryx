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
import { TOOL_AREAS, getToolAreaBySlug, isToolSlug } from '@/lib/tools-content'
import SectionWorkspace from './SectionWorkspace'
import SynthesisView from './SynthesisView'
import OriginalTextWorkspace from './OriginalTextWorkspace'
import ToolsWorkspace from './ToolsWorkspace'
import CollagesWorkspace from './CollagesWorkspace'
import AIPanel from './AIPanel'

interface Props {
  user: User
  project: Project
  initialSections: Section[]
}

// ── Tipos de navegação ─────────────────────────────────────────────────────

type PhaseId = 'interpretar' | 'comunicar' | 'ferramentas' | 'colagens'

interface NavGroup { id: string; label: string }
interface NavMode { id: string; label: string; subtitle: string; color: string; bgActive: string; groups: NavGroup[] }
interface NavPhase { id: PhaseId; roman: string; label: string; color: string; bgActive: string; modes: NavMode[] }

const NAV_PHASES: NavPhase[] = [
  {
    id: 'interpretar', roman: 'I', label: 'Interpretar',
    color: 'var(--accent)', bgActive: 'rgba(184,146,42,0.08)',
    modes: [
      {
        id: 'interpretar_inventio',
        label: 'Exegese',
        subtitle: 'Invenção · Inventio',
        color: 'var(--accent)',
        bgActive: 'rgba(184,146,42,0.08)',
        groups: [
          { id: 'contextual', label: 'Estudo Contextual' },
          { id: 'textual',    label: 'Estudo Textual' },
          { id: 'teologico',  label: 'Estudo Teológico' },
        ],
      },
    ],
  },
  {
    id: 'comunicar', roman: 'II', label: 'Comunicar',
    color: 'var(--ai)', bgActive: 'rgba(124,156,191,0.08)',
    modes: [
      {
        id: 'sermao',
        label: 'Sermão',
        subtitle: 'Proclamação pública',
        color: 'var(--ai)',
        bgActive: 'rgba(124,156,191,0.08)',
        groups: [
          { id: 'sermao_inventio', label: 'Invenção · Inventio' },
          { id: 'sermao_dispositio', label: 'Disposição · Dispositio' },
          { id: 'sermao_elocutio', label: 'Elocução · Elocutio' },
          { id: 'sermao_memoria', label: 'Memória · Memoria' },
          { id: 'sermao_pronuntiatio', label: 'Entrega · Pronuntiatio' },
          { id: 'sermao_avaliacao', label: 'Avaliação' },
        ],
      },
      {
        id: 'estudo_biblico',
        label: 'Estudo Bíblico',
        subtitle: 'Ensino participativo',
        color: '#6db8a0',
        bgActive: 'rgba(109,184,160,0.09)',
        groups: [
          { id: 'estudo_inventio', label: 'Invenção · Inventio' },
          { id: 'estudo_dispositio', label: 'Disposição · Dispositio' },
          { id: 'estudo_elocutio', label: 'Elocução · Elocutio' },
          { id: 'estudo_memoria', label: 'Memória · Memoria' },
          { id: 'estudo_pronuntiatio', label: 'Entrega · Pronuntiatio' },
        ],
      },
      {
        id: 'devocional',
        label: 'Devocional',
        subtitle: 'Meditação pastoral',
        color: '#c9a66b',
        bgActive: 'rgba(201,166,107,0.09)',
        groups: [
          { id: 'devocional_inventio', label: 'Invenção · Inventio' },
          { id: 'devocional_dispositio', label: 'Disposição · Dispositio' },
          { id: 'devocional_elocutio', label: 'Elocução · Elocutio' },
          { id: 'devocional_memoria', label: 'Memória · Memoria' },
          { id: 'devocional_pronuntiatio', label: 'Entrega · Pronuntiatio' },
        ],
      },
    ],
  },
  {
    id: 'ferramentas', roman: 'III', label: 'Ferramentas',
    color: '#9b9488', bgActive: 'rgba(155,148,136,0.08)',
    modes: [
      {
        id: 'ferramentas_biblioteca',
        label: 'Pesquisa',
        subtitle: 'Biblioteca e assistente',
        color: '#9b9488',
        bgActive: 'rgba(155,148,136,0.08)',
        groups: TOOL_AREAS.map(area => ({ id: area.slug, label: area.shortTitle })),
      },
    ],
  },
  {
    id: 'colagens', roman: 'IV', label: 'Colagens',
    color: '#9b7ec8', bgActive: 'rgba(155,126,200,0.08)',
    modes: [
      {
        id: 'colagens_mural',
        label: 'Mural',
        subtitle: 'Citações, notas e insights',
        color: '#9b7ec8',
        bgActive: 'rgba(155,126,200,0.08)',
        groups: [{ id: 'colagens', label: 'Rede de apoio' }],
      },
    ],
  },
]

const NAV_GROUP_IDS = new Set(NAV_PHASES.flatMap(phase => phase.modes.flatMap(mode => mode.groups.map(group => group.id))))

// ── Helpers de navegação ───────────────────────────────────────────────────

function getPhaseFor(slug: string): PhaseId {
  if (slug === 'colagens') return 'colagens'
  if (isToolSlug(slug)) return 'ferramentas'
  if (isSynthesisSlug(slug)) return 'interpretar'
  const sec = getSectionBySlug(slug)
  if (sec?.phase) return sec.phase
  return sec?.module === 'inventio' ? 'interpretar' : 'comunicar'
}

function getGroupFor(slug: string): string | undefined {
  if (slug === 'colagens') return 'colagens'
  if (isToolSlug(slug)) return slug
  if (isSynthesisSlug(slug)) return getSynthesisBySlug(slug)?.groupId
  return getSectionBySlug(slug)?.group
}

function getCanonFor(slug: string): string | undefined {
  const groupId = getGroupFor(slug)
  if (!groupId) return undefined
  for (const phase of NAV_PHASES) {
    for (const mode of phase.modes) {
      if (mode.groups.some(g => g.id === groupId)) return mode.id
    }
  }
  return undefined
}

function statusDot(status: 'empty' | 'draft' | 'reviewed' | undefined): string {
  if (!status || status === 'empty') return 'var(--border)'
  if (status === 'draft') return 'var(--accent)'
  return 'var(--success)'
}

function toolProgress(groupId: string): { done: number; total: number } {
  if (groupId === 'colagens') return { done: 0, total: 1 }
  return isToolSlug(groupId) ? { done: 0, total: 1 } : { done: 0, total: 0 }
}

// ── Componente principal ────────────────────────────────────────────────────

export default function WorkspaceClient({ user, project, initialSections }: Props) {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [activeSlug, setActiveSlug] = useState('contexto_historico')
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => new Set(['interpretar', 'ferramentas']))
  const [expandedCanons, setExpandedCanons] = useState<Set<string>>(() => new Set(['interpretar_inventio', 'sermao', 'ferramentas_biblioteca']))
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(['contextual']))
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  const activeDef = getSectionBySlug(activeSlug)
  const activeTool = getToolAreaBySlug(activeSlug)
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
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleCanon(id: string) {
    setExpandedCanons(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function navigate(slug: string) {
    setExpandedPhases(prev => new Set([...prev, getPhaseFor(slug)]))
    const c = getCanonFor(slug)
    if (c) setExpandedCanons(prev => new Set([...prev, c]))
    const g = getGroupFor(slug)
    if (g) setExpandedGroups(prev => new Set([...prev, g]))
    setActiveSlug(slug)
  }

  function groupProgress(groupId: string) {
    if (isToolSlug(groupId)) return toolProgress(groupId)
    const gs = getSectionsByGroup(groupId)
    return {
      total: gs.length,
      done: gs.filter(sd => {
        const s = sections.find(sec => sec.slug === sd.slug)
        return s?.status === 'draft' || s?.status === 'reviewed'
      }).length,
    }
  }

  const navigableSections = WORKSPACE_SECTIONS.filter(sd => NAV_GROUP_IDS.has(sd.group))
  const totalSecs = navigableSections.length
  const doneSecs = navigableSections.filter(sd => {
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
        padding: '0 1rem 0 0.75rem',
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
          width: '176px', flexShrink: 0,
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          paddingBottom: '2.5rem',
        }}>
          {NAV_PHASES.map((phase, phaseIdx) => {
            const phaseOpen = expandedPhases.has(phase.id)

            return (
              <div key={phase.id}>

                {/* Phase header */}
                <button
                  onClick={() => togglePhase(phase.id)}
                  style={{
                    width: '100%', border: 'none', cursor: 'pointer',
                    background: 'transparent', textAlign: 'left',
                    padding: phaseIdx === 0 ? '0.9rem 0.75rem 0.5rem' : '0.75rem 0.75rem 0.5rem',
                    borderTop: phaseIdx > 0 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.56rem', fontWeight: '800', color: phase.color, opacity: 0.5, letterSpacing: '0.08em' }}>
                        {phase.roman}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: phase.color, letterSpacing: '-0.01em' }}>
                        {phase.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', opacity: 0.55 }}>
                      {phaseOpen ? '▾' : '▸'}
                    </span>
                  </div>
                </button>

                {/* Modes */}
                {phaseOpen && (
                  <div style={{ paddingBottom: '0.4rem' }}>
                    {phase.modes.map((mode, modeIdx) => {
                      const modeOpen = expandedCanons.has(mode.id)

                      return (
                        <div key={mode.id}>

                          {/* Mode header */}
                          <button
                            onClick={() => toggleCanon(mode.id)}
                            style={{
                              width: '100%', border: 'none', cursor: 'pointer',
                              background: 'transparent', textAlign: 'left',
                              padding: '0.4rem 0.6rem 0.35rem 0.8rem',
                              borderTop: modeIdx > 0 ? '1px solid var(--border-subtle)' : 'none',
                              display: 'flex', alignItems: 'flex-start', gap: '0.3rem',
                            }}
                          >
                            <span style={{ fontSize: '0.48rem', color: mode.color, opacity: 0.75, flexShrink: 0, marginTop: '0.22rem' }}>
                              {modeOpen ? '▾' : '▸'}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: '0.74rem', fontWeight: '600',
                                color: mode.color, lineHeight: '1.2',
                              }}>
                                {mode.label}
                              </div>
                              <div style={{
                                fontSize: '0.59rem', color: 'var(--text-muted)',
                                fontStyle: 'italic', lineHeight: '1.2', marginTop: '0.08rem',
                              }}>
                                {mode.subtitle}
                              </div>
                            </div>
                          </button>

                          {/* Groups */}
                          {modeOpen && (
                            <div style={{ paddingBottom: '0.2rem' }}>
                              {mode.groups.map(group => {
                                const groupOpen = expandedGroups.has(group.id)
                                const isUtilityGroup = isToolSlug(group.id) || group.id === 'colagens'
                                const secs = isUtilityGroup ? [] : getSectionsByGroup(group.id)
                                if (secs.length === 0 && !isUtilityGroup) return null
                                const { done, total } = groupProgress(group.id)
                                const tool = getToolAreaBySlug(group.id)

                                return (
                                  <div key={group.id}>

                                    {/* Group toggle */}
                                    <button
                                      onClick={() => isUtilityGroup ? navigate(tool?.slug ?? group.id) : toggleGroup(group.id)}
                                      style={{
                                        width: '100%', background: 'transparent', border: 'none',
                                        padding: '0.3rem 0.55rem 0.28rem 1.1rem',
                                        display: 'flex', alignItems: 'center', gap: '0.28rem',
                                        cursor: 'pointer', textAlign: 'left',
                                      }}
                                    >
                                      <span style={{ fontSize: '0.46rem', color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0 }}>
                                        {isUtilityGroup ? '•' : groupOpen ? '▾' : '▸'}
                                      </span>
                                      <span style={{
                                        fontSize: '0.67rem', fontWeight: '500',
                                        color: activeSlug === (tool?.slug ?? group.id) ? mode.color : 'var(--text-secondary)', flex: 1, lineHeight: '1.3',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                      }}>
                                        {group.label}
                                      </span>
                                      {!isUtilityGroup && done > 0 && (
                                        <span style={{
                                          fontSize: '0.56rem', flexShrink: 0,
                                          color: done === total ? 'var(--success)' : 'var(--text-muted)',
                                          opacity: 0.75,
                                        }}>
                                          {done}/{total}
                                        </span>
                                      )}
                                    </button>

                                    {isUtilityGroup && activeSlug === (tool?.slug ?? group.id) && (
                                      <div style={{
                                        margin: '0.1rem 0.7rem 0.3rem 1.55rem',
                                        height: '2px',
                                        background: mode.color,
                                        borderRadius: '2px',
                                        opacity: 0.8,
                                      }} />
                                    )}

                                    {/* Section items */}
                                    {!isUtilityGroup && groupOpen && secs.map(sd => {
                                      const sec = sections.find(s => s.slug === sd.slug)
                                      const isActive = sd.slug === activeSlug
                                      return (
                                        <button
                                          key={sd.slug}
                                          onClick={() => navigate(sd.slug)}
                                          style={{
                                            width: '100%', border: 'none', fontFamily: 'inherit',
                                            background: isActive ? mode.bgActive : 'transparent',
                                            borderLeft: `2px solid ${isActive ? mode.color : 'transparent'}`,
                                            padding: '0.24rem 0.4rem 0.24rem 1.3rem',
                                            display: 'flex', alignItems: 'center', gap: '0.36rem',
                                            cursor: 'pointer', textAlign: 'left',
                                            transition: 'background 0.1s',
                                          }}
                                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                        >
                                          <span style={{
                                            width: '4px', height: '4px', borderRadius: '50%', flexShrink: 0,
                                            background: statusDot(sec?.status),
                                            opacity: isActive ? 1 : 0.5,
                                          }} />
                                          <span style={{
                                            fontSize: '0.71rem', lineHeight: '1.3',
                                            color: isActive ? mode.color : 'var(--text-secondary)',
                                            fontWeight: isActive ? '500' : '400',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                          }}>
                                            {sd.shortTitle}
                                          </span>
                                        </button>
                                      )
                                    })}

                                    {/* Synthesis item */}
                                    {!isUtilityGroup && groupOpen && (() => {
                                      const syn = SYNTHESIS_DEFS[group.id]
                                      if (!syn) return null
                                      const isSynActive = activeSlug === syn.slug
                                      return (
                                        <button
                                          onClick={() => navigate(syn.slug)}
                                          style={{
                                            width: '100%', border: 'none', fontFamily: 'inherit',
                                            background: isSynActive ? mode.bgActive : 'transparent',
                                            borderLeft: `2px solid ${isSynActive ? mode.color : 'var(--border-subtle)'}`,
                                            padding: '0.24rem 0.4rem 0.24rem 1.3rem',
                                            display: 'flex', alignItems: 'center', gap: '0.36rem',
                                            cursor: 'pointer', textAlign: 'left',
                                            marginTop: '0.15rem',
                                            transition: 'background 0.1s',
                                          }}
                                          onMouseEnter={e => { if (!isSynActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                          onMouseLeave={e => { if (!isSynActive) e.currentTarget.style.background = 'transparent' }}
                                        >
                                          <span style={{
                                            width: '4px', height: '2px', borderRadius: '1px', flexShrink: 0,
                                            background: isSynActive ? mode.color : 'var(--border)',
                                          }} />
                                          <span style={{
                                            fontSize: '0.69rem', lineHeight: '1.3',
                                            color: isSynActive ? mode.color : 'var(--text-muted)',
                                            fontStyle: 'italic', flex: 1,
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                          }}>
                                            {syn.shortTitle}
                                          </span>
                                          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', opacity: 0.45, flexShrink: 0 }}>→</span>
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
                  </div>
                )}

              </div>
            )
          })}
        </nav>

        {/* ── Content + AI panel ───────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', overflow: 'hidden' }}>

          {/* Reading area */}
          <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', background: 'var(--background)' }}>
            {activeSlug === 'colagens' ? (
              <CollagesWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : isToolSlug(activeSlug) ? (
              <ToolsWorkspace
                key={activeSlug}
                project={project}
                activeSlug={activeSlug}
                onNavigate={navigate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : activeSlug === 'texto_original' ? (
              <OriginalTextWorkspace
                key={activeSlug}
                project={project}
                userId={user.id}
                existingSection={activeSection}
                onUpdate={handleSectionUpdate}
                onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
              />
            ) : activeDef ? (
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

          {/* AI panel — flex sibling so content is never obscured */}
          <aside style={{
            flexShrink: 0,
            width: aiOpen ? '308px' : '0',
            overflow: 'hidden',
            borderLeft: aiOpen ? '1px solid var(--border-subtle)' : 'none',
            background: 'var(--surface)',
            display: 'flex', flexDirection: 'column',
            transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{ width: '308px', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <AIPanel
                project={project}
                activeSlug={activeSlug}
                activeTitle={activeSlug === 'colagens' ? 'Colagens' : activeTool?.title ?? activeDef?.title ?? ''}
                context={aiPrompt}
                onClearContext={() => setAiPrompt('')}
              />
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
