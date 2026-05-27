'use client'

import { useMemo, useState } from 'react'
import type { Project } from '@/types/database'
import { TOOL_AREAS, type ToolArea } from '@/lib/tools-content'

interface Props {
  project: Project
  activeSlug: string
  onNavigate: (slug: string) => void
  onAskAI: (prompt: string) => void
}

function buildPrompt(area: ToolArea, project: Project, query: string, basePrompt: string): string {
  return [
    `Ferramenta: ${area.title}`,
    `Papel da IA: ${area.aiRole}`,
    `Projeto atual: ${project.book} ${project.passage_ref} (${project.original_language})`,
    query.trim() ? `Pesquisa do usuário: ${query.trim()}` : '',
    '',
    basePrompt,
    '',
    'Responda em português do Brasil, com rigor reformado, referências bíblicas, autores relevantes e aplicação pastoral quando apropriado.',
  ].filter(Boolean).join('\n')
}

export default function ToolsWorkspace({ project, activeSlug, onNavigate, onAskAI }: Props) {
  const activeArea = useMemo(() => TOOL_AREAS.find(area => area.slug === activeSlug) ?? TOOL_AREAS[0], [activeSlug])
  const [query, setQuery] = useState('')

  function ask(prompt: string) {
    onAskAI(buildPrompt(activeArea, project, query, prompt))
  }

  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--background)', fontFamily: 'var(--font-sans)' }}>
      <aside style={{
        width: '218px',
        flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
        background: 'rgba(20,25,38,0.72)',
        padding: '1rem 0.85rem',
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.75rem' }}>
          Biblioteca inteligente
        </div>
        <div style={{ display: 'grid', gap: '0.45rem' }}>
          {TOOL_AREAS.map(area => {
            const active = area.slug === activeArea.slug
            return (
              <button
                key={area.slug}
                onClick={() => onNavigate(area.slug)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: `1px solid ${active ? area.color : 'var(--border-subtle)'}`,
                  background: active ? area.bgActive : 'transparent',
                  borderRadius: '7px',
                  padding: '0.62rem 0.7rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ fontSize: '0.82rem', color: active ? area.color : 'var(--text-secondary)', fontWeight: 800, lineHeight: 1.2 }}>
                  {area.shortTitle}
                </div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.35, marginTop: '0.18rem' }}>
                  {area.subtitle}
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '2.2rem clamp(1.4rem, 3vw, 2.4rem) 4rem' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.4rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', color: activeArea.color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.35rem' }}>
                Ferramentas
              </div>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', letterSpacing: 0, lineHeight: 1.15, marginBottom: '0.45rem' }}>
                {activeArea.title}
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '720px' }}>
                {activeArea.objective}
              </p>
            </div>
            <div style={{
              flexShrink: 0,
              border: `1px solid ${activeArea.color}`,
              background: activeArea.bgActive,
              color: activeArea.color,
              borderRadius: '7px',
              padding: '0.45rem 0.65rem',
              fontSize: '0.72rem',
              fontWeight: 800,
            }}>
              {project.book} {project.passage_ref}
            </div>
          </div>

          <section style={{
            border: `1px solid ${activeArea.color}`,
            background: 'var(--surface)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'stretch' }}>
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={activeArea.id === 'dicionario' ? 'Pesquisar termo, raiz, palavra grega/hebraica...' : 'Pesquisar tema, doutrina, autor, livro bíblico...'}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  padding: '0.72rem 0.85rem',
                  outline: 'none',
                }}
                onFocus={event => event.currentTarget.style.borderColor = activeArea.color}
                onBlur={event => event.currentTarget.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={() => ask(`Pesquise e organize uma resposta sobre: ${query || activeArea.title}.`)}
                style={{
                  background: activeArea.bgActive,
                  border: `1px solid ${activeArea.color}`,
                  borderRadius: '7px',
                  color: activeArea.color,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  padding: '0 0.95rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Pesquisar com IA
              </button>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)', gap: '1rem', alignItems: 'start' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>
                  Subáreas de pesquisa
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {activeArea.sections.map(section => (
                    <button
                      key={section}
                      onClick={() => {
                        setQuery(section)
                        ask(`Explique e desenvolva o tópico "${section}" dentro de ${activeArea.title}, relacionando com a passagem atual quando fizer sentido.`)
                      }}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.78rem',
                        padding: '0.34rem 0.58rem',
                      }}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.85rem' }}>
                  Visualização
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                  {activeArea.visualization.map((step, index) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      <div style={{
                        minWidth: '112px',
                        border: `1px solid ${index === 0 ? activeArea.color : 'var(--border-subtle)'}`,
                        background: index === 0 ? activeArea.bgActive : 'var(--surface-2)',
                        color: index === 0 ? activeArea.color : 'var(--text-secondary)',
                        borderRadius: '7px',
                        padding: '0.58rem 0.65rem',
                        fontSize: '0.76rem',
                        lineHeight: 1.35,
                        fontWeight: 700,
                        textAlign: 'center',
                      }}>
                        {step}
                      </div>
                      {index < activeArea.visualization.length - 1 && (
                        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>
                  Ações da IA
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.55rem' }}>
                  {activeArea.actions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => ask(action.prompt)}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${activeArea.color}`,
                        borderRadius: '7px',
                        color: activeArea.color,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        padding: '0.65rem 0.75rem',
                        textAlign: 'left',
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignSelf: 'start' }}>
              <div style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface)',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>
                  Capacidades
                </div>
                <div style={{ display: 'grid', gap: '0.45rem' }}>
                  {activeArea.capabilities.map(item => (
                    <div key={item} style={{ display: 'flex', gap: '0.45rem', alignItems: 'baseline', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.45 }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: activeArea.color, flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {activeArea.references.map(reference => (
                <div
                  key={reference.title}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface)',
                    borderRadius: '8px',
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>
                    {reference.title}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {reference.items.map(item => (
                      <span
                        key={item}
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '5px',
                          color: 'var(--text-secondary)',
                          fontSize: '0.74rem',
                          padding: '0.22rem 0.45rem',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
