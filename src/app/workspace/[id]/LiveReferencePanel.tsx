'use client'

import { useMemo, useState } from 'react'
import type { Section } from '@/types/database'
import { getSectionBySlug } from '@/lib/workspace-sections'
import type { CollageItem } from '@/lib/collages-content'

interface Props {
  savedSections: Section[]
  onAskAI: (prompt: string) => void
}

interface ReferenceBlock {
  id: string
  label: string
  title: string
  content: string
  source: string
}

const REFERENCE_SOURCES = [
  { id: 'preparar', label: 'Preparar', slugs: ['preparacao_espiritual', 'preparar_leia_assimile', 'preparar_primeiras_impressoes', 'preparar_visao_geral'] },
  { id: 'contextual', label: 'Síntese contextual', slugs: ['contexto_historico', 'autor_destinatarios', 'ocasiao_proposito', 'genero_literario', 'estrutura_livro'] },
  { id: 'textual', label: 'Estrutura literária', slugs: ['texto_original', 'delimitacao_pericope', 'traducao_textual', 'analise_morfossintatica', 'termos_chave', 'estrutura_literaria'] },
  { id: 'teologico', label: 'Síntese teológica', slugs: ['contexto_canonico', 'progressao_revelacional', 'sintese'] },
  { id: 'colagens', label: 'Colagens', slugs: ['colagens'] },
]

function getCards(section: Section | undefined): Record<string, string> {
  const content = section?.content as Record<string, unknown> | null
  if (content && typeof content === 'object' && 'cards' in content) return content.cards as Record<string, string>
  return {}
}

function getCollages(section: Section | undefined): CollageItem[] {
  const content = section?.content as { type?: string; items?: CollageItem[] } | null
  if (content?.type === 'collages_workspace' && Array.isArray(content.items)) return content.items
  return []
}

function buildBlocks(savedSections: Section[]): ReferenceBlock[] {
  const blocks: ReferenceBlock[] = []

  for (const source of REFERENCE_SOURCES) {
    for (const slug of source.slugs) {
      if (slug === 'colagens') {
        const collages = getCollages(savedSections.find(section => section.slug === 'colagens'))
        collages.forEach(item => {
          blocks.push({
            id: `colagem:${item.id}`,
            label: source.label,
            title: item.title,
            content: item.content,
            source: [item.author, item.work, item.page && `p. ${item.page}`].filter(Boolean).join(' · ') || item.category,
          })
        })
        continue
      }

      const def = getSectionBySlug(slug)
      const section = savedSections.find(saved => saved.slug === slug)
      const cards = getCards(section)
      if (!def) continue

      def.cards.forEach(card => {
        const content = cards[card.id]?.trim()
        if (!content) return
        blocks.push({
          id: `${slug}:${card.id}`,
          label: source.label,
          title: card.title,
          content,
          source: def.shortTitle,
        })
      })
    }
  }

  return blocks
}

function transformPrompt(kind: string, block: ReferenceBlock): string {
  return [
    `Transforme a seguinte referência exegética em ${kind} para o sermão.`,
    '',
    `Fonte: ${block.label} · ${block.source}`,
    `Título: ${block.title}`,
    `Conteúdo: ${block.content}`,
    '',
    'A formulação deve nascer do texto bíblico, ser homilética, clara, cristocêntrica e pastoralmente útil.',
  ].join('\n')
}

export default function LiveReferencePanel({ savedSections, onAskAI }: Props) {
  const blocks = useMemo(() => buildBlocks(savedSections), [savedSections])
  const [enabledSources, setEnabledSources] = useState<Set<string>>(() => new Set(REFERENCE_SOURCES.map(source => source.id)))
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => new Set())
  const [collapsed, setCollapsed] = useState(false)

  const visibleBlocks = blocks.filter(block => {
    const source = REFERENCE_SOURCES.find(item => item.label === block.label)
    return source ? enabledSources.has(source.id) : true
  })
  const pinnedBlocks = visibleBlocks.filter(block => pinnedIds.has(block.id))
  const unpinnedBlocks = visibleBlocks.filter(block => !pinnedIds.has(block.id))
  const renderBlocks = [...pinnedBlocks, ...unpinnedBlocks]

  function toggleSource(id: string) {
    setEnabledSources(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function togglePin(id: string) {
    setPinnedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (collapsed) {
    return (
      <aside style={{ width: '42px', flexShrink: 0, borderRight: '1px solid var(--border-subtle)', background: 'var(--surface)', display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
        <button
          onClick={() => setCollapsed(false)}
          title="Abrir Referência Viva"
          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          ⇥
        </button>
      </aside>
    )
  }

  return (
    <aside style={{ width: '330px', flexShrink: 0, borderRight: '1px solid var(--border-subtle)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <header style={{ padding: '0.9rem 0.95rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--ai)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 900 }}>
              Referência Viva
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.35, marginTop: '0.18rem' }}>
              Preparação, síntese, colagens e âncoras exegéticas ao lado do sermão.
            </div>
          </div>
          <button onClick={() => setCollapsed(true)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.95rem' }}>
            ⇤
          </button>
        </div>
      </header>

      <div style={{ padding: '0.75rem 0.9rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, marginBottom: '0.45rem' }}>
          Referências ativas
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
          {REFERENCE_SOURCES.map(source => (
            <label key={source.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enabledSources.has(source.id)}
                onChange={() => toggleSource(source.id)}
                style={{ accentColor: 'var(--ai)' }}
              />
              {source.label}
            </label>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0.75rem 0.85rem 1rem' }}>
        {renderBlocks.length === 0 ? (
          <div style={{ border: '1px dashed var(--border-subtle)', borderRadius: '8px', padding: '1.4rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.55, textAlign: 'center' }}>
            Preencha Preparar, Inventio ou Colagens para alimentar a Referência Viva.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            {renderBlocks.map(block => {
              const pinned = pinnedIds.has(block.id)
              return (
                <article
                  key={block.id}
                  draggable
                  onDragStart={event => {
                    event.dataTransfer.setData('text/plain', block.content)
                    event.dataTransfer.effectAllowed = 'copy'
                  }}
                  style={{
                    border: `1px solid ${pinned ? 'var(--ai)' : 'var(--border-subtle)'}`,
                    background: pinned ? 'var(--ai-subtle)' : 'var(--surface-2)',
                    borderRadius: '8px',
                    padding: '0.7rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900 }}>
                        {block.label}
                      </div>
                      <h4 style={{ margin: '0.14rem 0 0', fontSize: '0.82rem', lineHeight: 1.3, color: 'var(--text-primary)', letterSpacing: 0 }}>
                        {block.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => togglePin(block.id)}
                      title={pinned ? 'Desafixar' : 'Fixar'}
                      style={{ background: 'transparent', border: 'none', color: pinned ? 'var(--ai)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      {pinned ? '●' : '○'}
                    </button>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {block.content}
                  </p>
                  <div style={{ marginTop: '0.45rem', color: 'var(--text-muted)', fontSize: '0.67rem' }}>
                    {block.source}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.55rem' }}>
                    {[
                      ['Divisão', 'uma divisão principal'],
                      ['Aplicação', 'uma aplicação pastoral'],
                      ['Introdução', 'uma introdução ou gancho'],
                      ['Ilustração', 'uma ilustração homilética'],
                    ].map(([label, kind]) => (
                      <button
                        key={label}
                        onClick={() => onAskAI(transformPrompt(kind, block))}
                        style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: '5px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.67rem', padding: '0.24rem 0.42rem' }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
