'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────

type CommentaryStyle = 'exegetico' | 'pastoral' | 'homiletico' | 'academico'

interface VerseComment {
  verse: number
  verseText: string
  comment: string
  notes: string
}

interface CommentaryContent {
  type: 'commentary'
  style: CommentaryStyle
  chapter: number
  verseStart: number
  verseEnd: number
  verses: VerseComment[]
}

interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (section: Section) => void
  onAskAI: (prompt: string) => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseRef(ref: string): { chapter: number; verseStart: number; verseEnd: number } | null {
  const m = ref.trim().match(/^(\d+)[.:](\d+)(?:-(\d+))?$/)
  if (!m) return null
  const chapter = parseInt(m[1])
  const vs = parseInt(m[2])
  const ve = m[3] ? parseInt(m[3]) : vs
  if (ve < vs) return null
  return { chapter, verseStart: vs, verseEnd: ve }
}

function mkVerses(chapter: number, vs: number, ve: number): VerseComment[] {
  return Array.from({ length: ve - vs + 1 }, (_, i) => ({
    verse: vs + i, verseText: '', comment: '', notes: '',
  }))
}

function reconcile(
  existing: CommentaryContent | null,
  chapter: number, vs: number, ve: number,
): CommentaryContent {
  const byVerse = new Map((existing?.verses ?? []).map(v => [v.verse, v]))
  const verses = Array.from({ length: ve - vs + 1 }, (_, i) => {
    const n = vs + i
    return byVerse.get(n) ?? { verse: n, verseText: '', comment: '', notes: '' }
  })
  return {
    type: 'commentary',
    style: existing?.style ?? 'exegetico',
    chapter, verseStart: vs, verseEnd: ve,
    verses,
  }
}

function hasContent(c: CommentaryContent): boolean {
  return c.verses.some(v => v.comment.trim() || v.notes.trim() || v.verseText.trim())
}

// ── Style config ───────────────────────────────────────────────────────────

interface StyleCfg {
  id: CommentaryStyle
  label: string
  placeholder: string
  prompt: (ref: string, verseText: string, existing: string) => string
}

const STYLES: StyleCfg[] = [
  {
    id: 'exegetico',
    label: 'Exegético',
    placeholder: 'Explicação gramatical, contexto histórico-literário, sentido do texto original, termos técnicos…',
    prompt: (r, t, e) =>
      `Escreva um comentário exegético de ${r}. Analise a gramática (hebraico/grego quando relevante), contexto histórico-literário, defina termos originais significativos, compare traduções e mostre o significado preciso do texto. Perspectiva reformada.${t ? `\n\nTexto: "${t}"` : ''}${e ? `\n\nExpanda/melhore: "${e}"` : ''}`,
  },
  {
    id: 'pastoral',
    label: 'Pastoral',
    placeholder: 'Aplicação ao coração, consolo, confronto, chamada à fé e obediência, cuidado com a alma…',
    prompt: (r, t, e) =>
      `Escreva um comentário pastoral de ${r}. Conecte o texto à experiência humana, mostre como o evangelho fala aqui, ofereça consolo, confronto bíblico e chamada à transformação. Linguagem acessível, pastoralmente sensível.${t ? `\n\nTexto: "${t}"` : ''}${e ? `\n\nExpanda/melhore: "${e}"` : ''}`,
  },
  {
    id: 'homiletico',
    label: 'Homilético',
    placeholder: 'Como proclamar este versículo, ponto sermônico, ideia central, ilustração sugerida…',
    prompt: (r, t, e) =>
      `Escreva um comentário homilético de ${r}. Como este versículo seria pregado? Destaque a ideia central para proclamação, proponha um ponto ou movimento sermônico, sugira ilustração e linguagem para o púlpito.${t ? `\n\nTexto: "${t}"` : ''}${e ? `\n\nExpanda/melhore: "${e}"` : ''}`,
  },
  {
    id: 'academico',
    label: 'Acadêmico',
    placeholder: 'Análise crítica, posições exegéticas, comentaristas, notas técnicas, fontes e bibliografias…',
    prompt: (r, t, e) =>
      `Escreva um comentário acadêmico de ${r}. Analise posições exegéticas principais, cite comentaristas reformados relevantes (Carson, Waltke, Hamilton, Wenham, Kidner), indique fontes técnicas e ofereça análise rigorosa com possíveis divergências interpretativas.${t ? `\n\nTexto: "${t}"` : ''}${e ? `\n\nExpanda/melhore: "${e}"` : ''}`,
  },
]

