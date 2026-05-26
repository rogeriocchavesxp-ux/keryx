'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { HelpEntry } from '@/lib/help-content'

interface HelpModalProps {
  entry: HelpEntry
  onClose: () => void
  onAskAI?: (prompt: string) => void
}

type TabId = 'overview' | 'how' | 'example' | 'advanced'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'how', label: 'Como Fazer' },
  { id: 'example', label: 'Exemplo' },
  { id: 'advanced', label: 'Dicas Avançadas' },
]

const sectionTitleStyle: CSSProperties = {
  fontSize: '0.74rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 800,
  marginBottom: '0.65rem',
}

const paragraphStyle: CSSProperties = {
  color: 'var(--text-secondary)',
  fontSize: '0.92rem',
  lineHeight: 1.75,
}

function buildPrompt(entry: HelpEntry): string {
  return [
    `Explique pedagogicamente como preencher o campo "${entry.titulo}" no workspace Keryx.`,
    'Contexto: exegese bíblica e homilética reformada.',
    'Inclua objetivo, passos práticos, perguntas de diagnóstico, erros comuns e um exemplo bíblico específico.',
  ].join(' ')
}

export default function HelpModal({ entry, onClose, onAskAI }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function askAI() {
    onAskAI?.(buildPrompt(entry))
    onClose()
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(6, 8, 13, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`help-title-${entry.id}`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        onClick={event => event.stopPropagation()}
        style={{
          width: 'min(680px, 100%)',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.38)',
        }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1rem 1.1rem 0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--ai)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Ajuda contextual
              </div>
              <h2
                id={`help-title-${entry.id}`}
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  lineHeight: 1.35,
                  fontWeight: 700,
                  letterSpacing: 0,
                  margin: 0,
                }}
              >
                {entry.titulo}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Fechar ajuda"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-2)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={event => {
                event.currentTarget.style.color = 'var(--text-primary)'
                event.currentTarget.style.borderColor = 'var(--border)'
              }}
              onMouseLeave={event => {
                event.currentTarget.style.color = 'var(--text-muted)'
                event.currentTarget.style.borderColor = 'var(--border-subtle)'
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.9rem' }}>
            {TABS.map(tab => {
              const active = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: active ? 'var(--accent-subtle)' : 'transparent',
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    borderRadius: '6px',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.34rem 0.62rem',
                    transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </header>

        <div style={{ padding: '1.1rem' }}>
          {activeTab === 'overview' && (
            <div>
              <div style={sectionTitleStyle}>Descrição</div>
              <p style={paragraphStyle}>{entry.descricao}</p>
              <div
                style={{
                  marginTop: '1rem',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: '3px solid var(--accent)',
                  borderRadius: '7px',
                  padding: '0.85rem 0.95rem',
                }}
              >
                <div style={{ ...sectionTitleStyle, marginBottom: '0.35rem', color: 'var(--accent)' }}>Objetivo</div>
                <p style={{ ...paragraphStyle, color: 'var(--text-primary)' }}>{entry.objetivo}</p>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div style={sectionTitleStyle}>Como a IA pode ajudar</div>
                <p style={paragraphStyle}>{entry.ajudaIA}</p>
              </div>
            </div>
          )}

          {activeTab === 'how' && (
            <div style={{ display: 'grid', gap: '1.1rem' }}>
              <section>
                <div style={sectionTitleStyle}>Passos práticos</div>
                <ol style={{ display: 'grid', gap: '0.55rem', paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {entry.comoFazer.map(step => (
                    <li key={step} style={{ paddingLeft: '0.2rem' }}>{step}</li>
                  ))}
                </ol>
              </section>

              <section>
                <div style={sectionTitleStyle}>Perguntas orientadoras</div>
                <ul style={{ display: 'grid', gap: '0.5rem', paddingLeft: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {entry.perguntas.map(question => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </section>

              <section>
                <div style={{ ...sectionTitleStyle, color: 'var(--error)' }}>Erros comuns a evitar</div>
                <ul style={{ display: 'grid', gap: '0.5rem', paddingLeft: '1.05rem', color: 'var(--error)', lineHeight: 1.65 }}>
                  {entry.erros.map(error => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'example' && (
            <div>
              <div style={sectionTitleStyle}>Exemplo concreto</div>
              <blockquote
                style={{
                  margin: 0,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: '3px solid var(--ai)',
                  borderRadius: '7px',
                  padding: '1rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '0.98rem',
                  lineHeight: 1.8,
                }}
              >
                {entry.exemplo}
              </blockquote>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div>
              <div style={sectionTitleStyle}>Dicas avançadas</div>
              <ul style={{ display: 'grid', gap: '0.6rem', paddingLeft: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {(entry.dicasAvancadas ?? ['Revise este campo depois de concluir a síntese exegética para garantir coerência com a Grande Ideia.']).map(tip => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <footer
          style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--surface)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '0.85rem 1.1rem',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={askAI}
            style={{
              background: 'var(--ai-subtle)',
              border: '1px solid var(--ai)',
              borderRadius: '7px',
              color: 'var(--ai)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.83rem',
              fontWeight: 800,
              padding: '0.55rem 0.85rem',
            }}
          >
            Gerar explicação com IA
          </button>
        </footer>
      </motion.div>
    </div>
  )
}
