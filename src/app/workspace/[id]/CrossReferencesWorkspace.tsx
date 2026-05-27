'use client'

import { useState } from 'react'
import type { Project } from '@/types/database'

// ── Types ──────────────────────────────────────────────────────────────────

type FilterId =
  | 'verbal' | 'tema' | 'tipologia' | 'citacao' | 'alusao'
  | 'nt_at' | 'redencao' | 'cristo' | 'reino' | 'alianca'

interface Filter { id: FilterId; label: string }

type TabId = 'paralelos' | 'temas' | 'ecos' | 'teologico'

interface TabAction {
  label: string
  buildPrompt: (passage: string, verse: string, filterSuffix: string) => string
}

interface Tab {
  id: TabId
  label: string
  description: string
  actions: TabAction[]
  exemplos: string[]
  fontes: string[]
}

// ── Data ───────────────────────────────────────────────────────────────────

const FILTERS: Filter[] = [
  { id: 'verbal',   label: 'Paralelo verbal' },
  { id: 'tema',     label: 'Tema' },
  { id: 'tipologia', label: 'Tipologia' },
  { id: 'citacao',  label: 'Citação direta' },
  { id: 'alusao',   label: 'Alusão' },
  { id: 'nt_at',    label: 'NT usa AT' },
  { id: 'redencao', label: 'Hist. redenção' },
  { id: 'cristo',   label: 'Cristo' },
  { id: 'reino',    label: 'Reino de Deus' },
  { id: 'alianca',  label: 'Aliança' },
]

