'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────

type BlockType = 'introducao' | 'desenvolvimento' | 'transicao' | 'aplicacao' | 'conclusao'

interface Subponto {
  id: string
  text: string
  notes?: string
}

interface PontoPrincipal {
  id: string
  text: string
  notes?: string
  subpontos: Subponto[]
  ilustracao: string
  ilustracaoNotes?: string
  aplicacao: string
  aplicacaoNotes?: string
}

interface SermonBlock {
  id: string
  type: BlockType
  title: string
  content: string
  pontos?: PontoPrincipal[]
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

// ── Helpers ────────────────────────────────────────────────────────────────

function mkId() { return Math.random().toString(36).slice(2, 10) }

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
    [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I'],
  ]
  let r = '', v = n
  for (const [val, sym] of map) { while (v >= val) { r += sym; v -= val } }
  return r
}

function defaultPontos(): PontoPrincipal[] {
  return [{ id: mkId(), text: '', notes: '', subpontos: [{ id: mkId(), text: '', notes: '' }], ilustracao: '', ilustracaoNotes: '', aplicacao: '', aplicacaoNotes: '' }]
}

function normalizePontos(raw: unknown): PontoPrincipal[] {
  if (Array.isArray(raw) && raw.length > 0) return raw as PontoPrincipal[]
  return defaultPontos()
}

// ── Constants ──────────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: 'introducao',      label: 'Introdução' },
  { type: 'desenvolvimento', label: 'Desenvolvimento' },
  { type: 'transicao',      label: 'Transição' },
  { type: 'aplicacao',      label: 'Aplicação' },
  { type: 'conclusao',      label: 'Conclusão' },
]

const TYPE_COLOR: Record<BlockType, string> = {
  introducao:      'var(--accent)',
  desenvolvimento: 'var(--ai)',
  transicao:       'var(--text-muted)',
  aplicacao:       '#6db8a0',
  conclusao:       '#c47c5a',
}

const DEFAULT_BLOCKS: SermonBlock[] = [
  { id: 'b1', type: 'introducao',      title: 'Introdução',      content: '' },
  { id: 'b2', type: 'desenvolvimento', title: 'Desenvolvimento', content: '', pontos: defaultPontos() },
  { id: 'b3', type: 'conclusao',       title: 'Conclusão',       content: '' },
]

// ── Preset: A Presença de Deus em Todas as Circunstâncias — Gn 39.1-23 ────

