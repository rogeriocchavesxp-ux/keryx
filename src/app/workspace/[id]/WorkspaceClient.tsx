'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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
import SermonBuilderWorkspace from './SermonBuilderWorkspace'
import LiveReferencePanel from './LiveReferencePanel'
import AIPanel from './AIPanel'

interface Props {
  user: User
  project: Project
  initialSections: Section[]
}

// ── Tipos de navegação ─────────────────────────────────────────────────────

type PhaseId = 'preparar' | 'investigar' | 'comunicar' | 'ferramentas'

interface NavGroup { id: string; label: string }
interface NavMode { id: string; label: string; subtitle: string; color: string; bgActive: string; groups: NavGroup[] }
interface NavPhase { id: PhaseId; roman: string; label: string; color: string; bgActive: string; modes: NavMode[] }

const NAV_PHASES: NavPhase[] = [
  {
    id: 'preparar', roman: 'I', label: 'Preparar',
    color: '#c9a66b', bgActive: 'rgba(201,166,107,0.08)',
    modes: [
      {
        id: 'preparar_imersao',
        label: 'Imersão',
        subtitle: 'Piedade e assimilação',
        color: '#c9a66b',
        bgActive: 'rgba(201,166,107,0.08)',
        groups: [
          { id: 'preparar_espiritual', label: 'Preparação Espiritual' },
          { id: 'preparar_assimilacao', label: 'Leia e Assimile' },
          { id: 'preparar_impressoes', label: 'Primeiras Impressões' },
          { id: 'preparar_visao_geral', label: 'Visão Geral' },
        ],
      },
    ],
  },
  {
    id: 'investigar', roman: 'II', label: 'Investigar',
    color: 'var(--accent)', bgActive: 'rgba(184,146,42,0.08)',
    modes: [
      {
        id: 'interpretar_inventio',
        label: 'Exegese',
        subtitle: 'Descobrir o significado',
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
    id: 'comunicar', roman: 'III', label: 'Produzir',
    color: 'var(--ai)', bgActive: 'rgba(124,156,191,0.08)',
    modes: [
      {
        id: 'sermao',
        label: 'Sermão',
        subtitle: 'Proclamação pública',
        color: 'var(--ai)',
        bgActive: 'rgba(124,156,191,0.08)',
        groups: [
          { id: 'sermao_dispositio',   label: 'Estrutura' },
          { id: 'sermao_elocutio',     label: 'Linguagem' },
          { id: 'sermao_memoria',      label: 'Internalização' },
          { id: 'sermao_pronuntiatio', label: 'Execução da Pregação' },
        ],
      },
      {
        id: 'estudo_biblico',
        label: 'Estudo Bíblico',
        subtitle: 'Ensino participativo',
        color: '#6db8a0',
        bgActive: 'rgba(109,184,160,0.09)',
        groups: [
          { id: 'estudo_dispositio',   label: 'Estrutura' },
          { id: 'estudo_elocutio',     label: 'Linguagem' },
          { id: 'estudo_memoria',      label: 'Internalização' },
          { id: 'estudo_pronuntiatio', label: 'Execução da Pregação' },
        ],
      },
      {
        id: 'devocional',
        label: 'Devocional',
        subtitle: 'Fluxo meditativo e pastoral',
        color: '#c9a66b',
        bgActive: 'rgba(201,166,107,0.09)',
        groups: [
          { id: 'devocional_dispositio',   label: 'Estrutura' },
          { id: 'devocional_elocutio',     label: 'Linguagem' },
          { id: 'devocional_memoria',      label: 'Internalização' },
          { id: 'devocional_pronuntiatio', label: 'Execução da Pregação' },
        ],
      },
    ],
  },
  {
    id: 'ferramentas', roman: 'IV', label: 'Ferramentas',
    color: '#9b9488', bgActive: 'rgba(155,148,136,0.08)',
    modes: [
      {
        id: 'ferramentas_biblioteca',
        label: 'Pesquisa',
        subtitle: 'Biblioteca e assistente',
        color: '#9b9488',
        bgActive: 'rgba(155,148,136,0.08)',
        groups: [
          ...TOOL_AREAS.map(area => ({ id: area.slug, label: area.shortTitle })),
          { id: 'colagens', label: 'Colagens' },
        ],
      },
    ],
  },
]

const NAV_GROUP_IDS = new Set(NAV_PHASES.flatMap(phase => phase.modes.flatMap(mode => mode.groups.map(group => group.id))))

const PHASE_ICONS: Record<PhaseId, string> = {
  preparar:    '✦',
  investigar:  '◎',
  comunicar:   '▷',
  ferramentas: '▤',
}

const GROUP_SUBTITLES: Record<string, string> = {
  // Investigar
  contextual: 'Histórico, literário e canônico',
  textual:    'Texto original e estrutura',
  teologico:  'Mensagem e implicações',
  // Preparar
  preparar_espiritual:  'Oração e dependência',
  preparar_assimilacao: 'Contato direto com o texto',
  preparar_impressoes:  'Notas rápidas e perguntas',
  preparar_visao_geral: 'Tema, estrutura e clímax',
  // Comunicar — Sermão
  sermao_dispositio:    'Organização e estrutura',
  sermao_elocutio:      'Forma de comunicação',
  sermao_memoria:       'Memorização e preparo',
  sermao_pronuntiatio:  'Entrega e performance',
  // Comunicar — Estudo Bíblico
  estudo_dispositio:    'Organização e estrutura',
  estudo_elocutio:      'Forma de comunicação',
  estudo_memoria:       'Memorização e preparo',
  estudo_pronuntiatio:  'Entrega e performance',
  // Comunicar — Devocional
  devocional_dispositio:    'Organização e estrutura',
  devocional_elocutio:      'Forma de comunicação',
  devocional_memoria:       'Memorização e preparo',
  devocional_pronuntiatio:  'Entrega e performance',
  // Colagens
  colagens: 'Citações, notas e insights',
}

const MODE_ICONS: Record<string, string> = {
  sermao:         '✦',
  estudo_biblico: '◈',
  devocional:     '◌',
}

// ── Helpers de navegação ───────────────────────────────────────────────────

function getPhaseFor(slug: string): PhaseId {
  if (slug === 'colagens') return 'ferramentas'
  if (isToolSlug(slug)) return 'ferramentas'
  if (isSynthesisSlug(slug)) return 'investigar'
  const sec = getSectionBySlug(slug)
  if (sec?.phase === 'preparar') return 'preparar'
  if (sec?.phase === 'comunicar') return 'comunicar'
  if (sec?.communicationMode) return 'comunicar'
  if (sec?.module === 'inventio') return 'investigar'
  if (sec?.module === 'dispositio') return 'comunicar'
  if (sec?.module === 'elocutio') return 'comunicar'
  if (sec?.module === 'memoria') return 'comunicar'
  if (sec?.module === 'pronuntiatio') return 'comunicar'
  return 'investigar'
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

// ── Resize handle ─────────────────────────────────────────────────────────

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '4px', flexShrink: 0, cursor: 'col-resize', zIndex: 10,
        background: hover ? 'var(--border)' : 'var(--border-subtle)',
        transition: 'background 0.12s',
      }}
    />
  )
}