// ── NoteArea ───────────────────────────────────────────────────────────────

function NoteArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{
      background: 'rgba(196,145,107,0.07)',
      borderRadius: '5px',
      padding: '0.5rem 0.62rem 0.35rem',
      marginTop: '0.25rem',
    }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Observações, referências cruzadas, notas exegéticas, citações de comentaristas, termos originais…"
        autoFocus
        rows={3}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          color: 'var(--text-primary)', fontFamily: 'inherit',
          fontSize: '0.82rem', lineHeight: 1.7,
          resize: 'vertical', outline: 'none', padding: 0,
        }}
      />
    </div>
  )
}

// ── CommentaryWorkspace ────────────────────────────────────────────────────

const COLOR = '#c4916b'

export default function CommentaryWorkspace({ project, userId, existingSection, onUpdate, onAskAI }: Props) {
  const supabase   = createClient()
  const parsed     = parseRef(project.passage_ref)

  // ── Manual range state (if passage_ref unparseable)
  const [manualRange, setManualRange] = useState('')
  const [manualParsed, setManualParsed] = useState<{ chapter: number; verseStart: number; verseEnd: number } | null>(null)

  const effective = parsed ?? manualParsed

  // ── Content state
  const loadContent = useCallback((): CommentaryContent | null => {
    if (!effective) return null
    const c = existingSection?.content as CommentaryContent | null
    if (c?.type === 'commentary') return reconcile(c, effective.chapter, effective.verseStart, effective.verseEnd)
    return reconcile(null, effective.chapter, effective.verseStart, effective.verseEnd)
  }, [existingSection, effective])

  const [content,      setContent]      = useState<CommentaryContent | null>(loadContent)
  const [saving,       setSaving]       = useState(false)
  const [savedAt,      setSavedAt]      = useState<Date | null>(null)
  const [showVerseText, setShowVerseText] = useState(false)
  const [hoveredVerse, setHoveredVerse] = useState<number | null>(null)
  const [openNotes,    setOpenNotes]    = useState<Set<number>>(new Set())

  const contentRef   = useRef(content)
  contentRef.current = content
  const sectionIdRef   = useRef(existingSection?.id)
  sectionIdRef.current = existingSection?.id
  const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (effective && !content) {
      const c = loadContent()
      setContent(c)
    }
  }, [effective, content, loadContent])

  // ── Save
  const performSave = useCallback(async (current: CommentaryContent) => {
    setSaving(true)
    const payload = {
      project_id: project.id,
      user_id:    userId,
      slug:       'comentario_expositivo',
      module:     'dispositio' as const,
      title:      'Comentário Expositivo',
      content:    current as unknown as Record<string, unknown>,
      status:     (hasContent(current) ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
    }
    const id = sectionIdRef.current
    if (id) {
      const { data } = await supabase.from('sections').update(payload).eq('id', id).select().single()
      if (data) onUpdate(data as Section)
    } else {
      const { data } = await supabase.from('sections').insert(payload).select().single()
      if (data) { sectionIdRef.current = (data as Section).id; onUpdate(data as Section) }
    }
    setSaving(false)
    setSavedAt(new Date())
  }, [project, userId, supabase, onUpdate])

  function scheduleSave(updated: CommentaryContent) {
    setContent(updated)
    contentRef.current = updated
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { if (contentRef.current) performSave(contentRef.current) }, 1500)
  }

  function patchVerse(verse: number, data: Partial<VerseComment>) {
    if (!contentRef.current) return
    const updated: CommentaryContent = {
      ...contentRef.current,
      verses: contentRef.current.verses.map(v => v.verse === verse ? { ...v, ...data } : v),
    }
    scheduleSave(updated)
  }

  function setStyle(style: CommentaryStyle) {
    if (!contentRef.current) return
    scheduleSave({ ...contentRef.current, style })
  }

  function toggleNote(verse: number) {
    setOpenNotes(prev => {
      const n = new Set(prev)
      n.has(verse) ? n.delete(verse) : n.add(verse)
      return n
    })
  }

  // ── AI prompts
  function aiVerse(v: VerseComment, styleCfg: StyleCfg) {
    const ref = `${project.book} ${effective!.chapter}:${v.verse}`
    onAskAI(styleCfg.prompt(ref, v.verseText, v.comment))
  }

  function aiIntroducao() {
    const ref = `${project.book} ${project.passage_ref}`
    onAskAI(`Escreva uma introdução comentada para a perícope ${ref}. Contexto histórico, estrutura literária, temas principais, posicionamento canônico e relevância teológica. Perspectiva reformada (style: ${activeStyle.label}).`)
  }

  function aiEsboco() {
    const ref = `${project.book} ${project.passage_ref}`
    onAskAI(`Gere um esboço exegético estruturado da perícope ${ref}. Divida em unidades literárias com versículos, identifique o ponto central de cada unidade e mostre a progressão do argumento.`)
  }

  function aiResumo() {
    const ref = `${project.book} ${project.passage_ref}`
    const partial = content?.verses.filter(v => v.comment.trim()).map(v => `v.${v.verse}: ${v.comment.slice(0, 80)}`).join(' / ')
    onAskAI(`Escreva uma síntese teológica e pastoral da perícope ${ref} com base no comentário desenvolvido. Identifique a mensagem central, conexões teológicas e aplicação.${partial ? `\n\nComentários existentes: ${partial}` : ''}`)
  }

  // ── Derived
  const activeStyleCfg = STYLES.find(s => s.id === (content?.style ?? 'exegetico'))!
  const activeStyle    = activeStyleCfg
  const savedLabel     = saving ? 'salvando…' : savedAt
    ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''

  // ── Unparseable passage — show manual input
  if (!effective) {
    return (
      <div style={{ padding: '3rem 2rem', maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: COLOR, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900 }}>
          Comentário Expositivo
        </div>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>
          Especifique o intervalo de versículos
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          O formato da referência <strong style={{ color: 'var(--text-primary)' }}>{project.passage_ref}</strong> não pôde ser interpretado automaticamente. Digite a referência no formato <em>capítulo.versículo-versículo</em> (ex: 39.1-23).
        </p>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <input
            value={manualRange}
            onChange={e => setManualRange(e.target.value)}
            placeholder="ex: 39.1-23"
            style={{
              flex: 1, background: 'var(--surface-2)', border: `1px solid ${COLOR}`,
              borderRadius: '7px', color: 'var(--text-primary)', fontFamily: 'inherit',
              fontSize: '0.9rem', padding: '0.6rem 0.85rem', outline: 'none',
            }}
          />
          <button
            onClick={() => {
              const p = parseRef(manualRange)
              if (p) { setManualParsed(p); setContent(reconcile(null, p.chapter, p.verseStart, p.verseEnd)) }
            }}
            style={{
              background: COLOR, border: 'none', borderRadius: '7px',
              color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.85rem', fontWeight: 700, padding: '0 1rem',
            }}
          >Aplicar</button>
        </div>
      </div>
    )
  }

  if (!content) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Sticky header bar */}
      <div style={{
        flexShrink: 0,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface)',
        padding: '0.55rem 1.4rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
      }}>
        {/* Title + passage */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '0.65rem', color: COLOR, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Comentário
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {project.book} {project.passage_ref}
          </span>
          {savedLabel && (
            <>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{savedLabel}</span>
            </>
          )}
        </div>

        {/* Style selector */}
        <div style={{ display: 'flex', gap: '0.2rem' }}>
          {STYLES.map(s => {
            const active = s.id === content.style
            return (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                style={{
                  background: active ? `${COLOR}18` : 'transparent',
                  border: `1px solid ${active ? COLOR : 'var(--border-subtle)'}`,
                  borderRadius: '5px',
                  color: active ? COLOR : 'var(--text-muted)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.72rem', fontWeight: active ? 800 : 400,
                  padding: '0.22rem 0.6rem',
                  transition: 'border-color 0.12s, color 0.12s, background 0.12s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = COLOR }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        {/* Toggles */}
        <button
          onClick={() => setShowVerseText(v => !v)}
          style={{
            background: showVerseText ? `${COLOR}18` : 'transparent',
            border: `1px solid ${showVerseText ? COLOR : 'var(--border-subtle)'}`,
            borderRadius: '5px',
            color: showVerseText ? COLOR : 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.72rem', padding: '0.22rem 0.6rem',
          }}
        >
          Texto
        </button>

        {/* Global AI actions */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {[
            { label: 'Introdução',  action: aiIntroducao },
            { label: 'Esboço',      action: aiEsboco },
            { label: 'Síntese',     action: aiResumo },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                background: 'transparent',
                border: `1px solid ${COLOR}`,
                borderRadius: '5px',
                color: COLOR, cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.72rem', fontWeight: 700,
                padding: '0.22rem 0.6rem',
                display: 'flex', gap: '0.3rem', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${COLOR}18`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ opacity: 0.7, fontSize: '0.62rem' }}>✦</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Verse list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem clamp(1.2rem, 3vw, 2.4rem) 4rem' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          {content.verses.map((v, i) => {
            const isHovered   = hoveredVerse === v.verse
            const noteOpen    = openNotes.has(v.verse)
            const hasNote     = !!(v.notes.trim())
            const showActions = isHovered || noteOpen
            const ref         = `${effective.chapter}:${v.verse}`

            return (
              <div
                key={v.verse}
                onMouseEnter={() => setHoveredVerse(v.verse)}
                onMouseLeave={() => setHoveredVerse(null)}
                style={{
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                  paddingTop: i === 0 ? 0 : '1.25rem',
                  paddingBottom: '0.15rem',
                  marginBottom: '1.1rem',
                }}
              >
                {/* Verse header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showVerseText ? '0.45rem' : '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 900,
                      color: COLOR, textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}>
                      v. {v.verse}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {project.book} {ref}
                    </span>
                  </div>

                  {/* Hover actions */}
                  {showActions && (
                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                      {/* Note dot at rest → ✎ button on hover */}
                      <button
                        onClick={() => toggleNote(v.verse)}
                        title={hasNote ? 'Notas (preenchidas)' : 'Adicionar notas'}
                        style={{
                          background: noteOpen ? `${COLOR}18` : 'transparent',
                          border: 'none', borderRadius: '3px',
                          padding: '0.12rem 0.28rem', cursor: 'pointer',
                          color: noteOpen ? COLOR : hasNote ? `${COLOR}80` : 'var(--text-muted)',
                          fontSize: '0.72rem', lineHeight: 1, flexShrink: 0,
                        }}
                      >✎</button>

                      <button
                        onClick={() => aiVerse(v, activeStyleCfg)}
                        style={{
                          background: 'transparent',
                          border: `1px solid ${COLOR}`,
                          borderRadius: '5px',
                          color: COLOR, cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '0.68rem', fontWeight: 700,
                          padding: '0.1rem 0.45rem',
                          display: 'flex', gap: '0.25rem', alignItems: 'center',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${COLOR}18`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ opacity: 0.7, fontSize: '0.58rem' }}>✦</span>
                        Gerar
                      </button>
                    </div>
                  )}

                  {/* Note dot at rest (no hover) */}
                  {!showActions && hasNote && !noteOpen && (
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: COLOR, opacity: 0.55 }} />
                  )}
                </div>

                {/* Verse text (optional toggle) */}
                {showVerseText && (
                  <textarea
                    value={v.verseText}
                    onChange={e => patchVerse(v.verse, { verseText: e.target.value })}
                    placeholder={`Texto de ${project.book} ${ref}…`}
                    rows={2}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.025)',
                      border: '1px solid var(--border-subtle)', borderRadius: '5px',
                      color: 'var(--text-secondary)', fontFamily: 'inherit',
                      fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.65,
                      padding: '0.42rem 0.65rem', resize: 'vertical', outline: 'none',
                      marginBottom: '0.4rem',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = COLOR}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  />
                )}

                {/* Comment textarea — main content */}
                <textarea
                  value={v.comment}
                  onChange={e => patchVerse(v.verse, { comment: e.target.value })}
                  placeholder={activeStyleCfg.placeholder}
                  rows={4}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    borderBottom: '1px solid transparent',
                    color: 'var(--text-primary)', fontFamily: 'inherit',
                    fontSize: '0.9rem', lineHeight: 1.75,
                    padding: '0 0 0.2rem', resize: 'vertical', outline: 'none',
                  }}
                  onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--border-subtle)'}
                  onBlur={e => e.currentTarget.style.borderBottomColor = 'transparent'}
                />

                {/* Notes */}
                {noteOpen && (
                  <NoteArea
                    value={v.notes}
                    onChange={val => patchVerse(v.verse, { notes: val })}
                  />
                )}
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}