const PRESET_GN39: SermonBlock[] = [
  {
    id: mkId(), type: 'introducao', title: 'Introdução',
    content: `ABERTURA: O tema central do capítulo 39 é a presença de Deus.
A expressão "Deus estava com..." aparece 4x (vv. 2, 3, 21, 23)

A PERCEPÇÃO EQUIVOCADA DA PRESENÇA DE DEUS GERA CONSEQUÊNCIAS:
• Instabilidade emocional: medo, culpa ou vergonha
• Coragem para praticar o erro
• Autossuficiência: casamento, educação dos filhos e no trabalho

TRANSIÇÃO: Deus está presente em todas as circunstâncias`,
  },
  {
    id: mkId(), type: 'transicao', title: 'Contextualização',
    content: `O texto começa dizendo que José foi LEVADO para o Egito.

Personagens:
• José — jovem sonhador, amado do pai
• Potifar — oficial de Faraó, comandante da guarda, egípcio (v. 1)

Ambiente: Egito — centro do poder econômico mundial; distante da família

Enredo:
• José traído pelos irmãos → poço → escravo dos ismaelitas
• Agora escravo de Potifar, desce ao Egito

PROPOSIÇÃO: A presença de Deus não depende das circunstâncias. Deus as governa.`,
  },
  {
    id: mkId(), type: 'desenvolvimento', title: 'Desenvolvimento', content: '',
    pontos: [
      {
        id: mkId(),
        text: 'DEUS ESTÁ PRESENTE NA PROSPERIDADE (v. 1-6a)',
        notes: '',
        subpontos: [
          {
            id: mkId(),
            text: 'Na Bíblia, prosperidade não é ausência de sofrimento — é o sucesso na missão de Deus',
            notes: 'Não é status. Não é riqueza. Derek Kidner: "é a palavra usada para o êxito da missão de Eliézer em 24:21,40, e para o sofrimento do Servo em Isaías 53:10; ela fala de realização e cumprimento, e não de status."',
          },
          {
            id: mkId(),
            text: 'Padrão quíntuplo (cf. Gn 12): Presença → Prosperidade → Testemunho externo → Favor → Bênção ao entorno (vv. 2-5)',
            notes: 'v.2a Presença: "O SENHOR estava com José"\nv.2b Prosperidade: tsalach — Hifil causativo, o SENHOR é o agente, não José\nv.3 Testemunho externo: "seu senhor viu que o SENHOR era com ele"\nv.4 Favor/Promoção: "José achou graça... o constituiu sobre a sua casa"\nv.5 Bênção ao entorno: "o SENHOR abençoou a casa do egípcio por causa de José"',
          },
          {
            id: mkId(),
            text: 'Sidney Greidanus: "Aqui o nome Yahweh aparece no mais incerto momento da vida de José. Está mesmo sozinho?"',
            notes: '',
          },
        ],
        ilustracao: 'O crente é como árvore frutífera. O justo que medita na lei do Senhor "é como árvore plantada junto a uma corrente de águas, que, no devido tempo, dá o seu fruto, e cuja folhagem não murcha; e tudo o que ele faz será bem-sucedido." (Sl 1.3). Assim como a árvore é alimentada pela corrente de águas, o crente é alimentado por Deus.',
        ilustracaoNotes: 'tsalach em Sl 1.3 = mesmo termo de Gn 39.2,3,23. José é o Salmo 1 em carne e osso.',
        aplicacao: 'Assim como Deus fez com José, Ele nos faz mordomos: do conhecimento, da família, dos filhos, do trabalho, da empresa. Tudo pertence ao Senhor. São ferramentas para o avanço do Reino, para a proclamação do Evangelho, para que os outros possam ver que Deus está conosco.',
        aplicacaoNotes: '',
      },
      {
        id: mkId(),
        text: 'DEUS ESTÁ PRESENTE NA FALSIDADE (v. 6b-18)',
        notes: 'O QUE É FALSIDADE? Falsidade é a distorção da verdade — fabricar evidências, construir aparências, fazer o inocente parecer culpado. Toda falsidade é uma tentativa de substituir a verdade de Deus por uma narrativa humana. Origem: Éden, a serpente distorcendo a verdade.',
        subpontos: [
          {
            id: mkId(),
            text: 'A esposa de Potifar cometeu falsidade: assediou insistentemente (vv. 7,10), fabricou evidências, construiu narrativa com prova falsa (vv. 13-18)',
            notes: 'Pseudomarturia: testemunho forjado com evidência física. A roupa de José transformada em "prova". A virtude dele (a fuga) invertida em evidência do crime que não cometeu.',
          },
          {
            id: mkId(),
            text: 'José sofreu as consequências: era inocente, fugiu do pecado, mas foi condenado à prisão — a falsidade destrói reputações, confiança, relacionamentos',
            notes: 'Paralelo tipológico: Mt 26.59-60 — Jesus condenado pelo mesmo padrão de pseudomarturia. O inocente condenado pela forma do testemunho, não pela substância da verdade.',
          },
          {
            id: mkId(),
            text: 'Deus presente na resposta de José: lealdade, gratidão, temor ao Senhor — "Como pecaria contra Deus?" (v. 9b)',
            notes: 'Não foi para não perder posição. Não foi para sustentar reputação. Não foi para manter privilégios. A única razão foi o amor a Deus.\nBruce Waltke & Cathi Fredericks, Gênesis, p. 645.',
          },
        ],
        ilustracao: '',
        ilustracaoNotes: '',
        aplicacao: `FALSIDADE SOFRIDA — É fácil conectar-se com José:
• Uma demissão injusta; uma traição sofrida
• Não temos como controlar a falsidade do outro — José não controlou
• Não precisamos provar o contrário a todo custo — a verdade não depende da nossa defesa
• Confie no justo Juiz: "A mim me pertence a vingança; eu recompensarei, diz o Senhor" (Rm 12.19)
• Deus estava presente com José na falsidade — está presente conosco também

FALSIDADE COMETIDA — Difícil é perceber nossa falsidade:
• Agimos falsamente quando julgamos pela aparência — construindo histórias a partir do que desejamos
• Agimos falsamente quando produzimos provas — literais ou abstratas — para fazer o inocente parecer culpado
• A falsidade nasce da inveja, da cobiça e da obsessão — desejos contrariados que se tornam destruição (Tg 1.15)
• Princípio: provas devem ser evidências, não construções`,
        aplicacaoNotes: '',
      },
      {
        id: mkId(),
        text: 'DEUS ESTÁ PRESENTE NA ADVERSIDADE (v. 19-23)',
        notes: '',
        subpontos: [
          {
            id: mkId(),
            text: 'As adversidades são inevitáveis — do latim adversus: "virado contra você" — pessoas, circunstâncias, sistemas, acusações (cf. Catecismo, pergunta 20)',
            notes: 'adversitas = ad + vertere = virado contra. Problema, luta, doença, desemprego, injustiça, prisão. O adversário é o que está posicionado de frente para impedir o avanço.',
          },
          {
            id: mkId(),
            text: 'O mesmo padrão quíntuplo se repete na prisão: Presença → Hesed → Favor → Promoção → tsalach (vv. 21-23)',
            notes: 'v.21a Presença: "O SENHOR era com José"\nv.21b Hesed: "lhe mostrou misericórdia" = estendeu hesed — fidelidade aliancial dentro da prisão\nv.21c Favor do carcereiro\nv.22 Promoção: todos os presos confiados a José\nv.23 tsalach: "Tudo o que ele fazia, o SENHOR prosperava"',
          },
          {
            id: mkId(),
            text: 'As adversidades revelam o nosso Deus — José foi íntegro na casa de Potifar e na CASA da prisão (beit hassohar)',
            notes: 'beit hassohar = casa da prisão. Não um buraco — uma estrutura. E dentro dessa casa o SENHOR estava: transformando a casa da prisão em casa da presença.',
          },
        ],
        ilustracao: '',
        ilustracaoNotes: '',
        aplicacao: 'Deus exaltou José da prisão ao palácio — e esse padrão encontra seu cumprimento em Cristo, exaltado da cruz ao trono.',
        aplicacaoNotes: '',
      },
    ],
  },
  {
    id: mkId(), type: 'conclusao', title: 'Conclusão',
    content: `Conexão cristológica: José acusado injustamente, preso sendo inocente, eventualmente exaltado — aponta para Cristo. O mais inocente foi o mais condenado. A presença de Deus não o livrou da cruz — o sustentou através dela e o exaltou.

Aquele que esteve com José na escravidão, na falsidade e na prisão — veio Ele mesmo ao cativeiro, sofreu Ele mesmo a falsidade, desceu Ele mesmo à morte — para que sua presença conosco fosse eterna.

"Emanuel — Deus conosco." (Mt 1.23)`,
  },
]

function blockHasContent(block: SermonBlock): boolean {
  if (block.type === 'desenvolvimento') {
    return (block.pontos ?? []).some(p =>
      p.text.trim() || p.subpontos.some(s => s.text.trim()) || p.ilustracao.trim() || p.aplicacao.trim()
    )
  }
  return block.content.trim().length > 0
}

function dotColor(block: SermonBlock): string {
  if (!blockHasContent(block)) return 'var(--border)'
  if (block.type === 'desenvolvimento') {
    const allFilled = (block.pontos ?? []).every(p => p.text.trim() && p.subpontos.some(s => s.text.trim()))
    return allFilled ? 'var(--success)' : 'var(--accent)'
  }
  return block.content.trim().length < 80 ? 'var(--accent)' : 'var(--success)'
}

