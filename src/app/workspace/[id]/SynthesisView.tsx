'use client'

import { useState } from 'react'
import type { Project, Section } from '@/types/database'
import { getSectionsByGroup, type SynthesisDef } from '@/lib/workspace-sections'

interface Props {
  synthesisDef: SynthesisDef
  project: Project
  savedSections: Section[]
  onNavigate: (slug: string) => void
  onAskAI: (prompt: string) => void
}

function getCards(saved: Section | undefined): Record<string, string> {
  const content = saved?.content as Record<string, unknown> | null
  if (content && typeof content === 'object' && 'cards' in content) {
    return content.cards as Record<string, string>
  }
  return {}
}

export default function SynthesisView({
  synthesisDef, project, savedSections, onNavigate, onAskAI,
}: Props) {
  const groupSections = getSectionsByGroup(synthesisDef.groupId)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(groupSections.map(s => s.slug))
  )

  function toggleSection(slug: string) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })
  }

  const totalCards = groupSections.reduce((acc, sd) => acc + sd.cards.length, 0)
  const filledCards = groupSections.reduce((acc, sd) => {
    const cards = getCards(savedSections.find(s => s.slug === sd.slug))
    return acc + Object.values(cards).filter(v => v?.trim().length > 0).length
  }, 0)
  const filledSections = groupSections.filter(sd => {
    const saved = savedSections.find(s => s.slug === sd.slug)
    return saved?.status === 'draft' || saved?.status === 'reviewed'
  })
  const pct = totalCards > 0 ? Math.round((filledCards / totalCards) * 100) : 0

  function buildSynthesisPrompt(): string {
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
      'Não use bullet points — escreva em prosa densa, como um comentarista.'
    )
    return lines.join('\n')
  }

  const { nextGroup } = synthesisDef
  const nextPhaseChange = nextGroup.phaseId === 'comunicar'

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 2.5rem 5rem', fontFamily: 'var(--font-sans)' }}>

      {/* Breadcrumb */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        fontSize: '0.68rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: '0.75rem',
      }}>
        <span style={{ color: 'var(--accent)', fontWeight: '700' }}>Inventio</span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>{synthesisDef.groupLabel}</span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span style={{ color: 'var(--text-secondary)' }}>Síntese</span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '1.6rem', fontWeight: '700',
        letterSpacing: '-0.025em', lineHeight: 1.2,
        color: 'var(--text-primary)', marginBottom: '0.85rem',
      }}>
        {synthesisDef.title}
      </h1>

      {/* Reference */}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        {project.book} {project.passage_ref} · {project.original_language}
      </p>

      {/* Progress bar */}
      <div style={{
        padding: '0.85rem 1rem',
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '7px',
        marginBottom: '2.5rem',
      }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          marginBottom: '0.5rem',
        }}>
          Progresso do bloco
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: pct === 100 ? 'var(--success)' : 'var(--accent)',
              transition: 'width 0.5s ease',
              borderRadius: '2px',
            }} />
          </div>
          <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
            {filledCards}/{totalCards} campos · {filledSections.length}/{groupSections.length} seções
          </span>
        </div>
      </div>

      {/* Section blocks */}
      <div>
        {groupSections.map((sd, idx) => {
          const saved = savedSections.find(s => s.slug === sd.slug)
          const cards = getCards(saved)
          const isExpanded = expandedSections.has(sd.slug)
          const sectionFilledCount = sd.cards.filter(c => cards[c.id]?.trim()).length
          const isLast = idx === groupSections.length - 1

          return (
            <div
              key={sd.slug}
              style={{
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: isLast ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {/* Section header row */}
              <div
                onClick={() => toggleSection(sd.slug)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.95rem 0',
                  cursor: 'pointer', userSelect: 'none',
                }}
              >
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', opacity: 0.5, flexShrink: 0 }}>
                  {isExpanded ? '▾' : '▸'}
                </span>
                <h2 style={{
                  flex: 1, margin: 0,
                  fontSize: '0.95rem', fontWeight: '600',
                  color: 'var(--text-primary)', letterSpacing: '-0.01em',
                }}>
                  {sd.title}
                </h2>
                <span style={{
                  fontSize: '0.68rem', flexShrink: 0,
                  color: sectionFilledCount === sd.cards.length
                    ? 'var(--success)'
                    : sectionFilledCount > 0
                    ? 'var(--accent)'
                    : 'var(--border)',
                  opacity: 0.85,
                }}>
                  {sectionFilledCount}/{sd.cards.length}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); onNavigate(sd.slug) }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.67rem', padding: '0.18rem 0.48rem',
                    flexShrink: 0, transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  }}
                >
                  Editar
                </button>
              </div>

              {/* Section content */}
              {isExpanded && (
                <div style={{ paddingBottom: '1.5rem', paddingLeft: '0.8rem' }}>
                  {sd.cards.map((card, cardIdx) => {
                    const content = cards[card.id]?.trim() ?? ''
                    return (
                      <div
                        key={card.id}
                        style={{ marginBottom: cardIdx < sd.cards.length - 1 ? '1.3rem' : 0 }}
                      >
                        <div style={{
                          fontSize: '0.62rem', fontWeight: '800',
                          letterSpacing: '0.09em', textTransform: 'uppercase',
                          color: content ? 'var(--text-muted)' : 'var(--border)',
                          marginBottom: '0.38rem',
                        }}>
                          {card.title}
                        </div>
                        {content ? (
                          <p style={{
                            margin: 0,
                            fontSize: '0.9rem', lineHeight: '1.82',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-serif)',
                            whiteSpace: 'pre-wrap',
                          }}>
                            {content}
                          </p>
                        ) : (
                          <p style={{
                            margin: 0,
                            fontSize: '0.82rem', lineHeight: '1.6',
                            color: 'var(--border)',
                            fontStyle: 'italic',
                          }}>
                            Não preenchido
                          </p>
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

      {/* AI synthesis */}
      <div style={{
        marginTop: '2.5rem',
        padding: '1.25rem',
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '3px solid var(--ai)',
        borderRadius: '7px',
      }}>
        <div style={{
          fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--ai)',
          marginBottom: '0.45rem',
        }}>
          Síntese Integradora com IA
        </div>
        <p style={{
          fontSize: '0.84rem', color: 'var(--text-secondary)',
          lineHeight: '1.7', margin: '0 0 0.85rem',
        }}>
          Gere uma síntese acadêmica que organiza e relaciona todos os elementos do{' '}
          {synthesisDef.groupLabel.toLowerCase()}, preparando a transição para a próxima etapa.
        </p>
        <button
          onClick={() => onAskAI(buildSynthesisPrompt())}
          style={{
            background: 'var(--ai-subtle)',
            border: '1px solid var(--ai)',
            borderRadius: '6px', color: 'var(--ai)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.79rem', fontWeight: '700',
            padding: '0.48rem 0.95rem',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,156,191,0.18)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--ai-subtle)' }}
        >
          Gerar síntese com IA →
        </button>
      </div>

      {/* Next step CTA */}
      <div style={{
        marginTop: '3rem',
        padding: '1.6rem',
        background: nextPhaseChange
          ? 'linear-gradient(135deg, rgba(124,156,191,0.06), rgba(124,156,191,0.02))'
          : 'linear-gradient(135deg, rgba(184,146,42,0.06), rgba(184,146,42,0.02))',
        border: `1px solid ${nextPhaseChange ? 'rgba(124,156,191,0.25)' : 'rgba(184,146,42,0.22)'}`,
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '0.62rem', fontWeight: '800', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          marginBottom: '0.6rem',
        }}>
          {nextPhaseChange ? 'Do texto ao púlpito' : 'Próxima etapa'}
        </div>
        <p style={{
          fontSize: '0.87rem', color: 'var(--text-secondary)',
          lineHeight: '1.65', margin: '0 0 1.15rem',
          maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',
        }}>
          {synthesisDef.ctaDescription}
        </p>
        <button
          onClick={() => {
            const firstSection = getSectionsByGroup(nextGroup.id)[0]
            if (firstSection) onNavigate(firstSection.slug)
          }}
          style={{
            background: nextPhaseChange ? 'rgba(124,156,191,0.12)' : 'var(--accent-subtle)',
            border: `1px solid ${nextPhaseChange ? 'var(--ai)' : 'var(--accent)'}`,
            borderRadius: '7px',
            color: nextPhaseChange ? 'var(--ai)' : 'var(--accent)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.85rem', fontWeight: '700',
            padding: '0.65rem 1.5rem',
            letterSpacing: '0.01em',
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
