export type ToolAreaId = 'sistematica' | 'biblica' | 'dicionario' | 'livros' | 'refs_cruzadas'

export interface ToolReference {
  title: string
  items: string[]
}

export interface ToolAction {
  label: string
  prompt: string
}

export interface ToolArea {
  id: ToolAreaId
  slug: string
  title: string
  shortTitle: string
  subtitle: string
  objective: string
  color: string
  bgActive: string
  sections: string[]
  capabilities: string[]
  aiRole: string
  references: ToolReference[]
  actions: ToolAction[]
  visualization: string[]
}

export const TOOL_AREAS: ToolArea[] = [
  {
    id: 'sistematica',
    slug: 'ferramentas_sistematica',
    title: 'Teologia Sistemática',
    shortTitle: 'Sistemática',
    subtitle: 'Doutrinas, autores e sínteses',
    objective: 'Relacionar textos bíblicos com doutrinas sistemáticas, autores reformados e implicações pastorais.',
    color: '#b8922a',
    bgActive: 'rgba(184,146,42,0.1)',
    sections: [
      'Doutrina de Deus',
      'Cristologia',
      'Pneumatologia',
      'Soteriologia',
      'Eclesiologia',
      'Escatologia',
      'Antropologia',
      'Hamartiologia',
      'Bibliologia',
      'Angelologia',
    ],
    capabilities: [
      'Pesquisar doutrinas',
      'Relacionar textos bíblicos',
      'Conectar temas sistemáticos',
      'Gerar sínteses teológicas',
      'Comparar autores',
      'Criar mapas doutrinários',
      'Aplicar pastoralmente uma doutrina',
    ],
    aiRole: 'assistente teológico reformado, capaz de explicar doutrinas, comparar tradições, sugerir bibliografia e conectar o texto bíblico à aplicação pastoral.',
    references: [
      { title: 'Autores prioritários', items: ['Bavinck', 'Calvino', 'Berkhof', 'Frame', 'Grudem', 'John Murray', 'Turretin', 'Vos', 'Owen', 'Edwards'] },
      { title: 'Perguntas típicas', items: ['Como este texto informa a doutrina de Deus?', 'Que autores reformados tratam deste tema?', 'Quais diferenças históricas existem sobre esta doutrina?'] },
    ],
    actions: [
      { label: 'Explicar doutrina', prompt: 'Explique esta doutrina de forma acadêmica, reformada e pastoral, com textos bíblicos principais e autores de referência.' },
      { label: 'Relacionar com a passagem', prompt: 'Relacione a passagem atual com uma doutrina sistemática, mostrando base bíblica, formulação teológica e aplicação pastoral.' },
      { label: 'Comparar autores', prompt: 'Compare como Bavinck, Calvino, Berkhof e Frame tratam este tema, destacando convergências e diferenças.' },
      { label: 'Gerar mapa doutrinário', prompt: 'Gere um mapa doutrinário com conceitos centrais, textos bíblicos, autores e implicações pastorais.' },
    ],
    visualization: ['Texto bíblico', 'Doutrina', 'Formulação histórica', 'Autores reformados', 'Aplicação pastoral'],
  },
  {
    id: 'biblica',
    slug: 'ferramentas_biblica',
    title: 'Teologia Bíblica',
    shortTitle: 'Bíblica',
    subtitle: 'Revelação progressiva e cânone',
    objective: 'Acompanhar o desenvolvimento progressivo da revelação, conectando temas do Antigo e Novo Testamento em Cristo.',
    color: '#6db8a0',
    bgActive: 'rgba(109,184,160,0.1)',
    sections: [
      'Reino de Deus',
      'Aliança',
      'Presença de Deus',
      'Templo',
      'Sacrifício',
      'Messias',
      'Povo de Deus',
      'Descanso',
      'Nova Criação',
      'Êxodo',
      'Sabedoria',
      'Glória',
      'Santidade',
    ],
    capabilities: [
      'Rastrear temas bíblicos',
      'Conectar AT e NT',
      'Acompanhar temas canônicos',
      'Visualizar história da redenção',
      'Identificar tipologia',
      'Encontrar ecos e alusões',
      'Gerar mapas redentivo-históricos',
    ],
    aiRole: 'pesquisador de teologia bíblica, atento à progressão canônica, tipologia, ecos intertextuais e cumprimento cristológico.',
    references: [
      { title: 'Autores prioritários', items: ['Geerhardus Vos', 'G. K. Beale', 'Graeme Goldsworthy', 'T. Desmond Alexander', 'O. Palmer Robertson', 'Edmund Clowney', 'D. A. Carson', 'Schreiner'] },
      { title: 'Visualizações ideais', items: ['Linhas do tempo', 'Mapas temáticos', 'Conexões AT -> NT', 'Fluxos da revelação', 'Gráficos de desenvolvimento bíblico'] },
    ],
    actions: [
      { label: 'Linha canônica', prompt: 'Construa uma linha canônica deste tema, mostrando criação, queda, Israel, Cristo, igreja e nova criação.' },
      { label: 'Identificar tipologia', prompt: 'Identifique tipos, antítipos, ecos e alusões relacionados a este tema na passagem atual.' },
      { label: 'Conectar em Cristo', prompt: 'Mostre como este tema encontra seu centro e cumprimento em Cristo, sem saltos alegóricos.' },
      { label: 'Mapa redentivo-histórico', prompt: 'Gere um mapa redentivo-histórico com etapas, textos-chave e desenvolvimento teológico.' },
    ],
    visualization: ['Criação', 'Patriarcas', 'Êxodo', 'Reino', 'Profetas', 'Cristo', 'Igreja', 'Nova criação'],
  },
  {
    id: 'dicionario',
    slug: 'ferramentas_dicionario',
    title: 'Dicionário Bíblico',
    shortTitle: 'Dicionário',
    subtitle: 'Léxico, história e semântica',
    objective: 'Criar um ambiente de pesquisa lexical, histórica e teológica para termos em português, hebraico, grego e aramaico.',
    color: '#9b7ec8',
    bgActive: 'rgba(155,126,200,0.1)',
    sections: ['Português', 'Hebraico', 'Grego', 'Aramaico', 'Septuaginta', 'Uso paulino', 'Uso joanino', 'Semântica canônica'],
    capabilities: [
      'Pesquisar palavras',
      'Explicar significado e etimologia',
      'Analisar semântica',
      'Mostrar contexto bíblico',
      'Ver uso canônico',
      'Comparar traduções',
      'Explicar implicações exegéticas',
    ],
    aiRole: 'lexicógrafo bíblico e auxiliar exegético, capaz de explicar termos, comparar usos e mostrar nuances teológicas.',
    references: [
      { title: 'Léxicos', items: ['BDAG', 'HALOT', 'TWOT', 'NIDOTTE', 'NIDNTTE', 'Louw-Nida'] },
      { title: 'Dicionários', items: ['ISBE', 'Anchor Bible Dictionary', 'Dictionary of Biblical Imagery', 'Baker Encyclopedia'] },
    ],
    actions: [
      { label: 'Analisar termo', prompt: 'Analise este termo lexicalmente: significado, campo semântico, uso bíblico, traduções e implicações exegéticas.' },
      { label: 'Comparar usos', prompt: 'Compare o uso deste termo no livro atual, no corpus do autor, na Septuaginta e no cânone.' },
      { label: 'Nuance teológica', prompt: 'Explique as nuances teológicas deste termo e como elas afetam a interpretação da passagem.' },
      { label: 'Uso paulino/joanino', prompt: 'Verifique se este termo possui uso paulino ou joanino relevante e explique as diferenças.' },
    ],
    visualization: ['Termo', 'Campo semântico', 'Usos bíblicos', 'Traduções', 'Teologia', 'Exegese'],
  },
  {
    id: 'livros',
    slug: 'ferramentas_livros',
    title: 'Livros Indicados',
    shortTitle: 'Livros',
    subtitle: 'Biblioteca inteligente',
    objective: 'Recomendar bibliografia acadêmica e pastoral por livro bíblico, tema, doutrina, dificuldade e tradição teológica.',
    color: '#c47c5a',
    bgActive: 'rgba(196,124,90,0.1)',
    sections: [
      'Exegese',
      'Hermenêutica',
      'Teologia Bíblica',
      'Teologia Sistemática',
      'Homilética',
      'Grego',
      'Hebraico',
      'Retórica',
      'História da Igreja',
      'Puritanos',
      'Comentários Bíblicos',
      'Pregação',
      'Liderança pastoral',
    ],
    capabilities: [
      'Recomendar bibliografia',
      'Comparar comentários',
      'Sugerir ordem de leitura',
      'Explicar nível técnico',
      'Gerar bibliografia acadêmica',
      'Indicar obras reformadas',
      'Mostrar pontos fortes e fracos',
    ],
    aiRole: 'bibliotecário teológico e orientador acadêmico, capaz de recomendar obras, comparar comentários e montar trilhas de leitura.',
    references: [
      { title: 'Consultas frequentes', items: ['Melhores comentários de Romanos', 'Livros reformados sobre presença de Deus', 'Melhores gramáticas gregas', 'Livros sobre tipologia bíblica', 'Melhores comentários de Gênesis'] },
      { title: 'Critérios', items: ['Livro bíblico', 'Tema', 'Doutrina', 'Dificuldade', 'Tradição teológica', 'Nível acadêmico'] },
    ],
    actions: [
      { label: 'Recomendar comentários', prompt: 'Recomende os melhores comentários para o livro bíblico atual, indicando tradição, nível técnico, pontos fortes e limitações.' },
      { label: 'Montar trilha de leitura', prompt: 'Monte uma ordem de leitura progressiva sobre este tema: introdutória, intermediária, avançada e pastoral.' },
      { label: 'Comparar obras', prompt: 'Compare as principais obras sobre este assunto, indicando utilidade para exegese, teologia e pregação.' },
      { label: 'Bibliografia acadêmica', prompt: 'Gere uma bibliografia acadêmica anotada em português do Brasil para esta pesquisa.' },
    ],
    visualization: ['Tema', 'Nível', 'Obras essenciais', 'Comentários', 'Leitura avançada', 'Uso pastoral'],
  },
  {
    id: 'refs_cruzadas',
    slug: 'ferramentas_refs_cruzadas',
    title: 'Referências Cruzadas',
    shortTitle: 'Ref. Cruzadas',
    subtitle: 'Rede canônica da Escritura',
    objective: 'Explorar paralelos bíblicos, ecos, alusões, tipologia e conexões canônicas — rastreando como a Escritura interpreta e ilumina a si mesma.',
    color: '#5ba8c4',
    bgActive: 'rgba(91,168,196,0.1)',
    sections: [
      'Paralelos verbais',
      'Paralelos temáticos',
      'Citação direta',
      'Alusão',
      'Tipologia',
      'NT usa AT',
      'Progressão canônica',
      'Cristologia',
      'Aliança',
      'História da redenção',
    ],
    capabilities: [
      'Encontrar paralelos verbais e temáticos',
      'Identificar citações do NT no AT',
      'Detectar alusões e ecos intertextuais',
      'Analisar tipologia e padrões narrativos',
      'Rastrear temas pelo cânone',
      'Conectar passagem à história da redenção',
      'Análise aliancial e cristológica',
    ],
    aiRole: 'especialista em intertextualidade bíblica, teologia bíblica reformada e referências cruzadas canônicas, atento a paralelos verbais, ecos literários, tipologia e progressão redentivo-histórica.',
    references: [
      { title: 'Bases principais', items: ['Treasury of Scripture Knowledge', 'Thompson Chain Reference', 'Logos Cross References', 'Commentary on the NT Use of the OT'] },
      { title: 'Autores prioritários', items: ['G. K. Beale', 'D. A. Carson', 'Geerhardus Vos', 'Edmund Clowney', 'Graeme Goldsworthy', 'Richard Hays', 'O. Palmer Robertson'] },
    ],
    actions: [
      { label: 'Paralelos diretos', prompt: 'Liste os principais paralelos verbais e temáticos deste texto. Para cada: versículo, tipo de conexão e relevância exegética. Use TSK e NIDOTTE.' },
      { label: 'Citações e alusões NT', prompt: 'Identifique como este texto é citado, aludido ou ecoado no NT. Como o autor do NT usa o texto? Contribuição cristológica? (Beale & Carson)' },
      { label: 'Análise tipológica', prompt: 'Analise a tipologia presente neste texto. Tipo, antítipo, escalamento. Base exegética sólida, sem alegoria. (Clowney, Davidson, Beale)' },
      { label: 'Progressão redentiva', prompt: 'Posicione este texto na linha redentivo-histórica. O que prefigurou? O que cumpre? Como culmina em Cristo e aponta para nova criação? (Vos, Gaffin, Beale)' },
    ],
    visualization: ['Texto', 'Paralelos AT', 'Eco/Alusão', 'Tipologia', 'Cumprimento NT', 'Nova Criação'],
  },
]

export function getToolAreaBySlug(slug: string): ToolArea | undefined {
  return TOOL_AREAS.find(area => area.slug === slug)
}

export function isToolSlug(slug: string): boolean {
  return slug.startsWith('ferramentas_')
}
