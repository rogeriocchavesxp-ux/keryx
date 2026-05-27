'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────

type BlockType = 'introducao' | 'desenvolvimento' | 'transicao' | 'aplicacao' | 'conclusao'

interface SermonBlock {
  id: string
  type: BlockType
  title: string
  content: string
}

interface SermonBuilderContent {
  type: 'sermon_builder'
  blocks: SermonBlock[]
}

interface Props {
  project: Project
  userId: string
  existingSection: Section | undefined
  onUpdate: (section: Section) => void
  onAskAI: (prompt: string) => void
}

// ── Constants ──────────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: 'introducao',    label: 'Introdução' },
  { type: 'desenvolvimento', label: 'Desenvolvimento' },
  { type: 'transicao',    label: 'Transição' },
  { type: 'aplicacao',    label: 'Aplicação' },
  { type: 'conclusao',    label: 'Conclusão' },
]

const TYPE_COLOR: Record<BlockType, string> = {
  introducao:     'var(--accent)',
  desenvolvimento: 'var(--ai)',
  transicao:      'var(--text-muted)',
  aplicacao:      '#6db8a0',
  conclusao:      '#c47c5a',
}

const DEFAULT_BLOCKS: SermonBlock[] = [
  { id: 'b1', type: 'introducao',     title: 'Introdução',     content: '' },
  { id: 'b2', type: 'desenvolvimento', title: 'Desenvolvimento', content: '' },
  { id: 'b3', type: 'conclusao',      title: 'Conclusão',      content: '' },
]

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function dotColor(content: string): string {
  if (!content.trim()) return 'var(--border)'
  if (content.trim().length < 80) return 'var(--accent)'
  return 'var(--success)'
}

