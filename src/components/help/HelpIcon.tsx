'use client'

import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { HELP_CONTENT } from '@/lib/help-content'
import HelpModal from './HelpModal'

interface HelpIconProps {
  cardId: string
  onAskAI?: (prompt: string) => void
}

interface TooltipPosition {
  top: number
  left: number
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

export default function HelpIcon({ cardId, onAskAI }: HelpIconProps) {
  const entry = HELP_CONTENT[cardId]
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0 })

  if (!entry) return null

  function openModal(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setShowTooltip(false)
    setShowModal(true)
  }

  function handleMouseEnter() {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      })
    }
    setHovering(true)
    setShowTooltip(true)
  }

  function handleMouseLeave() {
    setHovering(false)
    setShowTooltip(false)
  }

  return (
    <>
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        onClick={event => event.stopPropagation()}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-label={`Abrir ajuda: ${entry.titulo}`}
          onClick={openModal}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'transparent',
            border: `1px solid ${hovering ? 'var(--ai)' : 'var(--border)'}`,
            color: hovering ? 'var(--ai)' : 'var(--text-muted)',
            fontSize: '0.65rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1,
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ?
        </button>
      </span>

      {showTooltip && (
        <div
          style={{
            position: 'fixed',
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 1100,
            width: 'min(260px, calc(100vw - 2rem))',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
            color: 'var(--text-secondary)',
            fontSize: '0.74rem',
            lineHeight: 1.45,
            padding: '0.5rem 0.6rem',
            pointerEvents: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {truncate(entry.descricao, 120)}
          <span style={{ color: 'var(--ai)', fontWeight: 700 }}> Clique para mais</span>
        </div>
      )}

      {showModal && (
        <HelpModal
          entry={entry}
          onClose={() => setShowModal(false)}
          onAskAI={onAskAI}
        />
      )}
    </>
  )
}