// ── Componente principal ────────────────────────────────────────────────────

export default function WorkspaceClient({ user, project, initialSections }: Props) {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [activeSlug, setActiveSlug] = useState('preparacao_espiritual')
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => new Set(['preparar', 'investigar', 'ferramentas']))
  const [expandedCanons, setExpandedCanons] = useState<Set<string>>(() => new Set(['preparar_imersao', 'interpretar_inventio', 'ferramentas_biblioteca']))
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(['preparar_espiritual']))
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')

  // Panel layout
  const [sidebarWidth, setSidebarWidth] = useState(210)
  const [referenceWidth, setReferenceWidth] = useState(280)
  const [aiWidth, setAiWidth] = useState(308)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [referenceCollapsed, setReferenceCollapsed] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [sideBySide, setSideBySide] = useState(false)

  const sidebarWidthRef = useRef(210)
  const referenceWidthRef = useRef(280)
  const aiWidthRef = useRef(308)
  sidebarWidthRef.current = sidebarWidth
  referenceWidthRef.current = referenceWidth
  aiWidthRef.current = aiWidth

  useEffect(() => {
    const sw = localStorage.getItem('keryx_sidebar_w')
    const rw = localStorage.getItem('keryx_ref_w')
    const aw = localStorage.getItem('keryx_ai_w')
    const sc = localStorage.getItem('keryx_sidebar_c')
    if (sw) setSidebarWidth(Number(sw))
    if (rw) setReferenceWidth(Number(rw))
    if (aw) setAiWidth(Number(aw))
    if (sc) setSidebarCollapsed(sc === '1')
  }, [])

  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = sidebarWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(120, Math.min(360, startW + ev.clientX - startX))
      setSidebarWidth(w); sidebarWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('keryx_sidebar_w', String(sidebarWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

  const startReferenceResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = referenceWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(180, Math.min(520, startW + ev.clientX - startX))
      setReferenceWidth(w); referenceWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('keryx_ref_w', String(referenceWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

  const startAiResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX; const startW = aiWidthRef.current
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(240, Math.min(560, startW - (ev.clientX - startX)))
      setAiWidth(w); aiWidthRef.current = w
    }
    const onUp = () => {
      localStorage.setItem('keryx_ai_w', String(aiWidthRef.current))
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }, [])

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
    if (groupId === 'colagens') return toolProgress(groupId)
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
          onClick={() => setSideBySide(o => !o)}
          title="Mostrar exegese e trabalho lado a lado"
          style={{
            marginLeft: '0.5rem', flexShrink: 0,
            background: sideBySide ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: `1px solid ${sideBySide ? 'var(--border)' : 'var(--border-subtle)'}`,
            color: sideBySide ? 'var(--text-secondary)' : 'var(--text-muted)',
            borderRadius: '5px', padding: '0.2rem 0.55rem',
            fontSize: '0.73rem', fontWeight: '700', letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!sideBySide) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
          onMouseLeave={e => { if (!sideBySide) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
        >
          ⊞ Lado a Lado
        </button>

        <button
          onClick={() => setFocusMode(o => !o)}
          style={{
            marginLeft: '0.5rem', flexShrink: 0,
            background: focusMode ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: `1px solid ${focusMode ? 'var(--border)' : 'var(--border-subtle)'}`,
            color: focusMode ? 'var(--text-secondary)' : 'var(--text-muted)',
            borderRadius: '5px', padding: '0.2rem 0.55rem',
            fontSize: '0.73rem', fontWeight: '700', letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          {focusMode ? 'Sair' : 'Foco'}
        </button>

        <button
          onClick={() => setAiOpen(o => !o)}
          style={{
            marginLeft: '0.5rem', flexShrink: 0,
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
          width: focusMode ? '0' : sidebarCollapsed ? '40px' : `${sidebarWidth}px`,
          flexShrink: 0,
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--surface)',
          overflowY: sidebarCollapsed ? 'hidden' : 'auto',
          display: 'flex', flexDirection: 'column',
          paddingBottom: '2.5rem',
          transition: 'width 0.18s ease',
        }}>
          {sidebarCollapsed ? (
            /* ── Sidebar collapsed ────────────────────────────────── */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', paddingTop: '0.45rem' }}>
              <button
                onClick={() => { setSidebarCollapsed(false); localStorage.setItem('keryx_sidebar_c', '0') }}
                title="Expandir menu"
                style={{ width: '32px', height: '26px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.95rem', borderRadius: '3px', fontFamily: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >›</button>
              {NAV_PHASES.map(ph => (
                <button key={ph.id} title={ph.label}
                  onClick={() => { setSidebarCollapsed(false); localStorage.setItem('keryx_sidebar_c', '0'); setExpandedPhases(prev => new Set([...prev, ph.id])) }}
                  style={{ width: '32px', height: '26px', background: 'transparent', border: 'none', cursor: 'pointer', color: ph.color, fontSize: '0.64rem', fontWeight: 900, borderRadius: '3px', fontFamily: 'inherit' }}
                >{ph.roman}</button>
              ))}
            </div>
          ) : (
            /* ── Sidebar expanded ────────────────────────────────── */
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.3rem 0.4rem 0', flexShrink: 0 }}>
                <button
                  onClick={() => { setSidebarCollapsed(true); localStorage.setItem('keryx_sidebar_c', '1') }}
                  title="Recolher menu"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '0.1rem 0.3rem', borderRadius: '3px', fontFamily: 'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >‹</button>
              </div>

              {NAV_PHASES.map((phase, phaseIdx) => {
                const phaseOpen  = expandedPhases.has(phase.id)
                const singleMode = phase.modes.length === 1

                return (
                  <div key={phase.id} style={{ marginBottom: phaseOpen ? '0.2rem' : 0 }}>

                    {/* ── Phase header ──────────────────────────── */}
                    <button
                      onClick={() => togglePhase(phase.id)}
                      style={{
                        width: '100%', border: 'none', cursor: 'pointer',
                        background: 'transparent', textAlign: 'left', fontFamily: 'inherit',
                        padding: phaseIdx === 0 ? '1rem 0.75rem 0.45rem' : '0.75rem 0.75rem 0.45rem',
                        borderTop: phaseIdx > 0 ? '1px solid var(--border-subtle)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.38rem' }}>
                        <span style={{ fontSize: '0.65rem', color: phase.color, opacity: phaseOpen ? 0.75 : 0.4, flexShrink: 0, lineHeight: 1 }}>
                          {PHASE_ICONS[phase.id]}
                        </span>
                        <span style={{
                          flex: 1,
                          fontSize: '0.72rem', fontWeight: 900,
                          color: phaseOpen ? phase.color : `${phase.color}99`,
                          letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1,
                        }}>
                          {phase.roman}. {phase.label}
                        </span>
                        <span style={{ fontSize: '0.42rem', color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0 }}>
                          {phaseOpen ? '▾' : '▸'}
                        </span>
                      </div>
                    </button>

                    {/* ── Phase body ────────────────────────────── */}
                    {phaseOpen && (
                      <div style={{ paddingBottom: '0.5rem' }}>
                        {phase.modes.map((mode, modeIdx) => {
                          const modeOpen = singleMode || expandedCanons.has(mode.id)

                          return (
                            <div key={mode.id}>

                              {/* Mode header — only for multi-mode phases (Produzir) */}
                              {!singleMode && (
                                <button
                                  onClick={() => toggleCanon(mode.id)}
                                  style={{
                                    width: '100%', border: 'none', cursor: 'pointer',
                                    background: modeOpen ? `${mode.bgActive}` : 'transparent',
                                    textAlign: 'left', fontFamily: 'inherit',
                                    padding: '0.42rem 0.65rem 0.38rem 0.75rem',
                                    borderTop: modeIdx > 0 ? '1px solid var(--border-subtle)' : 'none',
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                  }}
                                >
                                  <span style={{ fontSize: '0.56rem', color: mode.color, opacity: 0.7, flexShrink: 0, lineHeight: 1 }}>
                                    {MODE_ICONS[mode.id] ?? '◈'}
                                  </span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: mode.color, lineHeight: 1.2 }}>
                                      {mode.label}
                                    </div>
                                    {!modeOpen && (
                                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.2, marginTop: '0.05rem' }}>
                                        {mode.subtitle}
                                      </div>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '0.42rem', color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0 }}>
                                    {modeOpen ? '▾' : '▸'}
                                  </span>
                                </button>
                              )}

                              {/* Groups */}
                              {modeOpen && (
                                <div style={{ paddingBottom: '0.15rem' }}>
                                  {mode.groups.map((group, groupIdx) => {
                                    const groupOpen      = expandedGroups.has(group.id)
                                    const isUtilityGroup = isToolSlug(group.id) || group.id === 'colagens'
                                    const secs           = isUtilityGroup ? [] : getSectionsByGroup(group.id)
                                    if (secs.length === 0 && !isUtilityGroup) return null
                                    const isSingleSection = !isUtilityGroup && secs.length === 1 && !SYNTHESIS_DEFS[group.id]
                                    const isDirect        = isUtilityGroup || isSingleSection
                                    const tool            = getToolAreaBySlug(group.id)
                                    const directSlug      = isSingleSection ? secs[0].slug : (tool?.slug ?? group.id)
                                    const directLabel     = isSingleSection ? secs[0].shortTitle : group.label
                                    const { done, total } = groupProgress(group.id)
                                    const syn        = !isDirect ? SYNTHESIS_DEFS[group.id] : undefined
                                    const isActive   = isDirect && activeSlug === directSlug
                                    const isExpanded = !isDirect && groupOpen
                                    const highlight  = isActive || isExpanded
                                    const groupTitle = isDirect ? directLabel : group.label
                                    const groupSub   = GROUP_SUBTITLES[group.id]
                                      ?? (isToolSlug(group.id) ? getToolAreaBySlug(group.id)?.subtitle : undefined)
                                      ?? ''

                                    return (
                                      <div key={group.id} style={{ marginBottom: groupOpen ? '0.45rem' : 0 }}>

                                        {/* ── Group header — padrão único para todas as fases ── */}
                                        <button
                                          onClick={() => isDirect ? navigate(directSlug) : toggleGroup(group.id)}
                                          style={{
                                            width: '100%', border: 'none', cursor: 'pointer',
                                            background: isActive ? mode.bgActive : 'transparent',
                                            borderLeft: `2px solid ${isActive ? mode.color : 'transparent'}`,
                                            textAlign: 'left', fontFamily: 'inherit',
                                            padding: '0.48rem 0.6rem 0.4rem 0.65rem',
                                            display: 'flex', alignItems: 'flex-start', gap: '0.45rem',
                                            transition: 'background 0.12s',
                                          }}
                                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                        >
                                          {/* Circled number */}
                                          <span style={{
                                            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                                            border: `1.5px solid ${highlight ? mode.color : 'var(--border)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.6rem', fontWeight: 900, lineHeight: 1,
                                            color: highlight ? mode.color : 'var(--text-muted)',
                                            marginTop: '0.08rem',
                                            transition: 'border-color 0.15s, color 0.15s',
                                          }}>
                                            {groupIdx + 1}
                                          </span>

                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                              fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.05em',
                                              textTransform: 'uppercase', lineHeight: 1.25,
                                              color: highlight ? mode.color : 'var(--text-secondary)',
                                              transition: 'color 0.15s',
                                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                              {groupTitle}
                                            </div>
                                            {groupSub && (
                                              <div style={{ fontSize: '0.56rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.08rem', lineHeight: 1.25 }}>
                                                {groupSub}
                                              </div>
                                            )}
                                          </div>

                                          {/* Indicador direito */}
                                          {isActive && (
                                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: mode.color, flexShrink: 0, marginTop: '0.3rem' }} />
                                          )}
                                          {!isDirect && done > 0 && (
                                            <span style={{
                                              fontSize: '0.58rem', flexShrink: 0, fontWeight: 700, marginTop: '0.1rem',
                                              color: done === total ? 'var(--success)' : 'var(--accent)',
                                            }}>
                                              {done === total ? '✓' : `${done}/${total}`}
                                            </span>
                                          )}
                                          {!isDirect && (
                                            <span style={{ fontSize: '0.42rem', color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0, marginTop: '0.15rem' }}>
                                              {groupOpen ? '▾' : '▸'}
                                            </span>
                                          )}
                                        </button>

                                        {/* ── Section list (with vertical line) ── */}
                                        {!isDirect && groupOpen && (
                                          <div style={{
                                            marginLeft: '1.45rem',
                                            borderLeft: `1px solid var(--border-subtle)`,
                                            marginBottom: '0.15rem',
                                          }}>
                                            {secs.map((sd, secIdx) => {
                                              const sec      = sections.find(s => s.slug === sd.slug)
                                              const isActive = sd.slug === activeSlug
                                              const dot      = statusDot(sec?.status)
                                              return (
                                                <button
                                                  key={sd.slug}
                                                  onClick={() => navigate(sd.slug)}
                                                  style={{
                                                    width: '100%', border: 'none', fontFamily: 'inherit',
                                                    background: isActive ? mode.bgActive : 'transparent',
                                                    borderLeft: `2px solid ${isActive ? mode.color : 'transparent'}`,
                                                    padding: '0.25rem 0.4rem 0.25rem 0.52rem',
                                                    display: 'flex', alignItems: 'center', gap: '0.32rem',
                                                    cursor: 'pointer', textAlign: 'left',
                                                    marginLeft: '-1px',
                                                    transition: 'background 0.1s',
                                                  }}
                                                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
                                                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                                >
                                                  <span style={{
                                                    fontSize: '0.6rem', color: 'var(--text-muted)',
                                                    flexShrink: 0, width: '14px', textAlign: 'right', lineHeight: 1,
                                                    fontWeight: isActive ? 700 : 400,
                                                  }}>
                                                    {secIdx + 1}.
                                                  </span>
                                                  <span style={{
                                                    flex: 1, fontSize: '0.7rem', lineHeight: 1.35,
                                                    color: isActive ? mode.color : 'var(--text-secondary)',
                                                    fontWeight: isActive ? 600 : 400,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                  }}>
                                                    {sd.shortTitle}
                                                  </span>
                                                  <span style={{
                                                    width: '5px', height: '5px', borderRadius: '50%',
                                                    background: dot, flexShrink: 0,
                                                    opacity: isActive ? 1 : 0.6,
                                                  }} />
                                                </button>
                                              )
                                            })}

                                            {/* Synthesis */}
                                            {syn && (() => {
                                              const isSynActive = activeSlug === syn.slug
                                              return (
                                                <button
                                                  onClick={() => navigate(syn.slug)}
                                                  style={{
                                                    width: '100%', border: 'none', fontFamily: 'inherit',
                                                    background: isSynActive ? mode.bgActive : 'transparent',
                                                    borderLeft: `2px solid ${isSynActive ? mode.color : 'transparent'}`,
                                                    padding: '0.28rem 0.4rem 0.28rem 0.52rem',
                                                    display: 'flex', alignItems: 'center', gap: '0.32rem',
                                                    cursor: 'pointer', textAlign: 'left',
                                                    marginLeft: '-1px', marginTop: '0.12rem',
                                                    borderTop: '1px solid var(--border-subtle)',
                                                    transition: 'background 0.1s',
                                                  }}
                                                  onMouseEnter={e => { if (!isSynActive) e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
                                                  onMouseLeave={e => { if (!isSynActive) e.currentTarget.style.background = 'transparent' }}
                                                >
                                                  <span style={{ fontSize: '0.62rem', color: isSynActive ? mode.color : 'var(--text-muted)', flexShrink: 0, lineHeight: 1 }}>→</span>
                                                  <span style={{
                                                    flex: 1, fontSize: '0.68rem', lineHeight: 1.3,
                                                    color: isSynActive ? mode.color : 'var(--text-muted)',
                                                    fontStyle: 'italic',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                  }}>
                                                    {syn.shortTitle}
                                                  </span>
                                                </button>
                                              )
                                            })()}
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
                      </div>
                    )}

                  </div>
                )
              })}
            </>
          )}
        </nav>
        {!focusMode && !sidebarCollapsed && <ResizeHandle onMouseDown={startSidebarResize} />}

        {/* ── Content + AI panel ───────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', overflow: 'hidden' }}>
          {sideBySide && !focusMode && (
            <>
              {referenceCollapsed ? (
                <div
                  onClick={() => setReferenceCollapsed(false)}
                  title="Referência Viva — expandir"
                  style={{
                    width: '28px', flexShrink: 0, cursor: 'pointer',
                    borderRight: '1px solid var(--border-subtle)',
                    background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span style={{
                    writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                    fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.09em',
                    textTransform: 'uppercase', color: 'var(--text-muted)',
                  }}>Referência</span>
                </div>
              ) : (
                <>
                  <div style={{ width: `${referenceWidth}px`, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.3rem 0.4rem', flexShrink: 0, borderBottom: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => setReferenceCollapsed(true)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '3px' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      >Recolher ‹</button>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <LiveReferencePanel
                        savedSections={sections}
                        onAskAI={prompt => { setAiPrompt(prompt); setAiOpen(true) }}
                      />
                    </div>
                  </div>
                  <ResizeHandle onMouseDown={startReferenceResize} />
                </>
              )}
            </>
          )}

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
            ) : activeSlug === 'sermao_dispositio' ? (
              <SermonBuilderWorkspace
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
          {aiOpen && <ResizeHandle onMouseDown={startAiResize} />}
          <aside style={{
            flexShrink: 0,
            width: aiOpen ? `${aiWidth}px` : '0',
            overflow: 'hidden',
            borderLeft: 'none',
            background: 'var(--surface)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ width: `${aiWidth}px`, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
