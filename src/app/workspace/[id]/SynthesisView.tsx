'use client'

import type { Project, Section } from '@/types/database'
import { getSectionsByGroup, type SynthesisDef } from '@/lib/workspace-sections'

interface Props {
  synthesisDef: SynthesisDef
  project: Project
  savedSections: Section[]
  onNavigate: (slug: string) => void
  onAskAI: (prompt: string) => void
}

const DOC = "'Times New Roman', Times, serif"

// Detect Hebrew (U+0590–U+05FF, U+FB1D–U+FB4F) or Greek (U+0370–U+03FF, U+1F00–U+1FFF)
const ORIG_LANG_RE = /[֐-׿יִ-ﭏͰ-Ͽἀ-῿]/

function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(\s+)/)
  return (
    <>
      {parts.map((part, i) =>
        ORIG_LANG_RE.test(part) ? (
          <span key={i} style={{
            fontFamily: DOC,
            fontWeight: '600',
            background: 'rgba(0,0,0,0.07)',
            padding: '0 3px',
            borderRadius: '2px',
            letterSpacing: '0.03em',
          }}>
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function getCards(saved: Section | undefined): Record<string, string> {
  const content = saved?.content as Record<string, unknown> | null
  if (content && typeof content === 'object' && 'cards' in content) {
    return content.cards as Record<string, string>
  }
  return {}
}

interface VersoData {
  id: string
  ref: string
  texto: string
  transliteracao: string
  traducao_literal: string
  traducao_ajustada: string
  observacoes: string
}

function extractVersos(savedSections: Section[]): VersoData[] {
  const sec = savedSections.find(s => s.slug === 'texto_original')
  if (!sec) return []
  const c = sec.content as { type?: string; versos?: VersoData[] } | null
  if (c?.type !== 'textual_workspace' || !c.versos) return []
  return c.versos.filter(v => v.texto?.trim() || v.traducao_literal?.trim())
}

function buildSynthesisPrompt(
  synthesisDef: SynthesisDef,
  project: Project,
  savedSections: Section[],
  groupSections: ReturnType<typeof getSectionsByGroup>,
): string {
  const lines: string[] = [
    `Gere uma síntese integradora acadêmica do ${synthesisDef.groupLabel} de ${project.book} ${project.passage_ref}.`,
    '',
    'Organize os seguintes elementos em uma visão panorâmica coerente, relacionando os tópicos entre si e preparando a transição para a próxima etapa do estudo exegético:',
    '',
  ]
  for (const sd of groupSections) {
    const cards = getCards(savedSections.find(s => s.slug === sd.slug))
    const hasContent = Object.values(cards).some(v => v?.trim())
    if (!hasContent) continue
    lines.push(`## ${sd.title}`)
    for (const card of sd.cards) {
      const content = cards[card.id]?.trim()
      if (content) {
        lines.push(`### ${card.title}`)
        lines.push(content)
        lines.push('')
      }
    }
  }
  lines.push('')
  lines.push(
    'Produza uma síntese que: (1) organize os elementos em progressão lógica e acadêmica; ' +
    '(2) relacione os tópicos entre si; (3) use tom de caderno exegético reformado; ' +
    '(4) prepare a transição para o próximo bloco de estudo. ' +
    'Não use bullet points — escreva em prosa densa, como um comentarista.',
  )
  return lines.join('\n')
}

export default function SynthesisView({
  synthesisDef, project, savedSections, onNavigate, onAskAI,
}: Props) {
  const groupSections = getSectionsByGroup(synthesisDef.groupId)
  const isTextual = synthesisDef.groupId === 'textual'
  const versos = isTextual ? extractVersos(savedSections) : []

  const { nextGroup } = synthesisDef
  const nextPhaseChange = nextGroup.phaseId === 'comunicar'

  const totalCards = groupSections.reduce((acc, sd) => acc + sd.cards.length, 0)
  const filledCards = groupSections.reduce((acc, sd) => {
    const cards = getCards(savedSections.find(s => s.slug === sd.slug))
    return acc + Object.values(cards).filter(v => v?.trim().length > 0).length
  }, 0)
  const pct = totalCards > 0 ? Math.round((filledCards / totalCards) * 100) : 0

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100%', padding: '2.5rem 1.5rem 5rem' }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 1.5cm 2cm; }
          body * { visibility: hidden; }
          #keryx-synthesis-doc, #keryx-synthesis-doc * { visibility: visible; }
          #keryx-synthesis-doc {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            max-width: 100% !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 1.5cm 2cm !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ── Print toolbar ────────────────────────────────────────────────── */}
      <div className="no-print" style={{ maxWidth: '760px', margin: '0 auto 0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => window.print()}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '5px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.78rem',
            padding: '0.3rem 0.8rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          Imprimir / PDF
        </button>
      </div>

      {/* ── Document sheet ───────────────────────────────────────────────── */}
      <div id="keryx-synthesis-doc" style={{
        maxWidth: '760px',
        margin: '0 auto',
        background: '#ffffff',
        color: '#1a1a1a',
        fontFamily: DOC,
        boxShadow: '0 4px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.1)',
        borderRadius: '1px',
        padding: 'clamp(2rem, 5vw, 3.5rem) clamp(2rem, 6vw, 4rem) 3.5rem',
      }}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontFamily: "'Arial', 'Helvetica', sans-serif",
            fontSize: '8pt',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: '0.75rem',
          }}>
            Keryx — Estudo Exegético
          </div>

          <h1 style={{
            fontFamily: DOC,
            fontSize: '18pt',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: '0 0 0.5rem',
            lineHeight: '1.2',
          }}>
            {synthesisDef.title}
          </h1>

          <p style={{
            fontFamily: DOC,
            fontSize: '12pt',
            color: '#444',
            margin: '0 0 0.5rem',
            fontStyle: 'italic',
          }}>
            {project.book} {project.passage_ref} · {project.original_language}
          </p>

          <p style={{
            fontFamily: "'Arial', sans-serif",
            fontSize: '9pt',
            color: '#999',
            margin: '0 0 1.5rem',
          }}>
            {today} · {filledCards}/{totalCards} campos preenchidos ({pct}%)
          </p>

          {/* Double rule */}
          <div style={{ borderTop: '2px solid #1a1a1a' }} />
          <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '3px', marginBottom: '2.5rem' }} />
        </div>

        {/* ── Sections ─────────────────────────────────────────────────── */}
        {groupSections.map((sd, secIdx) => {
          const saved = savedSections.find(s => s.slug === sd.slug)
          const cards = getCards(saved)
          const hasAnyContent = Object.values(cards).some(v => v?.trim())
          const isLast = secIdx === groupSections.length - 1

          return (
            <div key={sd.slug} style={{ marginBottom: '2.5rem' }}>

              {/* Section heading */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.15rem' }}>
                <h2 style={{
                  fontFamily: DOC,
                  fontSize: '14pt',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  margin: 0,
                  lineHeight: '1.3',
                }}>
                  {secIdx + 1}.&ensp;{sd.title}
                </h2>
                <button
                  className="no-print"
                  onClick={() => onNavigate(sd.slug)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'Arial', sans-serif",
                    fontSize: '8pt', color: '#aaa',
                    padding: 0, textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#555' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#aaa' }}
                >
                  [editar]
                </button>
              </div>

              {/* Cards */}
              {hasAnyContent ? (
                <div>
                  {sd.cards.map((card) => {
                    const content = cards[card.id]?.trim()
                    if (!content) return null
                    return (
                      <div key={card.id} style={{ marginBottom: '1.35rem' }}>
                        <div style={{
                          fontFamily: "'Arial', 'Helvetica', sans-serif",
                          fontSize: '8.5pt',
                          fontWeight: '700',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#1a1a1a',
                          marginBottom: '0.35rem',
                          borderBottom: '1px solid #e8e8e8',
                          paddingBottom: '0.25rem',
                        }}>
                          {card.title}
                        </div>
                        <p style={{
                          fontFamily: DOC,
                          fontSize: '12pt',
                          lineHeight: '1.85',
                          color: '#1a1a1a',
                          margin: 0,
                          textAlign: 'justify',
                          whiteSpace: 'pre-wrap',
                        }}>
                          <HighlightedText text={content} />
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{
                  fontFamily: DOC, fontSize: '11pt',
                  color: '#bbb', fontStyle: 'italic', margin: 0,
                }}>
                  Seção não preenchida.
                </p>
              )}

              {/* Section divider */}
              {!isLast && (
                <div style={{ borderTop: '1px solid #ddd', marginTop: '2rem' }} />
              )}
            </div>
          )
        })}

        {/* ── Textual: original language terms ─────────────────────────── */}
        {isTextual && versos.length > 0 && (
          <div style={{ marginTop: '0.5rem', marginBottom: '2.5rem' }}>
            <div style={{ borderTop: '2px solid #1a1a1a' }} />
            <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '3px', marginBottom: '2rem' }} />

            <h2 style={{
              fontFamily: DOC, fontSize: '14pt', fontWeight: '700',
              color: '#1a1a1a', margin: '0 0 1.75rem',
            }}>
              Termos-Chave do Texto Original
            </h2>

            {versos.map((verso, idx) => {
              const isHebrew = /[֐-׿]/.test(verso.texto ?? '')
              return (
                <div key={verso.id} style={{
                  marginBottom: '1.75rem',
                  paddingLeft: '1.25rem',
                  borderLeft: '3px solid #ccc',
                }}>
                  {/* Verse label */}
                  <div style={{
                    fontFamily: "'Arial', sans-serif",
                    fontSize: '8pt', fontWeight: '700',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#999', marginBottom: '0.5rem',
                  }}>
                    {idx + 1}.&ensp;{verso.ref}
                  </div>

                  {/* Original text */}
                  {verso.texto && (
                    <div style={{
                      fontFamily: DOC,
                      fontSize: '15pt',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      lineHeight: '1.9',
                      marginBottom: '0.3rem',
                      direction: isHebrew ? 'rtl' : 'ltr',
                      letterSpacing: isHebrew ? '0.04em' : '0.02em',
                    }}>
                      {verso.texto}
                    </div>
                  )}

                  {/* Transliteration */}
                  {verso.transliteracao && (
                    <div style={{
                      fontFamily: DOC, fontSize: '11pt',
                      fontStyle: 'italic', color: '#555',
                      marginBottom: '0.3rem',
                    }}>
                      {verso.transliteracao}
                    </div>
                  )}

                  {/* Translations */}
                  {verso.traducao_literal && (
                    <div style={{ fontFamily: DOC, fontSize: '11pt', color: '#333', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: '700' }}>Tradução literal:&ensp;</span>
                      {verso.traducao_literal}
                    </div>
                  )}
                  {verso.traducao_ajustada && (
                    <div style={{ fontFamily: DOC, fontSize: '11pt', color: '#333', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: '700' }}>Tradução ajustada:&ensp;</span>
                      {verso.traducao_ajustada}
                    </div>
                  )}

                  {/* Observations */}
                  {verso.observacoes && (
                    <div style={{
                      fontFamily: DOC, fontSize: '11pt',
                      fontStyle: 'italic', color: '#555',
                      marginTop: '0.4rem',
                      paddingTop: '0.4rem',
                      borderTop: '1px solid #ebebeb',
                    }}>
                      {verso.observacoes}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── AI synthesis ─────────────────────────────────────────────── */}
        <div className="no-print" style={{ borderTop: '2px solid #1a1a1a' }} />
        <div className="no-print" style={{ borderTop: '1px solid #1a1a1a', marginTop: '3px', marginBottom: '2rem' }} />

        <div className="no-print" style={{ marginBottom: '1rem' }}>
          <h2 style={{
            fontFamily: DOC, fontSize: '14pt', fontWeight: '700',
            color: '#1a1a1a', margin: '0 0 0.6rem',
          }}>
            Síntese Integradora
          </h2>
          <p style={{
            fontFamily: DOC, fontSize: '11pt',
            color: '#555', lineHeight: '1.7',
            margin: '0 0 1.1rem', fontStyle: 'italic',
          }}>
            Gere uma síntese acadêmica que organiza e relaciona todos os elementos do{' '}
            {synthesisDef.groupLabel.toLowerCase()}, preparando a transição para a próxima etapa.
          </p>
          <button
            onClick={() => onAskAI(buildSynthesisPrompt(synthesisDef, project, savedSections, groupSections))}
            style={{
              background: 'none',
              border: '1px solid #aaa',
              borderRadius: '2px',
              color: '#333',
              cursor: 'pointer',
              fontFamily: DOC,
              fontSize: '11pt',
              padding: '0.4rem 1.1rem',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = '#555' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#aaa' }}
          >
            Gerar síntese com IA →
          </button>
        </div>

      </div>

      {/* ── Next step CTA — outside the document ─────────────────────────── */}
      <div className="no-print" style={{
        maxWidth: '760px',
        margin: '2rem auto 0',
        padding: '1.25rem 1.5rem',
        background: nextPhaseChange ? 'rgba(124,156,191,0.08)' : 'rgba(184,146,42,0.07)',
        border: `1px solid ${nextPhaseChange ? 'rgba(124,156,191,0.28)' : 'rgba(184,146,42,0.22)'}`,
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'Arial', sans-serif",
            fontSize: '0.62rem', fontWeight: '800',
            letterSpacing: '0.11em', textTransform: 'uppercase',
            color: nextPhaseChange ? 'var(--ai)' : 'var(--accent)',
            marginBottom: '0.3rem',
          }}>
            {nextPhaseChange ? 'Do texto ao púlpito' : 'Próxima etapa'}
          </div>
          <p style={{
            fontFamily: "'Arial', sans-serif",
            fontSize: '0.83rem', color: 'var(--text-secondary)',
            lineHeight: '1.55', margin: 0,
          }}>
            {synthesisDef.ctaDescription}
          </p>
        </div>
        <button
          onClick={() => {
            const firstSection = getSectionsByGroup(nextGroup.id)[0]
            if (firstSection) onNavigate(firstSection.slug)
          }}
          style={{
            flexShrink: 0,
            background: nextPhaseChange ? 'rgba(124,156,191,0.12)' : 'var(--accent-subtle)',
            border: `1px solid ${nextPhaseChange ? 'var(--ai)' : 'var(--accent)'}`,
            borderRadius: '6px',
            color: nextPhaseChange ? 'var(--ai)' : 'var(--accent)',
            cursor: 'pointer',
            fontFamily: "'Arial', sans-serif",
            fontSize: '0.82rem', fontWeight: '700',
            padding: '0.55rem 1.2rem',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = nextPhaseChange
              ? 'rgba(124,156,191,0.2)'
              : 'rgba(184,146,42,0.18)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = nextPhaseChange
              ? 'rgba(124,156,191,0.12)'
              : 'var(--accent-subtle)'
          }}
        >
          Prosseguir para {nextGroup.label} →
        </button>
      </div>

    </div>
  )
}