const TABS: Tab[] = [
  {
    id: 'paralelos',
    label: 'Paralelos Diretos',
    description: 'Versículos com linguagem, tema ou situação diretamente relacionados. Incluem paralelos verbais, citações do NT no AT e passagens com contexto situacional análogo.',
    exemplos: ['Gênesis 21:22', 'Josué 1:8', 'Salmo 23:4', 'Isaías 43:2', 'Mateus 1:23', 'Romanos 8:31', 'João 10:28'],
    fontes: ['Treasury of Scripture Knowledge', 'Thompson Chain Reference', 'BibleHub Cross References', 'NET Bible Notes'],
    actions: [
      {
        label: 'Paralelos verbais e temáticos',
        buildPrompt: (p, v, f) =>
          `Liste os principais paralelos verbais e temáticos de ${v}. Para cada referência: versículo completo, tipo de conexão (verbal / temático / situacional), motivo exegético da relação e relevância para a interpretação. Organize em ordem canônica. Use Treasury of Scripture Knowledge como base.${f}`,
      },
      {
        label: 'Citações do NT no AT',
        buildPrompt: (p, v, f) =>
          `Identifique se ${v} é citado, aludido ou ecoado no Novo Testamento. Para cada ocorrência: texto do NT, como o autor usa o texto do AT, contexto hermenêutico e contribuição cristológica. Fontes: Beale & Carson, Commentary on the NT Use of the OT.${f}`,
      },
      {
        label: 'Paralelos canônicos completos',
        buildPrompt: (p, v, f) =>
          `Gere lista estruturada de paralelos canônicos de ${v}. Divida em: (1) Paralelos verbais — mesma linguagem; (2) Paralelos temáticos — mesmo conceito; (3) Paralelos situacionais — mesma dinâmica narrativa. Cada entrada com versículo e motivo da conexão.${f}`,
      },
      {
        label: '"Por que essa referência importa?"',
        buildPrompt: (p, v, f) =>
          `Para as principais referências cruzadas de ${v}, explique: Qual a relação exata? É paralelo verbal, temático, tipológico ou profético? O que a conexão revela sobre o significado do texto? Como enriquece a pregação e a aplicação pastoral?${f}`,
      },
    ],
  },
  {
    id: 'temas',
    label: 'Temas Relacionados',
    description: 'Conceitos teológicos que a passagem evoca. Rastreie como esses temas emergem, se desenvolvem e chegam ao clímax ao longo do cânone.',
    exemplos: ['Presença de Deus', 'Fidelidade divina', 'Providência', 'Bênção aliancial', 'Sofrimento do justo', 'Santidade', 'Glória', 'Descanso'],
    fontes: ['New Dictionary of Biblical Theology', 'Goldsworthy Trilogy', 'Dictionary of Biblical Imagery', 'NDBT'],
    actions: [
      {
        label: 'Mapa canônico do tema',
        buildPrompt: (p, v, f) =>
          `Identifique os temas teológicos centrais em ${v} e mapeie seu desenvolvimento canônico. Para cada tema: surgimento no AT, desenvolvimento nos Profetas, cumprimento em Cristo, ensino apostólico, clímax escatológico. Perspectiva de teologia bíblica reformada (Vos, Goldsworthy, Beale).${f}`,
      },
      {
        label: 'Rastrear tema no AT',
        buildPrompt: (p, v, f) =>
          `Rastreie os temas de ${v} através do Antigo Testamento. Mostre como o tema aparece no Pentateuco, Salmos, Profetas maiores e menores. Textos específicos, progressão semântica e acumulação de sentido teológico.${f}`,
      },
      {
        label: 'Rastrear tema no NT',
        buildPrompt: (p, v, f) =>
          `Rastreie os temas de ${v} no Novo Testamento. Como Jesus, Paulo, João e demais autores desenvolvem ou cumprem esse tema? Textos específicos, perspectivas distintas e contribuição para a teologia bíblica.${f}`,
      },
      {
        label: 'Comparar uso em contextos distintos',
        buildPrompt: (p, v, f) =>
          `Compare como o tema central de ${v} funciona em contextos distintos do cânone — lei, profecia, sabedoria, evangelhos, epístolas. O que muda? O que permanece? O que se intensifica em Cristo?${f}`,
      },
    ],
  },
  {
    id: 'ecos',
    label: 'Ecos e Alusões',
    description: 'Conexões literárias implícitas, padrões tipológicos e desenvolvimento intertextual. O NT ecoa o AT; narrativas espelham narrativas; tipos apontam para antitipos.',
    exemplos: ['Êxodo novo', 'Adão → Cristo', 'Templo → Cristo', 'José como tipo de Cristo', 'Noé e o batismo', 'Melquisedeque', 'Servo sofredor'],
    fontes: ['Richard Hays — Echoes of Scripture', 'G. K. Beale — NT Use of OT', 'Beale & Carson Commentary', 'Clowney — Preaching Christ'],
    actions: [
      {
        label: 'Identificar alusões ao AT',
        buildPrompt: (p, v, f) =>
          `Identifique alusões ao Antigo Testamento em ${v}. Para cada alusão: texto alvo, texto original do AT, tipo (verbal / temático / narrativo / estrutural), como a alusão intensifica o significado. Metodologia: Hays (Echoes of Scripture) e Beale (NT Use of OT).${f}`,
      },
      {
        label: 'Análise tipológica',
        buildPrompt: (p, v, f) =>
          `Analise a tipologia presente em ou relacionada a ${v}. Para cada tipo: tipo no AT, antítipo no NT/Cristo, escalamento (o antítipo supera o tipo), base histórico-gramatical. Evite alegoria; mostre fundamentação exegética sólida. Fontes: Clowney, Davidson, Beale.${f}`,
      },
      {
        label: 'Padrões narrativos canônicos',
        buildPrompt: (p, v, f) =>
          `Identifique padrões narrativos e intertextuais de ${v} no cânone. Há estruturas do Êxodo, criação, queda, êxodo novo ou nova criação sendo ecoadas? Como o padrão se intensifica e cumpre em Cristo? Use Christopher Wright, Goldsworthy e G. K. Beale.${f}`,
      },
      {
        label: 'Intertextualidade estrutural',
        buildPrompt: (p, v, f) =>
          `Analise a intertextualidade estrutural de ${v}: quais narrativas bíblicas anteriores moldam a estrutura, linguagem ou dinâmica desta passagem? Mostre a cadeia literária e seu significado teológico acumulado. Perspectiva de teologia bíblica canônica.${f}`,
      },
    ],
  },
  {
    id: 'teologico',
    label: 'Uso Teológico',
    description: 'Implicações reformadas, estrutura aliancial, centralidade de Cristo e história da redenção. Como a passagem se encaixa no arco redentor de Deus da criação à nova criação.',
    exemplos: ['Aliança abraâmica', 'Cristo no AT', 'Presença divina progressiva', 'Missio Dei', 'Reino e nova criação', 'Imago Dei', 'Justificação'],
    fontes: ['Vos — Biblical Theology', 'O. P. Robertson — Cristo das Alianças', 'Goldsworthy — According to Plan', 'Gaffin — By Faith Not Sight'],
    actions: [
      {
        label: 'Análise aliancial',
        buildPrompt: (p, v, f) =>
          `Analise ${v} à luz das alianças bíblicas (Adão, Noé, Abraão, Moisés, Davi, Nova). Como o texto se insere no mosaico aliancial? Qual aliança está em foco? Como avança a estrutura pactual? Fontes: Robertson (Cristo das Alianças), Vos, Murray.${f}`,
      },
      {
        label: 'Conexão cristológica',
        buildPrompt: (p, v, f) =>
          `Mostre como ${v} aponta, prefigura, cita ou depende de Cristo. Base exegética e hermenêutica bíblica sólida — sem saltos alegóricos. Como o texto encontra cumprimento, intensificação ou iluminação no evangelho? Fontes: Goldsworthy, Clowney, Greidanus.${f}`,
      },
      {
        label: 'Progressão redentivo-histórica',
        buildPrompt: (p, v, f) =>
          `Posicione ${v} na história da redenção. Onde estamos no drama redentor? O que prefigurou este momento? O que vem depois que desenvolve ou cumpre? Como culmina em Cristo e aponta para nova criação? Use Vos, Gaffin e Beale.${f}`,
      },
      {
        label: 'Unidade da Escritura',
        buildPrompt: (p, v, f) =>
          `Demonstre como ${v} contribui para a unidade canônica da Escritura. Mostre: (1) continuidade com a revelação anterior, (2) desenvolvimento progressivo, (3) antecipação do que vem depois, (4) contribuição para a mensagem central de Cristo e seu reino. Perspectiva reformada de teologia bíblica.${f}`,
      },
    ],
  },
]

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  project: Project
  onAskAI: (prompt: string) => void
}

