'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'
import type { OriginalVerse } from '@/lib/original-text'

interface VersoData {
  id: string
  ref: string
  texto: string
  transliteracao: string
  traducao_literal: string
  traducao_ajustada: string
  observacoes: string
}

type FetchState = 'idle' | 'loading' | 'loaded' | 'error'

interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (s: Section) => void
  onAskAI: (prompt: string) => void
}

function loadData(section: Section | undefined): { passagem: string; versos: VersoData[] } {
  const content = section?.content as Record<string, unknown> | null
  if (content?.type === 'textual_workspace') {
    return {
      passagem: (content.passagem as string) ?? '',
      versos: (content.versos as VersoData[]) ?? [],
    }
  }
  return { passagem: '', versos: [] }
}

function makeVerso(): VersoData {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    ref: '', texto: '', transliteracao: '',
    traducao_literal: '', traducao_ajustada: '', observacoes: '',
  }
}

function makeId(verse: number): string {
  return `v${verse}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function verseToData(verse: OriginalVerse): VersoData {
  return {
    id: makeId(verse.verse),
    ref: `v. ${verse.verse}`,
    texto: verse.original,
    transliteracao: verse.transliteration,
    traducao_literal: verse.userTranslation,
    traducao_ajustada: '',
    observacoes: verse.notes,
  }
}

function versesToPassage(verses: VersoData[]): string {
  return verses.map(verse => `${verse.ref} ${verse.texto}`.trim()).join('\n')
}

const FIELD_LABEL: React.CSSProperties = {
  fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.09em',
  textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem',
}

const TEXTAREA_BASE: React.CSSProperties = {
  width: '100%', background: 'var(--surface)',
  border: '1px solid var(--border-subtle)', borderRadius: '5px',
  padding: '0.65rem 0.9rem', lineHeight: '1.75',
  resize: 'vertical', outline: 'none',
  fontFamily: 'var(--font-serif)', boxSizing: 'border-box',
}

export default function OriginalTextWorkspace({ project, userId, existingSection, onUpdate, onAskAI }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const init = loadData(existingSection)

  const [passagem, setPassagem] = useState(init.passagem)
  const [versos, setVersos] = useState<VersoData[]>(init.versos)
  const [editingText, setEditingText] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(init.versos[0]?.id ?? null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [fetchState, setFetchState] = useState<FetchState>(init.versos.length > 0 ? 'loaded' : 'idle')
  const [fetchError, setFetchError] = useState('')

  const latestP = useRef(passagem)
  const latestV = useRef(versos)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fetchedOnMount = useRef(false)
  const hasInitialContent = useRef(init.versos.length > 0 || init.passagem.trim().length > 0)

  useEffect(() => { latestP.current = passagem }, [passagem])
  useEffect(() => { latestV.current = versos }, [versos])

  async function performSave(p: string, v: VersoData[]) {
    setSaving(true)
    const hasContent = p.trim().length > 0 || v.length > 0
    const payload = {
      project_id: project.id, user_id: userId,
      slug: 'texto_original', module: 'inventio' as const,
      title: '§ Texto Original',
      content: { type: 'textual_workspace', passagem: p, versos: v },
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

  async function loadOriginalText(force = false) {
    if (!force && latestV.current.length > 0) return

    setFetchState('loading')
    setFetchError('')
    setEditingText(false)

    try {
      const response = await fetch('/api/bible/original', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book: project.book,
          passageRef: project.passage_ref,
          testament: project.testament,
          originalLanguage: project.original_language,
        }),
      })

      const data = await response.json() as { verses?: OriginalVerse[]; error?: string }
      if (!response.ok || !data.verses?.length) {
        throw new Error(data.error ?? 'Não foi possível carregar o texto original.')
      }

      const nextVerses = data.verses.map(verseToData)
      const nextPassage = versesToPassage(nextVerses)

      setVersos(nextVerses)
      setPassagem(nextPassage)
      setExpandedId(nextVerses[0]?.id ?? null)
      latestV.current = nextVerses
      latestP.current = nextPassage
      setFetchState('loaded')
      await performSave(nextPassage, nextVerses)
    } catch (error) {
      setFetchState('error')
      setFetchError(error instanceof Error ? error.message : 'Falha ao buscar texto original.')
      setEditingText(true)
    }
  }

  useEffect(() => {
    if (fetchedOnMount.current || hasInitialContent.current) return
    fetchedOnMount.current = true
    void loadOriginalText()
    // The workspace is keyed by slug; this mount-only bootstrap avoids re-fetching saved text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function schedule() {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(latestP.current, latestV.current), 1500)
  }

  function setP(val: string) {
    setPassagem(val); latestP.current = val; schedule()
  }

  function updateVerso(id: string, field: keyof VersoData, val: string) {
    setVersos(prev => {
      const next = prev.map(v => v.id === id ? { ...v, [field]: val } : v)
      latestV.current = next; schedule(); return next
    })
  }

  function addVerso() {
    const v = makeVerso()
    setVersos(prev => { const next = [...prev, v]; latestV.current = next; schedule(); return next })
    setExpandedId(v.id)
  }

  function removeVerso(id: string) {
    setVersos(prev => {
      const next = prev.filter(v => v.id !== id)
      latestV.current = next; schedule(); return next
    })
    if (expandedId === id) setExpandedId(null)
  }

  const isHebrew = project.testament === 'AT' || project.original_language.toLowerCase().startsWith('heb')
  const dir = isHebrew ? 'rtl' : 'ltr'
  const savedLabel = saving ? 'salvando…' : savedAt
    ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem clamp(1.5rem, 4vw, 2.5rem) 6rem', fontFamily: 'var(--font-sans)' }}>

      {/* Breadcrumb */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        fontSize: '0.68rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: '0.75rem',
      }}>
        <span style={{ color: 'var(--accent)', fontWeight: 800 }}>Inventio</span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>Estudo Textual</span>
        <span style={{
          marginLeft: 'auto', textTransform: 'none', letterSpacing: 0,
          fontSize: '0.7rem',
          color: saving ? 'var(--ai)' : savedAt ? 'var(--success)' : 'transparent',
          transition: 'color 0.3s',
        }}>
          {savedLabel || '·'}
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em',
        lineHeight: 1.2, color: 'var(--text-primary)', marginBottom: '0.35rem',
      }}>
        Texto Original
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
        {project.book} {project.passage_ref} · {project.original_language}
      </p>

      {/* ═══════════════════════════════════════════════════════════
          BLOCO DO TEXTO ORIGINAL
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom: '3rem' }}>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <div style={{
            fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            {isHebrew ? 'Texto Hebraico' : 'Texto Grego'}
          </div>
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              onClick={() => loadOriginalText(true)}
              disabled={fetchState === 'loading'}
              style={{
                background: fetchState === 'loading' ? 'var(--surface-2)' : 'var(--accent-subtle)',
                border: `1px solid ${fetchState === 'loading' ? 'var(--border)' : 'var(--accent)'}`,
                borderRadius: '4px',
                color: fetchState === 'loading' ? 'var(--text-muted)' : 'var(--accent)',
                cursor: fetchState === 'loading' ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.67rem',
                fontWeight: 700,
                padding: '0.18rem 0.55rem',
              }}
            >
              {fetchState === 'loading' ? 'Buscando...' : 'Atualizar texto original'}
            </button>
            <button
              onClick={() => setEditingText(e => !e)}
              style={{
                background: 'transparent', border: '1px solid var(--border-subtle)',
                borderRadius: '4px', color: 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.67rem', padding: '0.18rem 0.5rem',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
            >
              {editingText ? 'Concluir edição' : 'Editar texto ✎'}
            </button>
          </div>
        </div>

        {fetchState === 'loading' ? (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '3.2rem 1.5rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '1.5rem', color: 'var(--accent)', opacity: 0.55, marginBottom: '0.65rem' }}>
              {isHebrew ? 'א' : 'α'}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Buscando texto original...
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              {project.book} {project.passage_ref} · {isHebrew ? 'Hebraico' : 'Grego'}
            </div>
          </div>
        ) : editingText ? (
          <>
          {fetchState === 'error' && (
            <div style={{
              background: 'rgba(229,115,115,0.08)',
              border: '1px solid rgba(229,115,115,0.35)',
              borderRadius: '7px',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              lineHeight: '1.55',
              padding: '0.8rem 0.95rem',
              marginBottom: '0.8rem',
            }}>
              Não foi possível buscar o texto original automaticamente. {fetchError}
              <br />
              Use o campo abaixo como fallback manual.
            </div>
          )}
          <textarea
            value={passagem}
            onChange={e => setP(e.target.value)}
            placeholder={isHebrew
              ? 'Cole aqui o texto hebraico da passagem, com os versículos separados por linha...'
              : 'Cole aqui o texto grego da passagem, com os versículos separados por linha...'}
            rows={10}
            dir={dir}
            autoFocus
            style={{
              ...TEXTAREA_BASE,
              fontSize: '1.3rem', lineHeight: '2.1',
              letterSpacing: isHebrew ? '0.02em' : '0.01em',
              color: 'var(--text-primary)',
              direction: dir,
              background: 'var(--surface)',
              border: '1px solid var(--accent)',
              borderRadius: '8px',
              padding: '1.4rem 1.7rem',
              caretColor: 'var(--accent)',
            }}
          />
          </>
        ) : passagem.trim() ? (
          /* ── Reading mode: the text dominates ── */
          <div
            onClick={() => setEditingText(true)}
            title="Clique para editar"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1.75rem 2rem',
              cursor: 'text',
              position: 'relative',
            }}
          >
            <p style={{
              margin: 0,
              color: 'var(--text-primary)',
              fontSize: '1.4rem',
              fontFamily: 'var(--font-serif)',
              lineHeight: '2.15',
              letterSpacing: isHebrew ? '0.04em' : '0.02em',
              direction: dir,
              whiteSpace: 'pre-wrap',
            }}>
              {passagem}
            </p>
          </div>
        ) : (
          /* ── Empty state ── */
          <button
            onClick={() => setEditingText(true)}
            style={{
              width: '100%',
              background: 'var(--surface)',
              border: '2px dashed var(--border-subtle)',
              borderRadius: '8px',
              padding: '3.5rem 1.5rem',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontFamily: 'inherit',
              transition: 'border-color 0.18s, color 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <div style={{ fontSize: '1.6rem', color: 'var(--accent)', opacity: 0.45, marginBottom: '0.6rem' }}>
              {isHebrew ? 'א' : 'α'}
            </div>
            <div style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
              Cole o texto original de <strong style={{ color: 'var(--text-secondary)' }}>{project.book} {project.passage_ref}</strong>
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', opacity: 0.65 }}>
              {isHebrew ? 'Hebraico, BHS ou texto massorético' : 'Grego, NA28 ou UBS5'}
            </div>
          </button>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ANÁLISE VERSO A VERSO
      ═══════════════════════════════════════════════════════════ */}
      <section>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem',
        }}>
          <div style={{
            fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
          }}>
            Tradução e Análise · Verso a Verso
          </div>
          <button
            onClick={addVerso}
            style={{
              background: 'transparent', border: '1px solid var(--accent)',
              borderRadius: '4px', color: 'var(--accent)',
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: '0.68rem', fontWeight: 700,
              padding: '0.2rem 0.58rem',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            + Versículo
          </button>
        </div>

        {versos.length === 0 ? (
          <div style={{
            padding: '2.5rem 1.5rem',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '7px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.84rem', lineHeight: '1.65',
          }}>
            <div style={{ fontSize: '1.1rem', color: 'var(--accent)', opacity: 0.35, marginBottom: '0.6rem' }}>
              {isHebrew ? 'פסוק' : 'στίχος'}
            </div>
            Adicione versículos para construir sua tradução progressiva.
            <br />
            <button
              onClick={addVerso}
              style={{
                marginTop: '1rem',
                background: 'var(--accent-subtle)', border: '1px solid var(--accent)',
                borderRadius: '5px', color: 'var(--accent)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.79rem', fontWeight: 700,
                padding: '0.42rem 1rem',
              }}
            >
              Iniciar análise
            </button>
          </div>
        ) : (
          <div>
            {versos.map((verso, idx) => {
              const isExpanded = expandedId === verso.id
              const isLast = idx === versos.length - 1
              const filled = verso.traducao_literal.trim() || verso.traducao_ajustada.trim()

              return (
                <div
                  key={verso.id}
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    borderBottom: isLast ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  {/* Verse header row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : verso.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.85rem 0', cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)', opacity: 0.45, flexShrink: 0 }}>
                      {isExpanded ? '▾' : '▸'}
                    </span>

                    {/* Ref */}
                    <input
                      value={verso.ref}
                      onChange={e => updateVerso(verso.id, 'ref', e.target.value)}
                      onClick={e => e.stopPropagation()}
                      placeholder="v. 1"
                      style={{
                        width: '44px', flexShrink: 0,
                        background: 'transparent', border: 'none',
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--accent)', fontFamily: 'inherit',
                        fontSize: '0.78rem', fontWeight: 700,
                        padding: '0 0.15rem 0.08rem',
                        outline: 'none', textAlign: 'center',
                      }}
                      onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--accent)'}
                      onBlur={e => e.currentTarget.style.borderBottomColor = 'var(--border-subtle)'}
                    />

                    {/* Original text snippet / input */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isExpanded ? (
                        <input
                          value={verso.texto}
                          onChange={e => updateVerso(verso.id, 'texto', e.target.value)}
                          onClick={e => e.stopPropagation()}
                          placeholder={isHebrew ? 'Texto hebraico do versículo…' : 'Texto grego do versículo…'}
                          dir={dir}
                          style={{
                            width: '100%', background: 'transparent', border: 'none',
                            color: 'var(--text-primary)', fontFamily: 'var(--font-serif)',
                            fontSize: '1.05rem', lineHeight: '1.7',
                            outline: 'none', direction: dir,
                          }}
                        />
                      ) : (
                        <span style={{
                          fontSize: '0.98rem', color: verso.texto.trim() ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontFamily: 'var(--font-serif)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          display: 'block', direction: dir,
                          fontStyle: verso.texto.trim() ? 'normal' : 'italic',
                        }}>
                          {verso.texto.trim() || (isHebrew ? 'Texto hebraico…' : 'Texto grego…')}
                        </span>
                      )}
                    </div>

                    {/* Status dot + remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                      {filled && (
                        <span style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: 'var(--success)', display: 'inline-block',
                        }} />
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); removeVerso(verso.id) }}
                        title="Remover"
                        style={{
                          background: 'transparent', border: 'none',
                          color: 'var(--border)', cursor: 'pointer',
                          fontSize: '0.9rem', padding: '0 0.15rem',
                          lineHeight: 1, transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {/* Expanded analysis */}
                  {isExpanded && (
                    <div style={{ paddingBottom: '1.6rem', paddingLeft: '0.95rem', display: 'grid', gap: '1.1rem' }}>

                      <div>
                        <div style={FIELD_LABEL}>Transliteração</div>
                        <textarea
                          value={verso.transliteracao}
                          onChange={e => updateVerso(verso.id, 'transliteracao', e.target.value)}
                          placeholder={isHebrew ? 'wə-yôsēp̄ hûrad miṣrāyəmāh…' : 'en archē ēn ho logos…'}
                          rows={2}
                          style={{
                            ...TEXTAREA_BASE,
                            color: 'var(--text-secondary)', fontSize: '0.87rem',
                            fontStyle: 'italic',
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--accent)40'}
                          onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                        />
                      </div>

                      <div>
                        <div style={FIELD_LABEL}>Tradução Literal</div>
                        <textarea
                          value={verso.traducao_literal}
                          onChange={e => updateVerso(verso.id, 'traducao_literal', e.target.value)}
                          placeholder="Tradução palavra por palavra, preservando a estrutura do original…"
                          rows={3}
                          style={{ ...TEXTAREA_BASE, color: 'var(--text-primary)', fontSize: '0.93rem' }}
                          onFocus={e => e.target.style.borderColor = 'var(--accent)40'}
                          onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                        />
                      </div>

                      <div>
                        <div style={FIELD_LABEL}>Tradução Ajustada</div>
                        <textarea
                          value={verso.traducao_ajustada}
                          onChange={e => updateVerso(verso.id, 'traducao_ajustada', e.target.value)}
                          placeholder="Tradução idiomática que preserva o sentido exegético sem sacrificar a clareza…"
                          rows={3}
                          style={{ ...TEXTAREA_BASE, color: 'var(--text-primary)', fontSize: '0.95rem' }}
                          onFocus={e => e.target.style.borderColor = 'var(--accent)40'}
                          onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                        />
                      </div>

                      <div>
                        <div style={FIELD_LABEL}>Observações Exegéticas</div>
                        <textarea
                          value={verso.observacoes}
                          onChange={e => updateVerso(verso.id, 'observacoes', e.target.value)}
                          placeholder="Notas morfológicas, léxicas, sintáticas, teológicas — tudo que o texto revela ao exegeta…"
                          rows={4}
                          style={{ ...TEXTAREA_BASE, color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                          onFocus={e => e.target.style.borderColor = 'var(--accent)40'}
                          onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                        />
                      </div>

                      {/* Per-verse AI actions */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => onAskAI([
                            `Analise exegeticamente ${verso.ref || 'este versículo'} de ${project.book} ${project.passage_ref}${verso.texto ? `: "${verso.texto}"` : ''}.`,
                            '',
                            'Forneça: (1) análise morfossintática dos termos principais; (2) observações léxicas (BDAG/HALOT); (3) implicações teológicas; (4) dificuldades de tradução.',
                          ].join('\n'))}
                          style={{
                            background: 'var(--ai-subtle)', border: '1px solid var(--ai)',
                            borderRadius: '5px', color: 'var(--ai)',
                            cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: '0.72rem', fontWeight: 700,
                            padding: '0.32rem 0.7rem', transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,156,191,0.18)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--ai-subtle)'}
                        >
                          Analisar com IA →
                        </button>
                        <button
                          onClick={() => onAskAI([
                            `Sugira uma tradução literal precisa de ${verso.ref || 'este versículo'} de ${project.book} ${project.passage_ref}${verso.texto ? `: "${verso.texto}"` : ''}.`,
                            'Apresente a tradução com notas sobre as principais decisões lexicais e estruturais.',
                          ].join('\n'))}
                          style={{
                            background: 'transparent', border: '1px solid var(--border-subtle)',
                            borderRadius: '5px', color: 'var(--text-muted)',
                            cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: '0.72rem', padding: '0.32rem 0.7rem',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                        >
                          Sugerir tradução →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <button
              onClick={addVerso}
              style={{
                marginTop: '0.85rem', width: '100%',
                background: 'transparent',
                border: '1px dashed var(--border-subtle)',
                borderRadius: '6px', color: 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.77rem', fontWeight: 500,
                padding: '0.55rem', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.borderStyle = 'solid' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.borderStyle = 'dashed' }}
            >
              + Adicionar versículo
            </button>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          AI FULL-PASSAGE ANALYSIS
      ═══════════════════════════════════════════════════════════ */}
      <div style={{
        marginTop: '3rem',
        padding: '1.15rem 1.3rem',
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '3px solid var(--ai)',
        borderRadius: '7px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '0.63rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ai)', marginBottom: '0.28rem' }}>
            Análise Textual Completa com IA
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Morfossintaxe, léxico, estrutura e observações exegéticas da passagem inteira.
          </p>
        </div>
        <button
          onClick={() => onAskAI([
            `Faça uma análise textual exegética completa de ${project.book} ${project.passage_ref} no idioma original (${project.original_language}).`,
            passagem.trim() ? `\nTexto:\n${passagem}` : '',
            '',
            'Inclua: (1) morfossintaxe dos termos principais; (2) observações léxicas (BDAG/HALOT); (3) estrutura sintática da passagem; (4) dificuldades de tradução; (5) implicações teológicas.',
          ].join('\n'))}
          style={{
            background: 'var(--ai-subtle)', border: '1px solid var(--ai)',
            borderRadius: '6px', color: 'var(--ai)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.79rem', fontWeight: 700,
            padding: '0.5rem 1rem', flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,156,191,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--ai-subtle)'}
        >
          Analisar passagem com IA →
        </button>
      </div>
    </div>
  )
}