function blockPrompt(block: SermonBlock, project: Project): string {
  const ref = `${project.book} ${project.passage_ref}`
  const map: Record<BlockType, string> = {
    introducao:      `Redija uma introdução pastoral para o sermão de ${ref}. Capture atenção, revele a necessidade humana e conduza naturalmente ao texto.`,
    desenvolvimento: `Sugira pontos principais para o sermão de ${ref}. Cada ponto deve ser claro, teológico, progressivo e derivado do texto.`,
    transicao:       `Crie uma transição natural entre os movimentos do sermão de ${ref}. Resuma o que foi dito e abra o próximo ponto.`,
    aplicacao:       `Desenvolva aplicações concretas para "${block.title}" a partir de ${ref}. Específicas, evangélicas e pastorais.`,
    conclusao:       `Redija a conclusão do sermão de ${ref}. Sintetize a ideia central e conduza o ouvinte a uma resposta bíblica em Cristo.`,
  }
  return map[block.type]
}

// ── ContextMenu ────────────────────────────────────────────────────────────

interface CtxItem {
  label?: string
  icon?: string
  action?: () => void
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

function ContextMenu({ items, onClose, style }: {
  items: CtxItem[]
  onClose: () => void
  style?: React.CSSProperties
}) {
  return (
    <div
      onMouseDown={e => e.stopPropagation()}
      style={{
        position: 'absolute', zIndex: 200,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '0.28rem',
        minWidth: '192px', boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
        ...style,
      }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.22rem 0.4rem' }} />
        ) : (
          <button
            key={i}
            onClick={() => { if (!item.disabled && item.action) { item.action(); onClose() } }}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              textAlign: 'left', padding: '0.42rem 0.62rem', borderRadius: '5px',
              color: item.danger ? 'var(--error)' : item.disabled ? 'var(--border)' : 'var(--text-secondary)',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: '0.8rem', opacity: item.disabled ? 0.4 : 1,
              display: 'flex', gap: '0.5rem', alignItems: 'center',
            }}
            onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'var(--surface-3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {item.icon && (
              <span style={{ opacity: 0.6, minWidth: '13px', fontSize: '0.72rem', lineHeight: 1 }}>
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        )
      )}
    </div>
  )
}

// ── NoteArea ───────────────────────────────────────────────────────────────

