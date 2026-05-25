'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'

interface SectionDef {
  slug: string
  title: string
}

interface Props {
  projectId: string
  userId: string
  sectionDef: SectionDef
  existingSection: Section | undefined
  project: Project
  onUpdate: (section: Section) => void
  onSendToAI: (text: string) => void
}

export default function SectionEditor({
  projectId,
  userId,
  sectionDef,
  existingSection,
  project,
  onUpdate,
  onSendToAI,
}: Props) {
  const supabase = createClient()
  const [content, setContent] = useState(existingSection?.ai_output ?? '')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setContent(existingSection?.ai_output ?? '')
  }, [sectionDef.slug, existingSection?.ai_output])

  function scheduleAutosave(value: string) {
    setContent(value)
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(value), 1500)
  }

  async function save(value: string) {
    setSaving(true)
    const payload = {
      project_id: projectId,
      user_id: userId,
      slug: sectionDef.slug,
      module: 'inventio' as const,
      title: sectionDef.title,
      ai_output: value,
      status: value.trim() ? ('draft' as const) : ('empty' as const),
    }

    if (existingSection?.id) {
      const { data } = await supabase
        .from('sections')
        .update(payload)
        .eq('id', existingSection.id)
        .select()
        .single()
      if (data) onUpdate(data as Section)
    } else {
      const { data } = await supabase
        .from('sections')
        .insert(payload)
        .select()
        .single()
      if (data) onUpdate(data as Section)
    }

    setSaving(false)
    setSaved(true)
  }

  const moduleLabel: Record<string, string> = {
    contexto_historico: 'Descreva o contexto histórico-cultural do livro/carta: período, situação político-religiosa, costumes relevantes.',
    autor_destinatarios: 'Quem escreveu? Para quem? O que sabemos sobre o autor e os destinatários com base no texto e fontes externas?',
    ocasiao_proposito: 'Qual a ocasião que motivou a escrita? Qual o propósito declarado ou implícito?',
    genero_literario: 'Identifique o gênero do livro e da perícope: narrativa, epistolar, profético, apocalíptico, sapiencial, etc.',
    estrutura_livro: 'Apresente a estrutura do livro/carta com suas divisões principais.',
    delimitacao_pericope: `Delimite a perícope de ${project.book} ${project.passage_ref}. Justifique os limites com base em marcadores textuais, mudanças de tema e conectivos.`,
    traducao_textual: 'Apresente sua tradução da perícope. Indique variantes textuais relevantes e decisões de crítica textual.',
    analise_morfossintatica: 'Analise as formas verbais, substantivos e estruturas sintáticas determinantes para a interpretação.',
    termos_chave: 'Selecione os termos-chave da perícope e analise cada um segundo os 5 tópicos comuns: definição, comparação, relação, circunstâncias e testemunho.',
    estrutura_literaria: 'Identifique a estrutura literária: paralelismos, quiasmos, inclusio, progressão. Para narrativas: atos, cenas e tensão dramática.',
    contexto_canonico: 'Como esta passagem se relaciona com o restante do livro e do cânone? Paralelos e citações do AT/NT.',
    progressao_revelacional: 'Como esta perícope avança na progressão da revelação de Deus? Tipologia, cumprimento, promessa.',
    sintese: 'A Grande Ideia do texto. A Mensagem do texto. O Conceito que o texto está ensinando. Os Conceitos que o texto está confrontando.',
  }

  const placeholder = moduleLabel[sectionDef.slug] ?? 'Escreva suas notas aqui...'

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          {sectionDef.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          {project.book} {project.passage_ref} · {project.original_language}
        </p>
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => onSendToAI(`${sectionDef.title}\n\nTexto: ${project.book} ${project.passage_ref}\n\n${notes || placeholder}`)}
          style={{
            background: 'var(--ai-subtle)',
            border: '1px solid var(--ai)',
            color: 'var(--ai)',
            padding: '0.4rem 0.9rem',
            borderRadius: '6px', fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600',
          }}
        >
          Perguntar à IA
        </button>
        <button
          onClick={() => onSendToAI(`Gere ${sectionDef.title} para ${project.book} ${project.passage_ref}`)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: '0.4rem 0.9rem',
            borderRadius: '6px', fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Gerar com IA
        </button>
        <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {saving ? 'Salvando...' : saved ? 'Salvo' : ''}
        </div>
      </div>

      {/* Notes textarea */}
      <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>
        Suas anotações
      </div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: '120px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          lineHeight: '1.65',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          marginBottom: '1.5rem',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--border)'}
      />

      {/* AI output area */}
      {content && (
        <>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--ai)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ai)', display: 'inline-block' }} />
            Resposta da IA
          </div>
          <textarea
            value={content}
            onChange={e => scheduleAutosave(e.target.value)}
            style={{
              width: '100%',
              minHeight: '280px',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem 1.1rem',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              lineHeight: '1.75',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'var(--font-serif)',
              boxSizing: 'border-box',
            }}
          />
        </>
      )}

      {!content && (
        <div style={{
          border: '1px dashed var(--border)',
          borderRadius: '8px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}>
          Use "Gerar com IA" para que o Keryx produza o conteúdo desta seção,<br />
          ou "Perguntar à IA" para fazer perguntas específicas.
        </div>
      )}
    </div>
  )
}