const COLOR = '#5ba8c4'
const BG_ACTIVE = 'rgba(91,168,196,0.1)'

export default function CrossReferencesWorkspace({ project, onAskAI }: Props) {
  const passage = `${project.book} ${project.passage_ref}`
  const [activeTab,     setActiveTab]     = useState<TabId>('paralelos')
  const [verseQuery,    setVerseQuery]    = useState('')
  const [activeFilters, setActiveFilters] = useState<Set<FilterId>>(new Set())

  const tab = TABS.find(t => t.id === activeTab)!

  function toggleFilter(id: FilterId) {
    setActiveFilters(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function filterSuffix(): string {
    if (activeFilters.size === 0) return ''
    const labels = FILTERS.filter(f => activeFilters.has(f.id)).map(f => f.label)
    return ` Foque em: ${labels.join(', ')}.`
  }

  function ask(action: TabAction) {
    const verse = verseQuery.trim() || passage
    onAskAI(action.buildPrompt(passage, verse, filterSuffix()))
  }

  function askExample(example: string) {
    const verse = verseQuery.trim() || passage
    onAskAI(
      `Explique a relação canônica entre ${verse} e ${example}. Tipo de conexão (verbal, temático, tipológico, profético ou aliancial), base exegética, o que a conexão revela sobre o significado de ambos os textos e relevância para pregação. Perspectiva reformada de teologia bíblica.${filterSuffix()}`
    )
  }

  const secLabel: React.CSSProperties = {
    fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text-muted)',
    marginBottom: '0.55rem', display: 'block',
  }

  return (
    <div style={{ overflowY: 'auto', height: '100%', padding: '2rem clamp(1.4rem, 3vw, 2.4rem) 4rem' }}>
      <div style={{ maxWidth: '1020px', margin: '0 auto' }}>

        {/* ── Header */}
        <div style={{ marginBottom: '1.6rem' }}>
          <div style={{ fontSize: '0.65rem', color: COLOR, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: '0.3rem' }}>
            Ferramentas
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.7rem', color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '0.4rem' }}>
                Referências Cruzadas
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '640px' }}>
                Explore a rede de conexões canônicas da Escritura — paralelos, ecos, alusões, tipologia e desenvolvimento
                progressivo da revelação até Cristo.
              </p>
            </div>
            <div style={{
              flexShrink: 0,
              border: `1px solid ${COLOR}`,
              background: BG_ACTIVE,
              color: COLOR,
              borderRadius: '7px',
              padding: '0.45rem 0.7rem',
              fontSize: '0.72rem', fontWeight: 800,
              whiteSpace: 'nowrap',
            }}>
              {passage}
            </div>
          </div>
        </div>

        {/* ── Search + Filters */}
        <div style={{
          border: `1px solid ${COLOR}40`,
          background: 'var(--surface)',
          borderRadius: '8px',
          padding: '0.85rem',
          marginBottom: '1.2rem',
        }}>
          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{
                position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: '0.8rem', pointerEvents: 'none',
              }}>⌕</span>
              <input
                value={verseQuery}
                onChange={e => setVerseQuery(e.target.value)}
                placeholder={`Passagem específica (padrão: ${passage})`}
                style={{
                  width: '100%', background: 'var(--surface-2)',
                  border: '1px solid var(--border)', borderRadius: '7px',
                  color: 'var(--text-primary)', fontFamily: 'inherit',
                  fontSize: '0.88rem', padding: '0.62rem 0.85rem 0.62rem 2rem',
                  outline: 'none',
                }}
                onFocus={e => e.currentTarget.style.borderColor = COLOR}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
            {verseQuery && (
              <button
                onClick={() => setVerseQuery('')}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '0.82rem', padding: '0.4rem',
                  flexShrink: 0,
                }}
              >✕ limpar</button>
            )}
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '0.2rem' }}>
              Filtros:
            </span>
            {FILTERS.map(f => {
              const active = activeFilters.has(f.id)
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFilter(f.id)}
                  style={{
                    background: active ? BG_ACTIVE : 'transparent',
                    border: `1px solid ${active ? COLOR : 'var(--border-subtle)'}`,
                    borderRadius: '4px',
                    color: active ? COLOR : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.72rem',
                    fontWeight: active ? 700 : 400,
                    padding: '0.18rem 0.5rem',
                    transition: 'border-color 0.12s, color 0.12s, background 0.12s',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
            {activeFilters.size > 0 && (
              <button
                onClick={() => setActiveFilters(new Set())}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', fontSize: '0.68rem', padding: '0.18rem 0.3rem', marginLeft: '0.1rem',
                }}
              >Limpar</button>
            )}
          </div>
        </div>

        {/* ── Tab bar */}
        <div style={{
          display: 'flex', gap: '0.2rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
        }}>
          {TABS.map(t => {
            const active = t.id === activeTab
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: active ? 700 : 400,
                  color: active ? COLOR : 'var(--text-muted)',
                  padding: '0.5rem 0.9rem',
                  borderBottom: `2px solid ${active ? COLOR : 'transparent'}`,
                  marginBottom: '-1px',
                  transition: 'color 0.12s, border-color 0.12s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* ── Tab content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(260px, 0.7fr)', gap: '1.2rem', alignItems: 'start' }}>

          {/* Main column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Description */}
            <div style={{
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              borderLeft: `3px solid ${COLOR}`,
              borderRadius: '8px',
              padding: '0.9rem 1rem',
            }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {tab.description}
              </p>
            </div>

            {/* AI Actions */}
            <div style={{
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <span style={secLabel}>Ações da IA</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {tab.actions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => ask(action)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${COLOR}`,
                      borderRadius: '7px',
                      color: COLOR,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      padding: '0.6rem 0.85rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = BG_ACTIVE}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>✦</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick examples */}
            <div style={{
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <span style={secLabel}>Conexões típicas — clique para explorar</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {tab.exemplos.map(ex => (
                  <button
                    key={ex}
                    onClick={() => askExample(ex)}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.78rem',
                      padding: '0.3rem 0.58rem',
                      transition: 'border-color 0.12s, color 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLOR; e.currentTarget.style.color = COLOR }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Aside */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Fontes e bases */}
            <div style={{
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <span style={secLabel}>Fontes desta seção</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {tab.fontes.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '0.45rem', alignItems: 'baseline' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: COLOR, flexShrink: 0, marginTop: '0.45em' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos de conexão */}
            <div style={{
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <span style={secLabel}>Tipos de conexão canônica</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { tipo: 'Paralelo verbal',  desc: 'Mesma linguagem ou vocabulário específico' },
                  { tipo: 'Paralelo temático', desc: 'Mesmo conceito ou doutrina' },
                  { tipo: 'Tipologia',         desc: 'Tipo histórico → antítipo em Cristo' },
                  { tipo: 'Citação direta',    desc: 'NT cita o AT explicitamente' },
                  { tipo: 'Alusão',            desc: 'Eco implícito da linguagem ou cena' },
                  { tipo: 'Eco narrativo',     desc: 'Padrão de história reutilizado' },
                  { tipo: 'Progressão',        desc: 'Revelação anterior cumpre-se em etapa posterior' },
                ].map(item => (
                  <div key={item.tipo}>
                    <div style={{ fontSize: '0.76rem', color: COLOR, fontWeight: 700, marginBottom: '0.05rem' }}>{item.tipo}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Autores prioritários */}
            <div style={{
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '1rem',
            }}>
              <span style={secLabel}>Autores prioritários</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {['Beale', 'Carson', 'Vos', 'Clowney', 'Goldsworthy', 'Hays', 'Robertson', 'Alexander', 'Greidanus', 'Wright'].map(autor => (
                  <span
                    key={autor}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '5px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.74rem',
                      padding: '0.2rem 0.42rem',
                    }}
                  >
                    {autor}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