function NoteArea({ value, onChange, onAskAI, aiPrompt, color = 'var(--ai)' }: {
  value: string
  onChange: (v: string) => void
  onAskAI: (p: string) => void
  aiPrompt: string
  color?: string
}) {
  return (
    <div style={{
      background: `${color}08`,
      borderRadius: '5px',
      padding: '0.5rem 0.62rem 0.35rem',
      marginTop: '0.25rem',
    }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Explicação, argumento, citação, referência bíblica, observação pastoral, lembrete de pregação…"
        autoFocus
        rows={3}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          color: 'var(--text-primary)', fontFamily: 'inherit',
          fontSize: '0.82rem', lineHeight: 1.7,
          resize: 'vertical', outline: 'none', padding: 0,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.12rem' }}>
        <button
          onClick={() => onAskAI(aiPrompt)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color, fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          ✦ Gerar com IA
        </button>
      </div>
    </div>
  )
}

// ── DesenvolvimentoEditor ─────────────────────────────────────────────────

interface DevEditorProps {
  pontos: PontoPrincipal[]
  project: Project
  onUpdate: (pontos: PontoPrincipal[]) => void
  onAskAI: (prompt: string) => void
}

function DesenvolvimentoEditor({ pontos, project, onUpdate, onAskAI }: DevEditorProps) {
  const ref = `${project.book} ${project.passage_ref}`
  const [expanded,        setExpanded]        = useState<Set<string>>(() => new Set([pontos[0]?.id].filter(Boolean)))
  const [openNotes,       setOpenNotes]       = useState<Set<string>>(new Set())
  const [hoveredSubId,    setHoveredSubId]    = useState<string | null>(null)
  const [openSubMenuId,   setOpenSubMenuId]   = useState<string | null>(null)
  const [hoveredPontoId,  setHoveredPontoId]  = useState<string | null>(null)
  const [openPontoMenuId, setOpenPontoMenuId] = useState<string | null>(null)
  const [hoveredSection,  setHoveredSection]  = useState<string | null>(null)

  useEffect(() => {
    if (!openSubMenuId && !openPontoMenuId) return
    function close() { setOpenSubMenuId(null); setOpenPontoMenuId(null) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [openSubMenuId, openPontoMenuId])

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const toggleNote = (key: string) =>
    setOpenNotes(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })

  // ── Pontos CRUD

  function addPonto() {
    const p: PontoPrincipal = { id: mkId(), text: '', notes: '', subpontos: [{ id: mkId(), text: '', notes: '' }], ilustracao: '', ilustracaoNotes: '', aplicacao: '', aplicacaoNotes: '' }
    setExpanded(prev => new Set([...prev, p.id]))
    onUpdate([...pontos, p])
  }

  function patch(id: string, data: Partial<PontoPrincipal>) {
    onUpdate(pontos.map(p => p.id === id ? { ...p, ...data } : p))
  }

  function movePonto(id: string, dir: 'up' | 'down') {
    const i = pontos.findIndex(p => p.id === id)
    if (i < 0) return
    const arr = [...pontos]
    const swap = dir === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    onUpdate(arr)
  }

  function deletePonto(id: string) { onUpdate(pontos.filter(p => p.id !== id)) }

  function demotePonto(id: string) {
    const i = pontos.findIndex(p => p.id === id)
    if (i <= 0) return
    const target = pontos[i]
    const arr = pontos.filter(p => p.id !== id)
    arr[i - 1] = { ...arr[i - 1], subpontos: [...arr[i - 1].subpontos, { id: mkId(), text: target.text, notes: '' }] }
    onUpdate(arr)
  }

  // ── Subpontos CRUD

  function addSubponto(pontoId: string) {
    const p = pontos.find(p => p.id === pontoId)!
    if (p.subpontos.length >= 7) return
    patch(pontoId, { subpontos: [...p.subpontos, { id: mkId(), text: '', notes: '' }] })
  }

  function patchSub(pontoId: string, subId: string, data: Partial<Subponto>) {
    const p = pontos.find(p => p.id === pontoId)!
    patch(pontoId, { subpontos: p.subpontos.map(s => s.id === subId ? { ...s, ...data } : s) })
  }

  function moveSub(pontoId: string, subId: string, dir: 'up' | 'down') {
    const p = pontos.find(p => p.id === pontoId)!
    const i = p.subpontos.findIndex(s => s.id === subId)
    if (i < 0) return
    const arr = [...p.subpontos]
    const swap = dir === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    patch(pontoId, { subpontos: arr })
  }

  function removeSub(pontoId: string, subId: string) {
    const p = pontos.find(p => p.id === pontoId)!
    patch(pontoId, { subpontos: p.subpontos.filter(s => s.id !== subId) })
  }

  function promoteSub(pontoId: string, subId: string) {
    const i = pontos.findIndex(p => p.id === pontoId)
    const p = pontos[i]
    const sub = p.subpontos.find(s => s.id === subId)!
    const newPonto: PontoPrincipal = { id: mkId(), text: sub.text, notes: sub.notes ?? '', subpontos: [], ilustracao: '', ilustracaoNotes: '', aplicacao: '', aplicacaoNotes: '' }
    const arr = pontos.map(pt => pt.id === pontoId ? { ...pt, subpontos: pt.subpontos.filter(s => s.id !== subId) } : pt)
    arr.splice(i + 1, 0, newPonto)
    setExpanded(prev => new Set([...prev, newPonto.id]))
    onUpdate(arr)
  }

  // ── AI prompts

  function aiPonto(p: PontoPrincipal) {
    const ctx = p.text.trim() ? `"${p.text}"` : 'este ponto'
    onAskAI(`Avalie e melhore o ponto principal ${ctx} do sermão de ${ref}. O ponto deve ser claro, arguir a partir do texto e ter progressão lógica. Sugira também subpontos e estrutura de desenvolvimento.`)
  }

  function aiSubpontos(p: PontoPrincipal) {
    onAskAI(`Gere subpontos para o ponto "${p.text || 'principal'}" do sermão de ${ref}. Liste argumentos e evidências textuais que desenvolvam esse ponto com clareza e fidelidade exegética.`)
  }

  function aiSubponto(p: PontoPrincipal, s: Subponto) {
    const ctx = s.text.trim() ? `"${s.text}"` : 'este subponto'
    onAskAI(`Desenvolva o subponto ${ctx} dentro do ponto "${p.text || 'principal'}" do sermão de ${ref}. Argumento textual, explicação e evidência bíblica em linguagem pastoral.`)
  }

  function aiIlustracao(p: PontoPrincipal) {
    onAskAI(`Sugira uma ilustração, analogia ou exemplo histórico para o ponto "${p.text || 'principal'}" do sermão de ${ref}. Breve, pastoral e conectada ao texto — ilumina sem dominar.`)
  }

  function aiAplicacao(p: PontoPrincipal) {
    onAskAI(`Desenvolva aplicações pastorais para o ponto "${p.text || 'principal'}" do sermão de ${ref}. Como confronta? Como consola? Como chama à fé? Como revela Cristo? Como transforma o ouvinte?`)
  }

  function aiRevisao() {
    const sumario = pontos.map((p, i) => `${i + 1}. ${p.text || '(sem título)'}`).join('; ')
    onAskAI(`Revise a coerência homilética deste desenvolvimento do sermão de ${ref}. Pontos: ${sumario}. Avalie progressão lógica, cristocentrismo, fidelidade à perícope, equilíbrio exposição/aplicação e risco de moralismo.`)
  }

  const secLabel: React.CSSProperties = {
    fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text-muted)',
  }

  const ghostBtn = (label: string, onClick: () => void, colorHover = 'var(--ai)') => (
    <button
      onClick={onClick}
      style={{
        background: 'transparent', border: 'none', borderRadius: '3px',
        padding: '0.1rem 0.3rem', cursor: 'pointer',
        color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'inherit', lineHeight: 1,
      }}
      onMouseEnter={e => e.currentTarget.style.color = colorHover}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
    >{label}</button>
  )

  const AI_COLOR = 'var(--ai)'

  return (
    <div style={{ padding: '0.5rem 0.85rem 1rem' }}>

      {pontos.map((ponto, pi) => {
        const isOpen         = expanded.has(ponto.id)
        const isFirst        = pi === 0
        const isLast         = pi === pontos.length - 1
        const hasText        = ponto.text.trim().length > 0
        const subCount       = ponto.subpontos.length
        const pontoNoteKey   = `${ponto.id}:ponto`
        const iluNoteKey     = `${ponto.id}:ilu`
        const aplNoteKey     = `${ponto.id}:apl`
        const pontoNoteOpen  = openNotes.has(pontoNoteKey)
        const pontoHasNote   = !!(ponto.notes?.trim())
        const isPontoHovered = hoveredPontoId === ponto.id
        const isPontoMenu    = openPontoMenuId === ponto.id
        const showPontoActions = isPontoHovered || isPontoMenu || pontoNoteOpen

        const pontoMenuItems: CtxItem[] = [
          { icon: '✦', label: 'Gerar com IA',        action: () => aiPonto(ponto) },
          { icon: '✦', label: 'Sugerir subpontos',   action: () => aiSubpontos(ponto) },
          { divider: true },
          { icon: '↑', label: 'Mover para cima',     action: () => movePonto(ponto.id, 'up'),   disabled: isFirst },
          { icon: '↓', label: 'Mover para baixo',    action: () => movePonto(ponto.id, 'down'), disabled: isLast },
          ...(!isFirst ? [{ icon: '↙', label: 'Tornar subponto do anterior', action: () => demotePonto(ponto.id) } as CtxItem] : []),
          { divider: true },
          { label: 'Excluir', action: () => deletePonto(ponto.id), danger: true },
        ]

        return (
          <div
            key={ponto.id}
            style={{
              border: '1px solid var(--border-subtle)',
              borderLeft: `2px solid ${isOpen ? AI_COLOR : `${AI_COLOR}44`}`,
              borderRadius: '6px',
              background: 'var(--surface)',
              marginBottom: '0.5rem',
              overflow: 'visible',
              position: 'relative',
            }}
          >
            {/* ── Ponto header */}
            <div
              onMouseEnter={() => setHoveredPontoId(ponto.id)}
              onMouseLeave={() => setHoveredPontoId(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.48rem 0.6rem',
                borderBottom: isOpen ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <button
                onClick={() => toggleExpand(ponto.id)}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '0.52rem', padding: 0, flexShrink: 0,
                  transition: 'transform 0.15s', transform: isOpen ? 'rotate(90deg)' : 'none', lineHeight: 1,
                }}
              >▶</button>

              <span style={{ fontSize: '0.58rem', color: `${AI_COLOR}80`, fontWeight: 900, flexShrink: 0, minWidth: '14px' }}>
                {toRoman(pi + 1)}.
              </span>

              {isOpen ? (
                <input
                  value={ponto.text}
                  onChange={e => patch(ponto.id, { text: e.target.value })}
                  placeholder={`Ponto principal ${pi + 1}…`}
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    color: 'var(--text-primary)', fontFamily: 'inherit',
                    fontSize: '0.9rem', fontWeight: 600, outline: 'none', padding: 0,
                  }}
                />
              ) : (
                <span
                  onClick={() => toggleExpand(ponto.id)}
                  style={{
                    flex: 1, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                    color: hasText ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontStyle: hasText ? 'normal' : 'italic',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {ponto.text || `Ponto ${pi + 1}`}
                </span>
              )}

              {!isOpen && subCount > 0 && (
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', flexShrink: 0, opacity: 0.6 }}>
                  {subCount}
                </span>
              )}

              {/* Note dot at rest */}
              {pontoHasNote && !pontoNoteOpen && !showPontoActions && (
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: AI_COLOR, flexShrink: 0, opacity: 0.5 }} />
              )}

              {/* Hover actions */}
              {showPontoActions && (
                <>
                  <button
                    onClick={() => toggleNote(pontoNoteKey)}
                    title={pontoHasNote ? 'Nota de apoio (preenchida)' : 'Adicionar nota'}
                    style={{
                      background: pontoNoteOpen ? `${AI_COLOR}18` : 'transparent',
                      border: 'none', borderRadius: '3px',
                      padding: '0.14rem 0.26rem', cursor: 'pointer',
                      color: pontoNoteOpen ? AI_COLOR : pontoHasNote ? `${AI_COLOR}80` : 'var(--text-muted)',
                      fontSize: '0.7rem', lineHeight: 1, flexShrink: 0,
                    }}
                  >✎</button>

                  <button
                    onMouseDown={e => { e.stopPropagation(); setOpenPontoMenuId(isPontoMenu ? null : ponto.id) }}
                    style={{
                      background: 'transparent', border: 'none', borderRadius: '3px',
                      padding: '0.14rem 0.22rem', cursor: 'pointer',
                      color: isPontoMenu ? 'var(--text-secondary)' : 'var(--text-muted)',
                      fontSize: '0.95rem', lineHeight: 1, flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={e => { if (!isPontoMenu) e.currentTarget.style.color = 'var(--text-muted)' }}
                  >⋯</button>

                  {isPontoMenu && (
                    <ContextMenu
                      items={pontoMenuItems}
                      onClose={() => setOpenPontoMenuId(null)}
                      style={{ top: 'calc(100% + 4px)', right: '0.4rem' }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Note — ponto principal */}
            {pontoNoteOpen && (
              <div style={{ padding: '0 0.6rem 0.5rem' }}>
                <NoteArea
                  value={ponto.notes ?? ''}
                  onChange={v => patch(ponto.id, { notes: v })}
                  onAskAI={onAskAI}
                  aiPrompt={`Escreva notas de apoio para o ponto "${ponto.text || 'principal'}" do sermão de ${ref}. Argumento teológico, evidência textual, observação exegética e lembrete pastoral.`}
                  color={AI_COLOR}
                />
              </div>
            )}

            {/* ── Ponto body */}
            {isOpen && (
              <div style={{ padding: '0.6rem 0.7rem 0.72rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

                {/* Subpontos */}
                <div>
                  <div
                    onMouseEnter={() => setHoveredSection(`${ponto.id}:subs`)}
                    onMouseLeave={() => setHoveredSection(null)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', minHeight: '18px' }}
                  >
                    <span style={secLabel}>Subpontos</span>
                    {hoveredSection === `${ponto.id}:subs` && (
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        {ghostBtn('✦ IA', () => aiSubpontos(ponto))}
                        {ponto.subpontos.length < 7 && ghostBtn('+ Adicionar', () => addSubponto(ponto.id))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {ponto.subpontos.map((sub, si) => {
                      const subNoteKey   = `${ponto.id}:sub:${sub.id}`
                      const subNoteOpen  = openNotes.has(subNoteKey)
                      const subHasNote   = !!(sub.notes?.trim())
                      const isSubHovered = hoveredSubId === sub.id
                      const isSubMenu    = openSubMenuId === sub.id
                      const showSubActions = isSubHovered || isSubMenu || subNoteOpen

                      const subMenuItems: CtxItem[] = [
                        { icon: '✦', label: 'Gerar com IA',           action: () => aiSubponto(ponto, sub) },
                        { icon: '✎', label: 'Nota de apoio',           action: () => { if (!subNoteOpen) toggleNote(subNoteKey) } },
                        { divider: true },
                        { icon: '↑', label: 'Mover para cima',         action: () => moveSub(ponto.id, sub.id, 'up'),   disabled: si === 0 },
                        { icon: '↓', label: 'Mover para baixo',        action: () => moveSub(ponto.id, sub.id, 'down'), disabled: si === ponto.subpontos.length - 1 },
                        { icon: '↗', label: 'Promover a Ponto Principal', action: () => promoteSub(ponto.id, sub.id) },
                        { divider: true },
                        { label: 'Excluir', action: () => removeSub(ponto.id, sub.id), danger: true },
                      ]

                      return (
                        <div key={sub.id}>
                          <div
                            onMouseEnter={() => setHoveredSubId(sub.id)}
                            onMouseLeave={() => setHoveredSubId(null)}
                            style={{
                              position: 'relative',
                              display: 'flex', alignItems: 'center', gap: '0.28rem',
                              padding: '0.16rem 0.28rem',
                              borderRadius: '4px',
                              background: showSubActions ? 'rgba(255,255,255,0.025)' : 'transparent',
                              transition: 'background 0.1s',
                            }}
                          >
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', width: '16px', textAlign: 'right', flexShrink: 0, lineHeight: 1 }}>
                              {si + 1}.
                            </span>

                            <input
                              value={sub.text}
                              onChange={e => patchSub(ponto.id, sub.id, { text: e.target.value })}
                              placeholder={`Subponto ${si + 1}…`}
                              style={{
                                flex: 1, background: 'transparent', border: 'none',
                                color: 'var(--text-primary)', fontFamily: 'inherit',
                                fontSize: '0.85rem', outline: 'none', padding: '0.1rem 0',
                              }}
                            />

                            {/* Note dot — only at complete rest */}
                            {subHasNote && !subNoteOpen && !showSubActions && (
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: AI_COLOR, flexShrink: 0, opacity: 0.55 }} />
                            )}

                            {/* Hover actions */}
                            {showSubActions && (
                              <>
                                <button
                                  onClick={() => toggleNote(subNoteKey)}
                                  title={subHasNote ? 'Nota de apoio (preenchida)' : 'Adicionar nota'}
                                  style={{
                                    background: subNoteOpen ? `${AI_COLOR}18` : 'transparent',
                                    border: 'none', borderRadius: '3px',
                                    padding: '0.12rem 0.22rem', cursor: 'pointer',
                                    color: subNoteOpen ? AI_COLOR : subHasNote ? `${AI_COLOR}80` : 'var(--text-muted)',
                                    fontSize: '0.68rem', lineHeight: 1, flexShrink: 0,
                                  }}
                                >✎</button>

                                <button
                                  onMouseDown={e => { e.stopPropagation(); setOpenSubMenuId(isSubMenu ? null : sub.id) }}
                                  style={{
                                    background: 'transparent', border: 'none', borderRadius: '3px',
                                    padding: '0.12rem 0.18rem', cursor: 'pointer',
                                    color: isSubMenu ? 'var(--text-secondary)' : 'var(--text-muted)',
                                    fontSize: '0.9rem', lineHeight: 1, flexShrink: 0,
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                  onMouseLeave={e => { if (!isSubMenu) e.currentTarget.style.color = 'var(--text-muted)' }}
                                >⋯</button>

                                {isSubMenu && (
                                  <ContextMenu
                                    items={subMenuItems}
                                    onClose={() => setOpenSubMenuId(null)}
                                    style={{ top: 'calc(100% + 2px)', right: 0 }}
                                  />
                                )}
                              </>
                            )}
                          </div>

                          {subNoteOpen && (
                            <div style={{ marginLeft: '26px', marginRight: '4px' }}>
                              <NoteArea
                                value={sub.notes ?? ''}
                                onChange={v => patchSub(ponto.id, sub.id, { notes: v })}
                                onAskAI={onAskAI}
                                aiPrompt={`Escreva notas de apoio para o subponto "${sub.text || 'este subponto'}" dentro do ponto "${ponto.text || 'principal'}" do sermão de ${ref}. Explicação, argumento, citação e como desenvolver oralmente.`}
                                color={AI_COLOR}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {ponto.subpontos.length === 0 && (
                      <button
                        onClick={() => addSubponto(ponto.id)}
                        style={{
                          background: 'transparent', border: '1px dashed var(--border-subtle)',
                          borderRadius: '4px', color: 'var(--text-muted)', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: '0.78rem', padding: '0.26rem 0.5rem',
                          textAlign: 'left', marginTop: '0.15rem',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = AI_COLOR; e.currentTarget.style.color = AI_COLOR }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                      >
                        + Adicionar subponto
                      </button>
                    )}
                  </div>
                </div>

                {/* Ilustração */}
                <div
                  onMouseEnter={() => setHoveredSection(`${ponto.id}:ilu`)}
                  onMouseLeave={() => setHoveredSection(null)}
                  style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.58rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', minHeight: '18px' }}>
                    <span style={secLabel}>Ilustração</span>
                    {(hoveredSection === `${ponto.id}:ilu` || openNotes.has(iluNoteKey)) && (
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <button
                          onClick={() => toggleNote(iluNoteKey)}
                          style={{
                            background: openNotes.has(iluNoteKey) ? `${AI_COLOR}18` : 'transparent',
                            border: 'none', borderRadius: '3px', padding: '0.1rem 0.26rem',
                            cursor: 'pointer', color: openNotes.has(iluNoteKey) ? AI_COLOR : 'var(--text-muted)',
                            fontSize: '0.7rem', lineHeight: 1,
                          }}
                        >✎</button>
                        {ghostBtn('✦ IA', () => aiIlustracao(ponto))}
                      </div>
                    )}
                  </div>
                  <textarea
                    value={ponto.ilustracao}
                    onChange={e => patch(ponto.id, { ilustracao: e.target.value })}
                    placeholder="Ilustração, analogia, exemplo histórico, citação ou caso pastoral…"
                    rows={3}
                    style={{
                      width: '100%', background: 'transparent', border: 'none',
                      borderBottom: '1px solid transparent',
                      color: 'var(--text-primary)', fontFamily: 'inherit',
                      fontSize: '0.85rem', lineHeight: 1.7,
                      padding: '0 0 0.18rem', resize: 'vertical', outline: 'none',
                    }}
                    onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--border-subtle)'}
                    onBlur={e => e.currentTarget.style.borderBottomColor = 'transparent'}
                  />
                  {openNotes.has(iluNoteKey) && (
                    <NoteArea
                      value={ponto.ilustracaoNotes ?? ''}
                      onChange={v => patch(ponto.id, { ilustracaoNotes: v })}
                      onAskAI={onAskAI}
                      aiPrompt={`Escreva notas de apoio para a ilustração do ponto "${ponto.text || 'principal'}" do sermão de ${ref}. Como apresentá-la oralmente? Transição de entrada, desenvolvimento e saída natural.`}
                      color={AI_COLOR}
                    />
                  )}
                </div>

                {/* Aplicação */}
                <div
                  onMouseEnter={() => setHoveredSection(`${ponto.id}:apl`)}
                  onMouseLeave={() => setHoveredSection(null)}
                  style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.58rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', minHeight: '18px' }}>
                    <span style={{ ...secLabel, color: '#4a9a82' }}>Aplicação</span>
                    {(hoveredSection === `${ponto.id}:apl` || openNotes.has(aplNoteKey)) && (
                      <div style={{ display: 'flex', gap: '0.2rem' }}>
                        <button
                          onClick={() => toggleNote(aplNoteKey)}
                          style={{
                            background: openNotes.has(aplNoteKey) ? 'rgba(109,184,160,0.1)' : 'transparent',
                            border: 'none', borderRadius: '3px', padding: '0.1rem 0.26rem',
                            cursor: 'pointer', color: openNotes.has(aplNoteKey) ? '#6db8a0' : 'var(--text-muted)',
                            fontSize: '0.7rem', lineHeight: 1,
                          }}
                        >✎</button>
                        {ghostBtn('✦ IA', () => aiAplicacao(ponto), '#6db8a0')}
                      </div>
                    )}
                  </div>
                  <textarea
                    value={ponto.aplicacao}
                    onChange={e => patch(ponto.id, { aplicacao: e.target.value })}
                    placeholder="Como isso confronta, consola, chama à fé, revela Cristo e deve mudar a vida do ouvinte?"
                    rows={3}
                    style={{
                      width: '100%', background: 'transparent', border: 'none',
                      borderBottom: '1px solid transparent',
                      color: 'var(--text-primary)', fontFamily: 'inherit',
                      fontSize: '0.85rem', lineHeight: 1.7,
                      padding: '0 0 0.18rem', resize: 'vertical', outline: 'none',
                    }}
                    onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--border-subtle)'}
                    onBlur={e => e.currentTarget.style.borderBottomColor = 'transparent'}
                  />
                  {openNotes.has(aplNoteKey) && (
                    <NoteArea
                      value={ponto.aplicacaoNotes ?? ''}
                      onChange={v => patch(ponto.id, { aplicacaoNotes: v })}
                      onAskAI={onAskAI}
                      aiPrompt={`Escreva notas de apoio para a aplicação do ponto "${ponto.text || 'principal'}" do sermão de ${ref}. Como torná-la concreta, evangélica, transformadora e específica para a congregação?`}
                      color="#6db8a0"
                    />
                  )}
                </div>

              </div>
            )}
          </div>
        )
      })}

      {/* ── Footer */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={addPonto}
          style={{
            background: 'transparent', border: '1px dashed var(--border)',
            borderRadius: '5px', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
            padding: '0.3rem 0.7rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = AI_COLOR; e.currentTarget.style.color = AI_COLOR }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          + Ponto Principal
        </button>
        <button
          onClick={aiRevisao}
          style={{
            background: 'transparent', border: '1px solid var(--border-subtle)',
            borderRadius: '5px', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem',
            padding: '0.3rem 0.7rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = AI_COLOR; e.currentTarget.style.color = AI_COLOR }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          Revisar coerência
        </button>
      </div>
    </div>
  )
}

// ── SermonBuilderWorkspace ────────────────────────────────────────────────

export default function SermonBuilderWorkspace({
  project, userId, existingSection, onUpdate, onAskAI,
}: Props) {
  const supabase = createClient()

  const loadBlocks = useCallback((): SermonBlock[] => {
    const c = existingSection?.content as SermonBuilderContent | null
    if (c?.type === 'sermon_builder' && Array.isArray(c.blocks) && c.blocks.length > 0) {
      return c.blocks.map(b =>
        b.type === 'desenvolvimento' ? { ...b, pontos: normalizePontos(b.pontos) } : b
      )
    }
    return DEFAULT_BLOCKS
  }, [existingSection])

  const [blocks,     setBlocks]     = useState<SermonBlock[]>(loadBlocks)
  const [saving,     setSaving]     = useState(false)
  const [savedAt,    setSavedAt]    = useState<Date | null>(null)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal,  setRenameVal]  = useState('')
  const [addOpen,    setAddOpen]    = useState(false)

  const blocksRef      = useRef(blocks)
  blocksRef.current    = blocks
  const sectionIdRef   = useRef(existingSection?.id)
  sectionIdRef.current = existingSection?.id
  const saveTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)

  const performSave = useCallback(async (current: SermonBlock[]) => {
    setSaving(true)
    const hasContent = current.some(blockHasContent)
    const payload = {
      project_id: project.id,
      user_id:    userId,
      slug:       'sermao_dispositio',
      module:     'dispositio' as const,
      title:      'Sermão · Disposição',
      content:    { type: 'sermon_builder', blocks: current } as unknown as Record<string, unknown>,
      status:     (hasContent ? 'draft' : 'empty') as 'empty' | 'draft' | 'reviewed',
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

  function updatePontos(id: string, pontos: PontoPrincipal[]) {
    scheduleSave(blocksRef.current.map(b => b.id === id ? { ...b, pontos } : b))
  }

  function addBlock(type: BlockType) {
    const label = BLOCK_TYPES.find(t => t.type === type)!.label
    const nb: SermonBlock = type === 'desenvolvimento'
      ? { id: mkId(), type, title: label, content: '', pontos: defaultPontos() }
      : { id: mkId(), type, title: label, content: '' }
    scheduleSave([...blocksRef.current, nb])
    setAddOpen(false)
  }

  function moveBlock(id: string, dir: 'up' | 'down') {
    const i = blocksRef.current.findIndex(b => b.id === id)
    if (i < 0) return
    const arr = [...blocksRef.current]
    const swap = dir === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[i], arr[swap]] = [arr[swap], arr[i]]
    scheduleSave(arr)
  }

  function duplicateBlock(id: string) {
    const i = blocksRef.current.findIndex(b => b.id === id)
    if (i < 0) return
    const src = blocksRef.current[i]
    const copy: SermonBlock = { ...src, id: mkId(), title: src.title + ' (cópia)' }
    const arr = [...blocksRef.current]
    arr.splice(i + 1, 0, copy)
    scheduleSave(arr)
  }

  function deleteBlock(id: string) {
    scheduleSave(blocksRef.current.filter(b => b.id !== id))
    setActiveMenu(null)
  }

  function startRename(id: string, current: string) {
    setRenamingId(id); setRenameVal(current); setActiveMenu(null)
  }

  function commitRename(id: string) {
    const t = renameVal.trim()
    if (t) scheduleSave(blocksRef.current.map(b => b.id === id ? { ...b, title: t } : b))
    setRenamingId(null)
  }

  const savedLabel = saving ? 'salvando…'
    : savedAt ? `salvo ${savedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''

  return (
    <div style={{ padding: '2rem clamp(1.2rem, 3vw, 2.5rem) 5rem', maxWidth: '860px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--ai)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.3rem' }}>
          Sermão · Disposição
        </div>
        <h1 style={{ fontSize: '1.55rem', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.4rem' }}>
          Construtor Homilético
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '600px' }}>
          Organize o sermão em blocos modulares. Passe o cursor sobre qualquer elemento para ver as ações disponíveis.
        </p>
        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {project.book} {project.passage_ref} · {savedLabel}
          </span>
          {blocks.every(b => !blockHasContent(b)) && (
            <button
              onClick={() => {
                if (window.confirm('Carregar esboço "A Presença de Deus em Todas as Circunstâncias" (Gn 39.1-23)? O conteúdo atual será substituído.')) {
                  scheduleSave(PRESET_GN39)
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '5px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.72rem',
                padding: '0.2rem 0.6rem',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ai)'; e.currentTarget.style.color = 'var(--ai)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              ↓ Carregar esboço Gn 39
            </button>
          )}
        </div>
      </div>

      {/* Blocks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {blocks.map((block, idx) => {
          const color    = TYPE_COLOR[block.type]
          const isFirst  = idx === 0
          const isLast   = idx === blocks.length - 1
          const menuOpen = activeMenu === block.id
          const isDev    = block.type === 'desenvolvimento'

          return (
            <div
              key={block.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${color}`,
                borderRadius: '7px',
                background: 'var(--surface)',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Block header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, background: dotColor(block) }} />

                {renamingId === block.id ? (
                  <input
                    autoFocus value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onBlur={() => commitRename(block.id)}
                    onKeyDown={e => { if (e.key === 'Enter') commitRename(block.id); if (e.key === 'Escape') setRenamingId(null) }}
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

                <span style={{ fontSize: '0.6rem', color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, opacity: 0.7, flexShrink: 0 }}>
                  {BLOCK_TYPES.find(t => t.type === block.type)?.label}
                </span>

                <button
                  onClick={() => onAskAI(blockPrompt(block, project))}
                  style={{
                    background: 'transparent', border: `1px solid ${color}`, borderRadius: '5px',
                    color, cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.72rem', fontWeight: 700, padding: '0.18rem 0.6rem', flexShrink: 0,
                  }}
                >Gerar</button>

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
                >⋮</button>

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
                      { label: 'Renomear',         action: () => startRename(block.id, block.title) },
                      { label: 'Mover para cima',  action: () => { moveBlock(block.id, 'up'); setActiveMenu(null) }, disabled: isFirst },
                      { label: 'Mover para baixo', action: () => { moveBlock(block.id, 'down'); setActiveMenu(null) }, disabled: isLast },
                      { label: 'Duplicar',         action: () => { duplicateBlock(block.id); setActiveMenu(null) } },
                      { label: 'Excluir',          action: () => deleteBlock(block.id), danger: true },
                    ] as Array<{ label: string; action: () => void; disabled?: boolean; danger?: boolean }>).map(item => (
                      <button
                        key={item.label}
                        onClick={item.disabled ? undefined : item.action}
                        style={{
                          width: '100%', background: 'transparent', border: 'none',
                          textAlign: 'left', padding: '0.42rem 0.65rem', borderRadius: '5px',
                          color: item.danger ? 'var(--error)' : item.disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                          cursor: item.disabled ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit', fontSize: '0.8rem', opacity: item.disabled ? 0.4 : 1,
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
              {isDev ? (
                <DesenvolvimentoEditor
                  pontos={block.pontos ?? defaultPontos()}
                  project={project}
                  onUpdate={pontos => updatePontos(block.id, pontos)}
                  onAskAI={onAskAI}
                />
              ) : (
                <textarea
                  value={block.content}
                  onChange={e => updateContent(block.id, e.target.value)}
                  placeholder={`Escreva o ${block.title.toLowerCase()}…`}
                  style={{
                    width: '100%', minHeight: '110px',
                    background: 'transparent', border: 'none',
                    color: 'var(--text-primary)', fontFamily: 'inherit',
                    fontSize: '0.92rem', lineHeight: 1.75,
                    padding: '0.85rem 1rem', resize: 'vertical', outline: 'none',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Add section */}
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