function blockPrompt(block: SermonBlock, project: Project): string {
  const ref = `${project.book} ${project.passage_ref}`
  const map: Record<BlockType, string> = {
    introducao:     `Redija uma introdução pastoral para o sermão de ${ref}. Capture atenção, revele a necessidade humana e conduza naturalmente ao texto. Tom: acessível, pastoral e cristocêntrico.`,
    desenvolvimento: `Desenvolva o ponto homilético "${block.title}" do sermão de ${ref}. Exponha o texto, argumente teologicamente e aplique pastoralmente. Progressão clara.`,
    transicao:      `Crie uma transição natural entre os movimentos do sermão de ${ref}. Resuma o que foi dito e abra o próximo ponto com força e fluidez.`,
    aplicacao:      `Desenvolva aplicações concretas para "${block.title}" a partir de ${ref}. Aplicações de fé, arrependimento, consolo e obediência — específicas, evangélicas, pastorais.`,
    conclusao:      `Redija a conclusão do sermão de ${ref}. Sintetize a ideia central, reforce o argumento e conduza o ouvinte a uma resposta bíblica em Cristo.`,
  }
  return map[block.type]
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SermonBuilderWorkspace({
  project, userId, existingSection, onUpdate, onAskAI,
}: Props) {
  const supabase = createClient()

  const loadBlocks = useCallback((): SermonBlock[] => {
    const c = existingSection?.content as SermonBuilderContent | null
    if (c?.type === 'sermon_builder' && Array.isArray(c.blocks) && c.blocks.length > 0) {
      return c.blocks
    }
    return DEFAULT_BLOCKS
  }, [existingSection])

  const [blocks, setBlocks] = useState<SermonBlock[]>(loadBlocks)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const blocksRef = useRef(blocks)
  blocksRef.current = blocks
  const sectionIdRef = useRef(existingSection?.id)
  sectionIdRef.current = existingSection?.id
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close menus on outside click
  useEffect(() => {
    const handler = () => { setActiveMenu(null); setAddOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const performSave = useCallback(async (current: SermonBlock[]) => {
    setSaving(true)
    const hasContent = current.some(b => b.content.trim().length > 0)
    const payload = {
      project_id: project.id,
      user_id: userId,
      slug: 'sermao_dispositio',
      module: 'dispositio' as const,
      title: 'Sermão · Disposição',
      content: { type: 'sermon_builder', blocks: current } as unknown as Record<string, unknown>,
      status: (hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
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

  function scheduleSave(updated: SermonBlock[]) {
    setBlocks(updated)
    blocksRef.current = updated
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => performSave(blocksRef.current), 1500)
  }

  function updateContent(id: string, content: string) {
    scheduleSave(blocksRef.current.map(b => b.id === id ? { ...b, content } : b))
  }

  function addBlock(type: BlockType) {
    const label = BLOCK_TYPES.find(t => t.type === type)!.label
    const newBlock: SermonBlock = { id: uid(), type, title: label, content: '' }
    scheduleSave([...blocksRef.current, newBlock])
    setAddOpen(false)
  }

  function moveBlock(id: string, dir: 'up' | 'down') {
    const idx = blocksRef.current.findIndex(b => b.id === id)
    if (idx < 0) return
    const next = [...blocksRef.current]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    scheduleSave(next)
  }

  function duplicateBlock(id: string) {
    const idx = blocksRef.current.findIndex(b => b.id === id)
    if (idx < 0) return
    const src = blocksRef.current[idx]
    const copy: SermonBlock = { ...src, id: uid(), title: src.title + ' (cópia)' }
    const next = [...blocksRef.current]
    next.splice(idx + 1, 0, copy)
    scheduleSave(next)
  }

  function deleteBlock(id: string) {
    scheduleSave(blocksRef.current.filter(b => b.id !== id))
    setActiveMenu(null)
  }

  function startRename(id: string, current: string) {
    setRenamingId(id)
    setRenameValue(current)
    setActiveMenu(null)
  }

  function commitRename(id: string) {
    const trimmed = renameValue.trim()
    if (trimmed) scheduleSave(blocksRef.current.map(b => b.id === id ? { ...b, title: trimmed } : b))
    setRenamingId(null)
  }

  const savedLabel = saving ? 'salvando…' : savedAt
    ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''

  return (
    <div style={{ padding: '2rem clamp(1.2rem, 3vw, 2.5rem) 5rem', maxWidth: '820px', margin: '0 auto' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--ai)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.3rem' }}>
          Sermão · Disposição
        </div>
        <h1 style={{ fontSize: '1.55rem', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.4rem' }}>
          Construtor Homilético
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '600px' }}>
          Organize o sermão em blocos modulares. Adicione, renomeie, reordene e desenvolva cada movimento da mensagem.
        </p>
        <div style={{ marginTop: '0.65rem', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {project.book} {project.passage_ref} · {savedLabel}
        </div>
      </div>

      {/* ── Blocks ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {blocks.map((block, idx) => {
          const color = TYPE_COLOR[block.type]
          const isFirst = idx === 0
          const isLast = idx === blocks.length - 1
          const menuOpen = activeMenu === block.id

          return (
            <div
              key={block.id}
              style={{
                border: `1px solid var(--border-subtle)`,
                borderLeft: `3px solid ${color}`,
                borderRadius: '7px',
                background: 'var(--surface)',
                overflow: 'visible',
                position: 'relative',
              }}
            >
              {/* Block header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                {/* Status dot */}
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                  background: dotColor(block.content),
                }} />

                {/* Title */}
                {renamingId === block.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(block.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename(block.id)
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    style={{
                      flex: 1, background: 'var(--surface-2)', border: `1px solid ${color}`,
                      borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit',
                      fontSize: '0.88rem', fontWeight: 600, padding: '0.15rem 0.45rem', outline: 'none',
                    }}
                  />
                ) : (
                  <span
                    style={{ flex: 1, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'text' }}
                    onDoubleClick={() => startRename(block.id, block.title)}
                  >
                    {block.title}
                  </span>
                )}

                {/* Type badge */}
                <span style={{
                  fontSize: '0.6rem', color, textTransform: 'uppercase',
                  letterSpacing: '0.08em', fontWeight: 700, opacity: 0.7, flexShrink: 0,
                }}>
                  {BLOCK_TYPES.find(t => t.type === block.type)?.label}
                </span>

                {/* ? help */}
                <button
                  onClick={() => onAskAI(`Me oriente sobre como desenvolver "${block.title}" no sermão de ${project.book} ${project.passage_ref}. Dê princípios homiléticos, exemplos e perguntas reflexivas.`)}
                  style={{
                    width: '22px', height: '22px', background: 'transparent',
                    border: '1px solid var(--border-subtle)', borderRadius: '50%',
                    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  title="Ajuda"
                >?</button>

                {/* Gerar */}
                <button
                  onClick={() => onAskAI(blockPrompt(block, project))}
                  style={{
                    background: 'transparent', border: `1px solid ${color}`, borderRadius: '5px',
                    color, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.72rem', fontWeight: 700, padding: '0.18rem 0.6rem', flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `rgba(124,156,191,0.08)`}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Gerar
                </button>

                {/* Actions menu toggle */}
                <button
                  onMouseDown={e => { e.stopPropagation(); setActiveMenu(menuOpen ? null : block.id); setAddOpen(false) }}
                  style={{
                    width: '24px', height: '24px', background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '4px', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--surface-2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                  title="Ações"
                >⋮</button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                      position: 'absolute', top: '38px', right: '0.5rem', zIndex: 100,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: '7px', padding: '0.3rem', minWidth: '170px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}
                  >
                    {([
                      { label: 'Renomear', action: () => startRename(block.id, block.title) },
                      { label: 'Mover para cima', action: () => { moveBlock(block.id, 'up'); setActiveMenu(null) }, disabled: isFirst },
                      { label: 'Mover para baixo', action: () => { moveBlock(block.id, 'down'); setActiveMenu(null) }, disabled: isLast },
                      { label: 'Duplicar seção', action: () => { duplicateBlock(block.id); setActiveMenu(null) } },
                      { label: 'Excluir seção', action: () => deleteBlock(block.id), danger: true },
                    ] as Array<{ label: string; action: () => void; disabled?: boolean; danger?: boolean }>).map(item => (
                      <button
                        key={item.label}
                        onClick={item.disabled ? undefined : item.action}
                        style={{
                          width: '100%', background: 'transparent', border: 'none',
                          textAlign: 'left', padding: '0.42rem 0.65rem', borderRadius: '5px',
                          color: item.danger ? 'var(--error)' : item.disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                          cursor: item.disabled ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit', fontSize: '0.8rem',
                          opacity: item.disabled ? 0.4 : 1,
                        }}
                        onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'var(--surface-3)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content area */}
              <textarea
                value={block.content}
                onChange={e => updateContent(block.id, e.target.value)}
                placeholder={`Escreva o ${block.title.toLowerCase()}...`}
                style={{
                  width: '100%', minHeight: '110px',
                  background: 'transparent', border: 'none',
                  color: 'var(--text-primary)', fontFamily: 'inherit',
                  fontSize: '0.92rem', lineHeight: 1.75,
                  padding: '0.85rem 1rem', resize: 'vertical', outline: 'none',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* ── Add section ───────────────────────────────────────────────────── */}
      <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
        <button
          onMouseDown={e => { e.stopPropagation(); setAddOpen(o => !o); setActiveMenu(null) }}
          style={{
            background: 'var(--surface)', border: '1px dashed var(--border)',
            borderRadius: '7px', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.82rem', padding: '0.5rem 1.1rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Adicionar seção
        </button>

        {addOpen && (
          <div
            onMouseDown={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: '110%', left: 0, zIndex: 100,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '7px', padding: '0.3rem', minWidth: '180px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {BLOCK_TYPES.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  textAlign: 'left', padding: '0.42rem 0.65rem', borderRadius: '5px',
                  color: TYPE_COLOR[type], cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: TYPE_COLOR[type], flexShrink: 0 }} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
