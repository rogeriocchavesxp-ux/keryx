export interface CardDef {
  id: string
  title: string
  placeholder: string
  aiTrigger: string
}

export interface SectionDef {
  slug: string
  title: string
  shortTitle: string
  module: 'inventio' | 'dispositio' | 'elocutio' | 'memoria' | 'pronuntiatio'
  group:
    | 'contextual' | 'textual' | 'teologico'
    | 'proposicao' | 'estrutura' | 'encerramento'
    | 'vocabulario' | 'imagens' | 'tom'
    | 'memorizacao'
    | 'entrega' | 'avaliacao_pregacao'
  groupLabel: string
  order: number
  objective: string
  keyQuestions: string[]
  relevantAuthors: string[]
  cards: CardDef[]
}

export const WORKSPACE_SECTIONS: SectionDef[] = [
  // ── ESTUDO CONTEXTUAL ──────────────────────────────────────────────────────

  {
    slug: 'contexto_historico',
    title: '1.1 Contexto Histórico-Cultural',
    shortTitle: 'Histórico-Cultural',
    module: 'inventio',
    group: 'contextual',
    groupLabel: 'Estudo Contextual',
    order: 1,
    objective:
      'Situar o texto em seu horizonte histórico, político, religioso e cultural original, de modo que o significado do autor para os destinatários originais seja compreendido com precisão.',
    keyQuestions: [
      'Em que período e contexto político foi escrito este livro?',
      'Quais tensões religiosas ou culturais moldam o pano de fundo do texto?',
      'Que práticas sociais ou costumes o autor pressupõe que seu leitor conhece?',
      'Como a geografia influencia a mensagem ou os eventos do texto?',
      'Que estruturas sociais (família, honra-vergonha, patronato) estão operando?',
    ],
    relevantAuthors: ['Craig Keener', 'E. Randolph Richards', 'Bruce Longenecker', 'F. F. Bruce', 'David deSilva'],
    cards: [
      {
        id: 'periodo_data',
        title: 'Período e data',
        placeholder: 'Identifique o período histórico (séc., império, reinado) e a data provável de composição. Cite as evidências internas e externas que sustentam sua datação.',
        aiTrigger: 'Qual o período histórico e a data provável de composição deste livro? Apresente evidências internas e externas para a datação, citando estudiosos reformados como Keener, Bruce ou Carson.',
      },
      {
        id: 'contexto_politico',
        title: 'Contexto político',
        placeholder: 'Descreva a situação política relevante: impérios, reis, tensões, perseguições ou alianças que afetam o texto.',
        aiTrigger: 'Descreva o contexto político que envolve este texto: poderes imperiais, tensões locais, perseguições ou alianças relevantes para a interpretação.',
      },
      {
        id: 'contexto_religioso',
        title: 'Contexto religioso',
        placeholder: 'Identifique o ambiente religioso: judaísmo do Segundo Templo, paganismo greco-romano, seitas, heresias ou movimentos que o texto pressupõe ou confronta.',
        aiTrigger: 'Qual o ambiente religioso que o texto pressupõe? Descreva o judaísmo do Segundo Templo, o paganismo greco-romano ou quaisquer movimentos religiosos relevantes para esta passagem.',
      },
      {
        id: 'cultura_costumes',
        title: 'Cultura e costumes',
        placeholder: 'Registre práticas culturais, costumes, instituições sociais ou pressupostos implícitos que o autor e os leitores compartilhavam e que moldam o sentido do texto.',
        aiTrigger: 'Quais práticas culturais, costumes ou pressupostos sociais (honra-vergonha, patronato, família, hospitalidade) são relevantes para entender este texto em seu contexto original?',
      },
      {
        id: 'geografia',
        title: 'Geografia',
        placeholder: 'Descreva os elementos geográficos relevantes: cidades, rotas, regiões, distâncias e como o espaço físico contribui para a compreensão do texto.',
        aiTrigger: 'Como os elementos geográficos — cidades, rotas, regiões — contribuem para a compreensão desta passagem? Há significado teológico ou narrativo na geografia mencionada?',
      },
      {
        id: 'estrutura_social',
        title: 'Estrutura social',
        placeholder: 'Analise as estruturas sociais presentes: hierarquias, classes, relações de gênero, escravidão, cidadania, relações de patronato e clientelismo.',
        aiTrigger: 'Que estruturas sociais estão operando neste texto? Analise hierarquias, relações de patronato, dinâmicas de gênero, escravidão ou cidadania que o autor pressupõe ou aborda.',
      },
    ],
  },

  {
    slug: 'autor_destinatarios',
    title: '1.2 Autor e Destinatários',
    shortTitle: 'Autor e Destinatários',
    module: 'inventio',
    group: 'contextual',
    groupLabel: 'Estudo Contextual',
    order: 2,
    objective:
      'Identificar quem escreveu, para quem, em que circunstâncias e com que autoridade, estabelecendo a relação comunicativa que governa o sentido do texto.',
    keyQuestions: [
      'Quem é o autor e quais são as questões de autoria relevantes?',
      'Quem são os destinatários e qual é sua situação específica?',
      'Que autoridade ou relacionamento o autor possui com os destinatários?',
      'Há evidências de destinatários secundários ou leitura circular?',
      'Como a identidade do autor molda o tom e o argumento do livro?',
    ],
    relevantAuthors: ['D. A. Carson', 'Douglas Moo', 'Thomas Schreiner', 'I. Howard Marshall', 'Richard Bauckham'],
    cards: [
      {
        id: 'autor',
        title: 'Autor',
        placeholder: 'Identifique o autor: nome, origem, formação, carreira e posição teológica. Cite evidências internas do texto que corroboram a autoria.',
        aiTrigger: 'Quem é o autor deste livro? Apresente sua identidade, formação, posição teológica e as evidências internas que corroboram a autoria, segundo comentaristas como Carson, Moo ou Schreiner.',
      },
      {
        id: 'questoes_autoria',
        title: 'Questões de autoria',
        placeholder: 'Há debates sobre autoria (pseudonímia, autoria múltipla, secretário)? Registre as posições e a que conclusão você chega.',
        aiTrigger: 'Quais são os debates acadêmicos sobre a autoria deste livro? Apresente as posições principais (incluindo pseudonímia, secretário, autoria múltipla) e avalie-as à luz da hermenêutica reformada.',
      },
      {
        id: 'destinatarios',
        title: 'Destinatários',
        placeholder: 'Identifique os destinatários: comunidade, localização, composição étnica e religiosa (judeus, gentios, mistos), situação socioeconômica.',
        aiTrigger: 'Quem são os destinatários deste livro? Identifique sua localização, composição étnica e religiosa, e situação socioeconômica, com base nas evidências do texto e de fontes históricas.',
      },
      {
        id: 'situacao_destinatarios',
        title: 'Situação dos destinatários',
        placeholder: 'Qual a situação concreta dos destinatários: crise, perseguição, heresia, conflito interno, pobreza, sincretismo? Como o autor responde a isso?',
        aiTrigger: 'Qual era a situação específica dos destinatários quando receberam este livro? Havia perseguição, heresia, conflito interno ou outra crise? Como o autor aborda essa situação?',
      },
    ],
  },

  {
    slug: 'ocasiao_proposito',
    title: '1.3 Ocasião e Propósito',
    shortTitle: 'Ocasião e Propósito',
    module: 'inventio',
    group: 'contextual',
    groupLabel: 'Estudo Contextual',
    order: 3,
    objective:
      'Determinar o que motivou a composição do texto e qual intenção comunicativa o autor buscava alcançar, distinguindo propósito declarado de propósito subjacente.',
    keyQuestions: [
      'Que evento, crise ou necessidade provocou a escrita deste documento?',
      'O autor declara explicitamente seu propósito? Onde?',
      'Há um propósito implícito diferente ou complementar ao declarado?',
      'Como o propósito influencia a seleção e organização do material?',
      'Que resposta o autor esperava de seus leitores?',
    ],
    relevantAuthors: ['D. A. Carson', 'Grant Osborne', 'William Klein', 'Andreas Köstenberger', 'Thomas Schreiner'],
    cards: [
      {
        id: 'ocasiao',
        title: 'Ocasião',
        placeholder: 'Descreva o evento, a situação ou a necessidade que motivou o autor a escrever. Cite textos específicos que revelam a ocasião.',
        aiTrigger: 'Qual foi a ocasião que motivou a escrita deste livro? Que evento, crise ou necessidade o provocou? Cite passagens específicas que revelam a situação por trás do texto.',
      },
      {
        id: 'proposito_declarado',
        title: 'Propósito declarado',
        placeholder: 'O autor declara explicitamente seu propósito? Onde? Transcreva e analise as declarações de propósito encontradas no texto.',
        aiTrigger: 'O autor declara explicitamente seu propósito em algum ponto do livro? Localize e analise as declarações de propósito no texto, com referências exegéticas precisas.',
      },
      {
        id: 'proposito_implicito',
        title: 'Propósito implícito',
        placeholder: 'Além do propósito declarado, há objetivos implícitos (pastorais, polêmicos, apologéticos, doxológicos)? Argumente a partir do texto.',
        aiTrigger: 'Além do propósito declarado, há objetivos implícitos neste livro — pastorais, polêmicos, apologéticos ou doxológicos? Argumente a partir de evidências textuais.',
      },
    ],
  },

  {
    slug: 'genero_literario',
    title: '1.4 Gênero Literário',
    shortTitle: 'Gênero Literário',
    module: 'inventio',
    group: 'contextual',
    groupLabel: 'Estudo Contextual',
    order: 4,
    objective:
      'Identificar o gênero do livro e da perícope específica, pois o gênero governa as regras hermenêuticas que aplicamos ao texto.',
    keyQuestions: [
      'Qual é o gênero predominante deste livro (narrativo, epistolar, profético, apocalíptico, sapiencial, poético)?',
      'O gênero da perícope difere ou se subdivide dentro do gênero maior do livro?',
      'Que convenções literárias do gênero o autor usa e que o leitor original reconhecia?',
      'Quais são as implicações hermenêuticas do gênero para a interpretação desta passagem?',
      'Há elementos mistos de gênero? Como devem ser tratados?',
    ],
    relevantAuthors: ['Gordon Fee', 'Douglas Stuart', 'Grant Osborne', 'Tremper Longman III', 'Sidney Greidanus'],
    cards: [
      {
        id: 'genero_livro',
        title: 'Gênero do livro',
        placeholder: 'Classifique o gênero geral do livro (narrativa histórica, epístola, profecia, apocalipse, sabedoria, salmo, evangelho). Justifique com características do texto.',
        aiTrigger: 'Qual é o gênero literário deste livro? Classifique-o e justifique com as características textuais que evidenciam o gênero, segundo Fee e Stuart ou Osborne.',
      },
      {
        id: 'genero_pericope',
        title: 'Gênero da perícope',
        placeholder: 'A perícope tem um gênero específico dentro do livro maior (parábola, discurso, hino, doxologia, lista, narrativa de milagre, etc.)? Identifique-o.',
        aiTrigger: 'Qual é o gênero específico desta perícope dentro do livro? É uma parábola, discurso, hino, narrativa de milagre, lista, oração? Identifique e explique suas características.',
      },
      {
        id: 'implicacoes_hermeneuticas',
        title: 'Implicações hermenêuticas',
        placeholder: 'Que regras hermenêuticas o gênero impõe? Como o gênero determina como você deve (e não deve) interpretar este texto?',
        aiTrigger: 'Quais são as implicações hermenêuticas do gênero desta perícope? Que regras de interpretação o gênero impõe? O que o gênero permite e proíbe na exegese?',
      },
    ],
  },

  {
    slug: 'estrutura_livro',
    title: '1.5 Estrutura do Livro',
    shortTitle: 'Estrutura do Livro',
    module: 'inventio',
    group: 'contextual',
    groupLabel: 'Estudo Contextual',
    order: 5,
    objective:
      'Mapear a macro-estrutura do livro para localizar a perícope no argumento geral do autor e compreender como ela contribui para o todo.',
    keyQuestions: [
      'Quais são as divisões principais do livro e o que as demarca?',
      'Onde exatamente a perícope estudada se encaixa na estrutura?',
      'Como a perícope avança o argumento ou narrativa do livro?',
      'Há seções paralelas ou espelhadas que iluminam nossa perícope?',
      'Qual a tese central do livro e como nossa passagem a sustenta?',
    ],
    relevantAuthors: ['D. A. Carson', 'Thomas Schreiner', 'Andreas Köstenberger', 'Peter O\'Brien', 'Douglas Moo'],
    cards: [
      {
        id: 'divisoes_principais',
        title: 'Divisões principais',
        placeholder: 'Apresente o esboço do livro com suas divisões e subdivisões principais. Justifique os cortes com base em marcadores textuais.',
        aiTrigger: 'Apresente o esboço estrutural deste livro com suas divisões principais. Justifique cada corte com base em marcadores textuais (partículas, mudanças de tema, vocativos, inclusio).',
      },
      {
        id: 'localizacao_pericope',
        title: 'Localização da perícope',
        placeholder: 'Onde a perícope se localiza dentro da estrutura do livro? Em que seção maior ela se enquadra? O que vem antes e depois?',
        aiTrigger: 'Onde esta perícope se localiza na estrutura geral do livro? Em que seção maior ela se enquadra? Como o contexto imediato anterior e posterior ilumina seu significado?',
      },
      {
        id: 'argumento_livro',
        title: 'Argumento do livro',
        placeholder: 'Qual o argumento ou tese central do livro? Como nossa perícope contribui para esse argumento maior?',
        aiTrigger: 'Qual é o argumento ou tese central deste livro? Como esta perícope específica contribui para avançar esse argumento? Que papel ela desempenha no todo?',
      },
    ],
  },

  // ── ESTUDO TEXTUAL ─────────────────────────────────────────────────────────

  {
    slug: 'texto_original',
    title: '§ Texto Original',
    shortTitle: 'Texto Original',
    module: 'inventio',
    group: 'textual',
    groupLabel: 'Estudo Textual',
    order: 5.5,
    objective: 'Trabalhar diretamente com o texto bíblico no idioma original — o ponto de partida de toda exegese responsável. O texto domina; a análise serve.',
    keyQuestions: [],
    relevantAuthors: [],
    cards: [],
  },

  {
    slug: 'delimitacao_pericope',
    title: '2.1 Delimitação da Perícope',
    shortTitle: 'Delimitação',
    module: 'inventio',
    group: 'textual',
    groupLabel: 'Estudo Textual',
    order: 6,
    objective:
      'Determinar com precisão os limites da unidade literária a ser examinada, identificando onde ela começa e termina com base em evidências textuais objetivas.',
    keyQuestions: [
      'Onde começa e onde termina a unidade literária? Quais são as evidências?',
      'Que marcadores textuais (conectivos, mudança de sujeito, vocativos, mudança de cenário) indicam os limites?',
      'Como nossa delimitação se compara à de comentaristas de referência?',
      'A perícope tem unidade temática interna? O que a une?',
      'Há debate sobre os limites? Como ele é resolvido?',
    ],
    relevantAuthors: ['Gordon Fee', 'Andreas Köstenberger', 'Thomas Schreiner', 'Richard Bauckham', 'Joel Green'],
    cards: [
      {
        id: 'limites_pericope',
        title: 'Limites da perícope',
        placeholder: 'Defina o versículo inicial e final da perícope. Justifique por que começa e termina onde você propõe.',
        aiTrigger: 'Quais são os limites da perícope nesta passagem? Defina o versículo inicial e final e justifique sua delimitação com evidências textuais precisas.',
      },
      {
        id: 'marcadores_delimitacao',
        title: 'Marcadores de delimitação',
        placeholder: 'Liste os marcadores textuais que confirmam os limites: conectivos (δέ, γάρ, οὖν), mudanças de sujeito, cenário, vocabulário, partículas de transição.',
        aiTrigger: 'Quais marcadores textuais — conectivos, mudança de sujeito, cenário, partículas de transição — delimitam esta perícope? Analise cada marcador com precisão gramatical.',
      },
      {
        id: 'conexao_contexto',
        title: 'Conexão com o contexto',
        placeholder: 'Como esta perícope se conecta com a unidade anterior e a posterior? Há continuidade temática, contraste ou progressão argumentativa?',
        aiTrigger: 'Como esta perícope se conecta com a unidade anterior e a posterior? Há continuidade temática, contraste ou progressão argumentativa que o exegeta deve considerar?',
      },
    ],
  },

  {
    slug: 'traducao_textual',
    title: '2.2 Tradução e Crítica Textual',
    shortTitle: 'Tradução',
    module: 'inventio',
    group: 'textual',
    groupLabel: 'Estudo Textual',
    order: 7,
    objective:
      'Produzir uma tradução própria do texto a partir do original e examinar variantes textuais relevantes que afetam a interpretação.',
    keyQuestions: [
      'Qual é a sua tradução do texto a partir do hebraico/grego?',
      'Há variantes textuais significativas que afetam a interpretação?',
      'Como as principais versões (ESV, NVI, NTR, ARA) diferem e por quê?',
      'Qual variante possui o suporte manuscrito mais forte segundo a crítica textual?',
      'Que decisões de tradução foram mais difíceis e por quê?',
    ],
    relevantAuthors: ['Bruce Metzger', 'Philip Comfort', 'Emanuel Tov', 'D. A. Carson', 'Murray Harris'],
    cards: [
      {
        id: 'minha_traducao',
        title: 'Minha tradução',
        placeholder: 'Escreva sua tradução literal da perícope a partir do texto original (hebraico/grego). Priorize precisão sobre fluência.',
        aiTrigger: 'Produza uma tradução literal desta perícope a partir do texto original, priorizando precisão exegética sobre fluência. Indique as escolhas de tradução mais significativas e sua justificativa.',
      },
      {
        id: 'variantes_textuais',
        title: 'Variantes textuais',
        placeholder: 'Registre as variantes textuais relevantes nesta perícope. Para cada uma: manuscritos envolvidos, leitura de cada variante, avaliação da probabilidade.',
        aiTrigger: 'Quais são as variantes textuais relevantes nesta perícope? Para cada variante, indique os manuscritos envolvidos, a leitura de cada tradição e a avaliação segundo Metzger ou Comfort.',
      },
      {
        id: 'comparacao_versoes',
        title: 'Comparação de versões',
        placeholder: 'Compare como ESV, NVI, NTR e ARA traduzem os termos ou construções mais significativos. O que as diferenças revelam sobre opções exegéticas?',
        aiTrigger: 'Compare as principais versões (ESV, NVI, NTR, ARA) nos pontos de maior divergência nesta perícope. O que as diferenças de tradução revelam sobre opções interpretativas?',
      },
    ],
  },

  {
    slug: 'analise_morfossintatica',
    title: '2.3 Análise Morfossintática',
    shortTitle: 'Morfossintaxe',
    module: 'inventio',
    group: 'textual',
    groupLabel: 'Estudo Textual',
    order: 8,
    objective:
      'Examinar as formas gramaticais e estruturas sintáticas que determinam o sentido preciso do texto, partindo do nível da palavra até a frase e o parágrafo.',
    keyQuestions: [
      'Quais são os verbos principais e o que seus tempos, modos e vozes comunicam?',
      'Como a sintaxe da frase principal estrutura a proposição central do texto?',
      'Que partículas ou conectivos organizam o argumento do parágrafo?',
      'Há estruturas gramaticais incomuns ou enfáticas que exigem atenção especial?',
      'Como a gramática ilumina ou resolve debates interpretativos desta passagem?',
    ],
    relevantAuthors: ['Daniel Wallace', 'Moisés Silva', 'John Wenham', 'Bill Mounce', 'Bruce Waltke'],
    cards: [
      {
        id: 'verbos_principais',
        title: 'Verbos principais',
        placeholder: 'Liste os verbos principais da perícope. Para cada um: forma, tempo, modo, voz e significância interpretativa.',
        aiTrigger: 'Identifique e analise os verbos principais desta perícope. Para cada um, informe a forma exata, tempo, modo, voz e sua significância para a interpretação do texto, segundo Wallace ou Waltke.',
      },
      {
        id: 'substantivos_casos',
        title: 'Substantivos e casos',
        placeholder: 'Analise os substantivos teologicamente carregados: caso, artigo (determinado/indeterminado), posição na frase e implicações semânticas.',
        aiTrigger: 'Analise os substantivos e casos gramaticais mais relevantes nesta perícope. Como o uso ou ausência do artigo, o caso e a posição na frase afetam a interpretação?',
      },
      {
        id: 'estrutura_sintatica',
        title: 'Estrutura sintática',
        placeholder: 'Produza um diagrama de frases ou representação visual da estrutura sintática da proposição central. Identifique sujeito, predicado, modificadores e cláusulas subordinadas.',
        aiTrigger: 'Analise a estrutura sintática da proposição central desta perícope. Identifique sujeito, predicado, objetos, modificadores e cláusulas subordinadas. Como a sintaxe sustenta a interpretação?',
      },
      {
        id: 'particulas_conectivos',
        title: 'Partículas e conectivos',
        placeholder: 'Identifique as partículas e conectivos (γάρ, δέ, οὖν, ἵνα, ὅτι, ו, כִּי, לָכֵן) e explique como organizam o argumento.',
        aiTrigger: 'Quais partículas e conectivos estruturam o argumento desta perícope? Analise cada um (γάρ, δέ, οὖν, ἵνα, ὅτι etc.) e explique sua função lógica e sua importância para a interpretação.',
      },
    ],
  },

  {
    slug: 'termos_chave',
    title: '2.4 Termos-Chave',
    shortTitle: 'Termos-Chave',
    module: 'inventio',
    group: 'textual',
    groupLabel: 'Estudo Textual',
    order: 9,
    objective:
      'Investigar os termos lexicalmente decisivos da perícope segundo os cinco tópicos da análise semântica, usando os dicionários técnicos de referência.',
    keyQuestions: [
      'Quais são os termos teologicamente carregados desta perícope?',
      'Como BDAG/HALOT define o termo em seu uso técnico?',
      'Como o autor usa este termo em outras passagens do mesmo livro?',
      'Como o AT usa este termo e o NT o recebe ou transforma?',
      'O contexto imediato ilumina ou restringe o sentido do termo?',
    ],
    relevantAuthors: ['BDAG', 'HALOT', 'TWOT', 'NIDNTTE', 'Moisés Silva'],
    cards: [
      {
        id: 'termo_1',
        title: 'Termo 1',
        placeholder: 'Termo:\n\nDefinição (BDAG/HALOT/TWOT):\n\nComparação (uso no mesmo livro, corpus do autor):\n\nRelação (relação com outros conceitos teológicos):\n\nCircunstâncias (contexto imediato que delimita o sentido):\n\nTestemunho (como comentaristas de referência entendem este termo aqui):',
        aiTrigger: 'Analise o primeiro termo-chave desta perícope segundo os cinco tópicos: Definição (BDAG/HALOT), Comparação (uso no mesmo autor/livro), Relação (conexões teológicas), Circunstâncias (contexto imediato) e Testemunho (comentaristas reformados).',
      },
      {
        id: 'termo_2',
        title: 'Termo 2',
        placeholder: 'Termo:\n\nDefinição (BDAG/HALOT/TWOT):\n\nComparação (uso no mesmo livro, corpus do autor):\n\nRelação (relação com outros conceitos teológicos):\n\nCircunstâncias (contexto imediato que delimita o sentido):\n\nTestemunho (como comentaristas de referência entendem este termo aqui):',
        aiTrigger: 'Analise o segundo termo-chave desta perícope segundo os cinco tópicos: Definição (BDAG/HALOT), Comparação (uso no mesmo autor/livro), Relação (conexões teológicas), Circunstâncias (contexto imediato) e Testemunho (comentaristas reformados).',
      },
      {
        id: 'termo_3',
        title: 'Termo 3',
        placeholder: 'Termo:\n\nDefinição (BDAG/HALOT/TWOT):\n\nComparação (uso no mesmo livro, corpus do autor):\n\nRelação (relação com outros conceitos teológicos):\n\nCircunstâncias (contexto imediato que delimita o sentido):\n\nTestemunho (como comentaristas de referência entendem este termo aqui):',
        aiTrigger: 'Analise o terceiro termo-chave desta perícope segundo os cinco tópicos: Definição (BDAG/HALOT), Comparação (uso no mesmo autor/livro), Relação (conexões teológicas), Circunstâncias (contexto imediato) e Testemunho (comentaristas reformados).',
      },
    ],
  },

  {
    slug: 'estrutura_literaria',
    title: '2.5 Estrutura Literária',
    shortTitle: 'Estrutura Literária',
    module: 'inventio',
    group: 'textual',
    groupLabel: 'Estudo Textual',
    order: 10,
    objective:
      'Mapear a estrutura interna da perícope — paralelismos, quiasmos, inclusio, progressão argumentativa — para revelar a ênfase e a intenção do autor.',
    keyQuestions: [
      'Qual é a estrutura interna da perícope? Há simetria, paralelismo ou progressão?',
      'Existe quiasmo ou inclusio que revela o elemento central?',
      'Que dispositivos literários o autor emprega (repetição, contraste, ironia, alusão)?',
      'Para textos narrativos: como se articulam cena, clímax e resolução?',
      'Para epístolas: como o argumento lógico progride de premissa a conclusão?',
    ],
    relevantAuthors: ['David Dorsey', 'John Sailhamer', 'Leland Ryken', 'Tremper Longman III', 'Grant Osborne'],
    cards: [
      {
        id: 'esboço_estrutural',
        title: 'Esboço estrutural',
        placeholder: 'Apresente o esboço estrutural da perícope com suas subdivisões internas. Justifique cada corte com marcadores textuais.',
        aiTrigger: 'Produza o esboço estrutural desta perícope com suas subdivisões internas. Justifique cada divisão com marcadores textuais precisos. Qual é a lógica organizadora do texto?',
      },
      {
        id: 'dispositivos_literarios',
        title: 'Dispositivos literários',
        placeholder: 'Identifique dispositivos literários: repetição de termos, contraste, ironia, inclusio, quiasmo, parallelismus membrorum, alusões intertextuais.',
        aiTrigger: 'Quais dispositivos literários o autor emprega nesta perícope — repetição, contraste, ironia, inclusio, quiasmo, paralelismo? Como cada dispositivo contribui para o significado e ênfase do texto?',
      },
      {
        id: 'analise_narrativa',
        title: 'Análise narrativa (se aplicável)',
        placeholder: 'Para textos narrativos: identifique narrador, personagens, cenário, enredo, tensão dramática, clímax e resolução. Que elementos narrativos revelam a teologia do autor?',
        aiTrigger: 'Se esta perícope é narrativa, analise seus elementos: narrador, ponto de vista, personagens, cenário, enredo, tensão dramática, clímax e resolução. Como esses elementos comunicam a teologia do autor?',
      },
      {
        id: 'argumento_epistola',
        title: 'Argumento (se epístola)',
        placeholder: 'Para epístolas: mapeie o argumento lógico. Há estrutura retórica reconhecível (propositio, probatio, peroratio)? Como as premissas levam à conclusão?',
        aiTrigger: 'Se esta perícope pertence a uma epístola, mapeie seu argumento lógico. Há estrutura retórica reconhecível (propositio, probatio, peroratio)? Como as premissas avançam para a conclusão?',
      },
    ],
  },

  // ── ESTUDO TEOLÓGICO ───────────────────────────────────────────────────────

  {
    slug: 'contexto_canonico',
    title: '3.1 Contexto Canônico',
    shortTitle: 'Contexto Canônico',
    module: 'inventio',
    group: 'teologico',
    groupLabel: 'Estudo Teológico',
    order: 11,
    objective:
      'Situar a perícope no interior do cânone bíblico, examinando suas relações intertextuais com o restante do livro, com o AT e com o NT.',
    keyQuestions: [
      'Como esta perícope se relaciona com o argumento do livro como um todo?',
      'O autor cita ou alude a textos do AT? Como os usa?',
      'Esta passagem tem paralelos ou ecos em outras partes do NT?',
      'Como o cânone como um todo ilumina esta passagem?',
      'Há conflito aparente com outras passagens? Como é resolvido?',
    ],
    relevantAuthors: ['G. K. Beale', 'D. A. Carson', 'Geerhardus Vos', 'Richard Hays', 'Brevard Childs'],
    cards: [
      {
        id: 'contexto_intralivro',
        title: 'Contexto intralivro',
        placeholder: 'Como esta perícope se relaciona com outras passagens do mesmo livro? Há temas, termos ou argumentos que retornam e iluminam esta seção?',
        aiTrigger: 'Como esta perícope se relaciona com outras passagens do mesmo livro? Que temas, termos ou argumentos que aparecem em outros lugares iluminam esta seção específica?',
      },
      {
        id: 'citacoes_alusoes_at',
        title: 'Citações e alusões ao AT',
        placeholder: 'O autor cita ou alude a textos do AT? Liste cada referência, o texto original e como o autor o usa (citação literal, adaptação, alusão, tipologia).',
        aiTrigger: 'O autor cita ou alude a textos do AT nesta perícope? Liste cada referência, o texto original, e analise como o autor usa o AT — citação literal, adaptação, alusão, tipologia ou eco — segundo Beale e Carson.',
      },
      {
        id: 'ecos_nt',
        title: 'Ecos no NT',
        placeholder: 'Há paralelos ou ecos desta perícope em outras partes do NT? Como o NT como um todo ilumina este texto?',
        aiTrigger: 'Há paralelos, ecos ou reflexos desta perícope em outras partes do NT? Como outras passagens neotestamentárias iluminam o texto em estudo? Use Beale, Carson ou Richard Hays como referência.',
      },
    ],
  },

  {
    slug: 'progressao_revelacional',
    title: '3.2 Progressão Revelacional',
    shortTitle: 'Progressão Revelacional',
    module: 'inventio',
    group: 'teologico',
    groupLabel: 'Estudo Teológico',
    order: 12,
    objective:
      'Localizar a perícope na progressão da revelação redentora de Deus, identificando como ela avança, cumpre, antecipa ou estabelece elementos da história da redenção.',
    keyQuestions: [
      'Em que estágio da história da redenção esta perícope está situada?',
      'Há tipos que são cumpridos ou antecipados nesta passagem?',
      'Que promessas do AT esta passagem cumpre, pressupõe ou aponta?',
      'Como Cristo é o centro ou o referencial desta perícope?',
      'Qual é a contribuição única desta passagem para a teologia bíblica do cânone?',
    ],
    relevantAuthors: ['Geerhardus Vos', 'Edmund Clowney', 'O. Palmer Robertson', 'G. K. Beale', 'Graeme Goldsworthy'],
    cards: [
      {
        id: 'posicao_historia_redencao',
        title: 'Posição na história da redenção',
        placeholder: 'Em que estágio da história da redenção esta perícope está? Que eventos anteriores ela pressupõe? Que eventos futuros ela prepara?',
        aiTrigger: 'Em que estágio da história da redenção esta perícope está localizada? Que eventos anteriores ela pressupõe e que eventos futuros ela prepara, segundo a teologia bíblica de Vos, Goldsworthy ou Clowney?',
      },
      {
        id: 'tipologia',
        title: 'Tipologia',
        placeholder: 'Há tipos (pessoas, eventos, instituições) nesta perícope que apontam ou cumprem realidades redentoras maiores? Identifique tipo e antítipo com evidência textual.',
        aiTrigger: 'Há tipos — pessoas, eventos, instituições — nesta perícope que apontam ou cumprem realidades redentoras maiores? Identifique o tipo e o antítipo com evidência textual e hermenêutica sólida.',
      },
      {
        id: 'promessa_cumprimento',
        title: 'Promessa e cumprimento',
        placeholder: 'Esta perícope cumpre promessas do AT? É ela mesma uma promessa a ser cumprida? Como se enquadra no padrão promessa-cumprimento da revelação progressiva?',
        aiTrigger: 'Como esta perícope se enquadra no padrão promessa-cumprimento da revelação progressiva? Ela cumpre promessas do AT? É ela mesma uma promessa? Como Robertson, Vos ou Beale abordam este padrão nesta passagem?',
      },
    ],
  },

  {
    slug: 'sintese',
    title: '§4 Síntese Exegética',
    shortTitle: 'Síntese',
    module: 'inventio',
    group: 'teologico',
    groupLabel: 'Estudo Teológico',
    order: 13,
    objective:
      'Consolidar toda a análise exegética em uma síntese coerente que articule a Grande Ideia do texto, sua mensagem, o que ensina e o que confronta.',
    keyQuestions: [
      'Em uma sentença, qual é a Grande Ideia do texto (sujeito + complemento completo)?',
      'Qual é a mensagem do texto para seus destinatários originais?',
      'Que conceito ou verdade teológica o texto está ensinando positivamente?',
      'Que erro, pecado, compreensão equivocada ou desvio o texto confronta?',
      'Como a Grande Ideia orienta a pregação e a aplicação contemporânea?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'Sidney Greidanus', 'Graeme Goldsworthy', 'Timothy Keller'],
    cards: [
      {
        id: 'grande_ideia',
        title: 'A Grande Ideia',
        placeholder: 'Formule a Grande Ideia do texto em uma sentença completa (sujeito + complemento). Sujeito: de que trata o texto? Complemento: o que o texto afirma sobre esse assunto?\n\nGrande Ideia:',
        aiTrigger: 'Formule a Grande Ideia desta perícope em uma sentença completa (sujeito + complemento completo), segundo o método de Haddon Robinson. Sujeito: de que o texto trata? Complemento: o que o texto afirma sobre esse assunto?',
      },
      {
        id: 'mensagem_texto',
        title: 'Mensagem do texto',
        placeholder: 'Qual é a mensagem do texto — o que Deus communica por meio deste texto para seus destinatários originais e para a igreja de todos os tempos?',
        aiTrigger: 'Qual é a mensagem central deste texto — o que Deus comunica por meio dele para os destinatários originais e para a igreja de todos os tempos? Seja preciso e abrangente.',
      },
      {
        id: 'conceito_ensina',
        title: 'Conceito que o texto ensina',
        placeholder: 'Que verdade, doutrina ou prática o texto está afirmando, estabelecendo ou aprofundando positivamente?',
        aiTrigger: 'Que verdade, doutrina ou prática este texto está afirmando, estabelecendo ou aprofundando positivamente? Qual é a contribuição doutrinal ou ética da perícope para a vida da igreja?',
      },
      {
        id: 'conceitos_confronta',
        title: 'Conceitos que o texto confronta',
        placeholder: 'Que erros teológicos, pecados, mal-entendidos, complacências ou desvios o texto confronta — nos destinatários originais e hoje?',
        aiTrigger: 'Que erros teológicos, pecados, mal-entendidos ou desvios este texto confronta — nos destinatários originais e na igreja contemporânea? Que forma tomam esses erros hoje?',
      },
    ],
  },
]

// ── DISPOSITIO ─────────────────────────────────────────────────────────────

const DISPOSITIO_SECTIONS: SectionDef[] = [
  {
    slug: 'grande_ideia_homiletica',
    title: '1. Grande Ideia Homilética',
    shortTitle: 'Grande Ideia',
    module: 'dispositio',
    group: 'proposicao',
    groupLabel: 'Ideia e Proposição',
    order: 14,
    objective: 'Transformar a Grande Ideia exegética em uma Grande Ideia homilética — uma sentença que comunica a verdade do texto com poder proclamatório. É o coração do sermão: tudo deve girar em torno dela.',
    keyQuestions: [
      'Qual é o sujeito do sermão — de que ele trata?',
      'Qual é o complemento — o que o sermão afirma sobre esse sujeito?',
      'A Grande Ideia está formulada de modo que mude vidas, não apenas informe mentes?',
      'Como ela se conecta com a Grande Ideia exegética do §4?',
      'Esta ideia é suficientemente específica para guiar todos os pontos do sermão?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'Sidney Greidanus', 'Timothy Keller'],
    cards: [
      {
        id: 'sujeito_homilet',
        title: 'Sujeito do sermão',
        placeholder: 'De que trata este sermão? O sujeito deve ser completo o suficiente para não poder ser respondido com "sim" ou "não".\n\nSujeito:',
        aiTrigger: 'Com base na Grande Ideia exegética do §4, formule o sujeito do sermão: de que ele trata? O sujeito deve ser completo mas não ser uma frase afirmativa.',
      },
      {
        id: 'complemento_homilet',
        title: 'Complemento do sermão',
        placeholder: 'O que o sermão afirma sobre o sujeito? O complemento deve responder completamente ao sujeito.\n\nComplemento:',
        aiTrigger: 'Com base no sujeito do sermão, formule o complemento: o que o sermão afirma sobre esse sujeito? Deve ser uma resposta completa e proclamatória.',
      },
      {
        id: 'grande_ideia_homilet',
        title: 'Grande Ideia Homilética',
        placeholder: 'Una sujeito e complemento em uma única sentença completa, clara e memorável. Deve ser a sentença mais importante do sermão.\n\nGrande Ideia:',
        aiTrigger: 'Formule a Grande Ideia Homilética completa unindo sujeito e complemento. Deve ser uma sentença única, clara, bíblica e que mobilize vidas. Use linguagem direta e contemporânea.',
      },
      {
        id: 'proposicao',
        title: 'Proposição do sermão',
        placeholder: 'Reformule a Grande Ideia como uma afirmação que anuncia o que o sermão vai desenvolver. Pode ser declarativa, interrogativa ou imperativa.\n\nProposição:',
        aiTrigger: 'Formule a proposição do sermão — a afirmação central que anuncia ao ouvinte o que será desenvolvido. Pode ter forma declarativa ("Este texto nos ensina que..."), interrogativa ou imperativa.',
      },
    ],
  },
  {
    slug: 'introducao_sermao',
    title: '2. Introdução',
    shortTitle: 'Introdução',
    module: 'dispositio',
    group: 'estrutura',
    groupLabel: 'Estrutura do Sermão',
    order: 15,
    objective: 'Construir uma introdução que capture a atenção, crie a necessidade do ouvinte, apresente o assunto e conduza ao texto. Uma boa introdução abre a porta para o sermão — o ouvinte deve querer entrar.',
    keyQuestions: [
      'Como capturar a atenção nos primeiros 60 segundos?',
      'Qual a necessidade real que este texto atende na vida do ouvinte?',
      'Como fazer a ponte da introdução para o texto bíblico?',
      'A introdução termina gerando expectativa para o que vem a seguir?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'John Stott', 'Stuart Briscoe'],
    cards: [
      {
        id: 'gancho',
        title: 'Gancho (abertura)',
        placeholder: 'Como o sermão começa? Uma história, pergunta, estatística, citação, situação ou problema que capture imediatamente a atenção do ouvinte.\n\nGancho:',
        aiTrigger: 'Sugira um gancho de abertura para o sermão baseado nesta perícope. Pode ser uma história ilustrativa, pergunta provocativa, situação contemporânea ou tensão existencial. Deve ser relevante para o tema do texto.',
      },
      {
        id: 'necessidade',
        title: 'Necessidade do ouvinte',
        placeholder: 'Qual é a necessidade concreta que este sermão atende? O ouvinte deve sentir que este sermão é para ele.\n\nNecessidade:',
        aiTrigger: 'Identifique a necessidade humana concreta que este texto e sermão atendem. Que problema, dor, dúvida ou questão existencial este texto responde na vida do ouvinte contemporâneo?',
      },
      {
        id: 'assunto_intro',
        title: 'Apresentação do assunto',
        placeholder: 'Como o assunto do sermão é apresentado antes do texto? Faça a ponte entre o gancho e o texto bíblico.\n\nApresentação:',
        aiTrigger: 'Redija a transição da introdução para o texto bíblico: como apresentar o assunto do sermão e conduzir o ouvinte para a leitura do texto de modo natural e convincente?',
      },
      {
        id: 'leitura_texto',
        title: 'Leitura e apresentação do texto',
        placeholder: 'Como o texto bíblico é apresentado e lido? Inclua qualquer contextualização necessária antes da leitura.\n\nApresentação do texto:',
        aiTrigger: 'Como apresentar e introduzir a leitura desta perícope para a congregação? Que informações contextuais mínimas o ouvinte precisa antes de ouvir o texto ser lido?',
      },
    ],
  },
  {
    slug: 'divisoes_sermao',
    title: '3. Divisões do Sermão',
    shortTitle: 'Divisões',
    module: 'dispositio',
    group: 'estrutura',
    groupLabel: 'Estrutura do Sermão',
    order: 16,
    objective: 'Desenvolver os pontos principais do sermão — divisões que fluem do texto, sustentam a Grande Ideia e juntas constroem o argumento completo. Cada ponto deve ser necessário, distinto e derivado do próprio texto.',
    keyQuestions: [
      'Quantos pontos o texto sustenta naturalmente?',
      'Cada ponto está claramente ancorado no texto?',
      'Os pontos juntos desenvolvem completamente a Grande Ideia?',
      'Há progressão lógica ou narrativa entre os pontos?',
      'Cada ponto inclui explicação, ilustração e aplicação?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'Martyn Lloyd-Jones', 'John MacArthur'],
    cards: [
      {
        id: 'ponto1',
        title: 'Ponto 1',
        placeholder: 'Enunciado do ponto 1:\n\nReferência no texto:\n\nDesenvolvimento (explicação):\n\nIlustração:\n\nAplicação:',
        aiTrigger: 'Desenvolva o primeiro ponto principal do sermão baseado nesta perícope. Inclua: enunciado claro do ponto, ancoragem no texto, desenvolvimento explicativo, sugestão de ilustração e aplicação prática.',
      },
      {
        id: 'ponto2',
        title: 'Ponto 2',
        placeholder: 'Enunciado do ponto 2:\n\nReferência no texto:\n\nDesenvolvimento (explicação):\n\nIlustração:\n\nAplicação:',
        aiTrigger: 'Desenvolva o segundo ponto principal do sermão baseado nesta perícope. Inclua: enunciado claro, ancoragem textual, desenvolvimento, ilustração e aplicação. Deve contrastar ou progredir em relação ao ponto 1.',
      },
      {
        id: 'ponto3',
        title: 'Ponto 3 (se houver)',
        placeholder: 'Enunciado do ponto 3:\n\nReferência no texto:\n\nDesenvolvimento (explicação):\n\nIlustração:\n\nAplicação:',
        aiTrigger: 'Desenvolva o terceiro ponto do sermão, se o texto o sustentar. Inclua enunciado, ancoragem textual, desenvolvimento, ilustração e aplicação. Se o texto não sustentar três pontos, indique isso claramente.',
      },
      {
        id: 'avaliacao_estrutura',
        title: 'Avaliação da estrutura',
        placeholder: 'Os pontos são paralelos em forma? São derivados do texto? Juntos desenvolvem a Grande Ideia? Há equilíbrio de desenvolvimento?\n\nAvaliação:',
        aiTrigger: 'Avalie a estrutura do sermão: os pontos são paralelos em forma gramatical? São todos derivados do texto? Desenvolvem completamente a Grande Ideia? Há equilíbrio de desenvolvimento entre eles? Sugira ajustes se necessário.',
      },
    ],
  },
  {
    slug: 'transicoes',
    title: '4. Transições',
    shortTitle: 'Transições',
    module: 'dispositio',
    group: 'estrutura',
    groupLabel: 'Estrutura do Sermão',
    order: 17,
    objective: 'Redigir as transições entre os pontos do sermão. Boas transições são invisíveis — o ouvinte flui de um ponto para o outro sem perceber a "costura", mas a coerência do argumento fica clara.',
    keyQuestions: [
      'A transição resume o ponto anterior?',
      'A transição anuncia o próximo ponto de modo natural?',
      'O ouvinte entende a lógica que conecta os dois pontos?',
      'A transição reforça a Grande Ideia central?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'Dennis Cahill'],
    cards: [
      {
        id: 'transicao_intro_p1',
        title: 'Introdução → Ponto 1',
        placeholder: 'Redija a transição da introdução para o primeiro ponto do sermão.\n\nTransição:',
        aiTrigger: 'Redija a transição da introdução para o primeiro ponto do sermão. Deve resumir o que foi estabelecido na introdução e anunciar naturalmente o primeiro ponto.',
      },
      {
        id: 'transicao_1_2',
        title: 'Ponto 1 → Ponto 2',
        placeholder: 'Redija a transição do primeiro para o segundo ponto. Resuma o ponto 1 e anuncia o ponto 2.\n\nTransição:',
        aiTrigger: 'Redija a transição do primeiro para o segundo ponto do sermão. Deve resumir a contribuição do ponto 1 e conduzir naturalmente para o ponto 2, reforçando a coerência do argumento.',
      },
      {
        id: 'transicao_2_3',
        title: 'Ponto 2 → Ponto 3 (se houver)',
        placeholder: 'Redija a transição do segundo para o terceiro ponto, se houver.\n\nTransição:',
        aiTrigger: 'Redija a transição do segundo para o terceiro ponto do sermão, se houver. Deve resumir o ponto 2 e conduzir para o terceiro com naturalidade.',
      },
    ],
  },
  {
    slug: 'aplicacao',
    title: '5. Aplicação',
    shortTitle: 'Aplicação',
    module: 'dispositio',
    group: 'encerramento',
    groupLabel: 'Aplicação e Conclusão',
    order: 18,
    objective: 'Desenvolver a aplicação do sermão — como a verdade do texto transforma concretamente a vida do ouvinte. A aplicação não é um acréscimo ao sermão: é o destino de toda a pregação expositiva.',
    keyQuestions: [
      'O que o ouvinte deve crer diferentemente depois deste sermão?',
      'O que o ouvinte deve fazer diferentemente?',
      'Como Cristo é o fundamento e o motivador desta aplicação?',
      'A aplicação é específica o suficiente para ser obedecida?',
      'Há aplicações para diferentes situações de vida na congregação?',
    ],
    relevantAuthors: ['Bryan Chapell', 'Timothy Keller', 'John Stott', 'Sinclair Ferguson'],
    cards: [
      {
        id: 'aplicacao_crenca',
        title: 'O que crer',
        placeholder: 'Que verdade doutrinária ou teológica o ouvinte deve abraçar, aprofundar ou corrigir a partir deste texto?\n\nO que crer:',
        aiTrigger: 'Que verdade doutrinária ou teológica este texto exige que o ouvinte creia, aprofunde ou corrija? Formule a aplicação cognitiva do sermão — o que deve mudar na mente e no coração.',
      },
      {
        id: 'aplicacao_pratica',
        title: 'O que fazer',
        placeholder: 'Que atitude, hábito, decisão ou comportamento concreto este texto exige do ouvinte?\n\nO que fazer:',
        aiTrigger: 'Que atitude, decisão, hábito ou comportamento concreto este texto exige do ouvinte? A aplicação prática deve ser específica, alcançável e diretamente derivada do texto.',
      },
      {
        id: 'aplicacao_cristologica',
        title: 'Cristo como centro e motivação',
        placeholder: 'Como Cristo é o fundamento, o modelo e a motivação desta aplicação? Sem o evangelho, a aplicação vira moralismo.\n\nCristo na aplicação:',
        aiTrigger: 'Como Cristo é o fundamento e a motivação desta aplicação? Mostre como o evangelho — a obra de Cristo — é o que torna esta obediência possível e sustentável, não moralismo.',
      },
      {
        id: 'ilustracoes',
        title: 'Ilustrações',
        placeholder: 'Que histórias, exemplos, analogias ou situações da vida real ilustram os pontos e a aplicação do sermão?\n\nIlustrações:',
        aiTrigger: 'Sugira ilustrações para os pontos e a aplicação deste sermão. Podem ser histórias da vida real, analogias, exemplos históricos ou situações contemporâneas que tornem a verdade do texto concreta e memorável.',
      },
    ],
  },
  {
    slug: 'conclusao_sermao',
    title: '6. Conclusão',
    shortTitle: 'Conclusão',
    module: 'dispositio',
    group: 'encerramento',
    groupLabel: 'Aplicação e Conclusão',
    order: 19,
    objective: 'Construir uma conclusão que sintetize o sermão, reforce a Grande Ideia e convoque o ouvinte à resposta. A conclusão não introduz ideias novas — ela conduz o ouvinte a agir sobre o que foi pregado.',
    keyQuestions: [
      'A conclusão resume o argumento completo do sermão?',
      'A Grande Ideia é reafirmada com força?',
      'Há um apelo claro e específico à resposta?',
      'A conclusão termina com Cristo e o evangelho?',
      'O ouvinte sabe exatamente o que fazer ao sair?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'Martyn Lloyd-Jones', 'Charles Spurgeon'],
    cards: [
      {
        id: 'sintese_final',
        title: 'Síntese do sermão',
        placeholder: 'Resuma em 3-5 frases o argumento completo do sermão. Esta síntese deve reafirmar a Grande Ideia e os pontos principais.\n\nSíntese:',
        aiTrigger: 'Redija a síntese final do sermão em 3-5 frases que resumam o argumento completo, reafirmem a Grande Ideia e os pontos principais de modo coeso e memorável.',
      },
      {
        id: 'apelo',
        title: 'Apelo à resposta',
        placeholder: 'Qual é o apelo final? O que você está pedindo ao ouvinte que faça, creia ou decida agora?\n\nApelo:',
        aiTrigger: 'Redija o apelo final do sermão — o chamado concreto à resposta. Deve ser claro, específico e fundamentado no evangelho, não na culpa ou no esforço humano.',
      },
      {
        id: 'encerramento',
        title: 'Frase de encerramento',
        placeholder: 'A última frase do sermão. Deve ser memorável, cristocêntrica e deixar o ouvinte com a Grande Ideia gravada.\n\nEncerramento:',
        aiTrigger: 'Redija a frase final do sermão — a última coisa que o ouvinte ouvirá. Deve ser memorável, centrada em Cristo e deixar a Grande Ideia gravada na memória.',
      },
    ],
  },
]

WORKSPACE_SECTIONS.push(...DISPOSITIO_SECTIONS)

// ── GRUPOS ─────────────────────────────────────────────────────────────────

// ── ELOCUTIO ────────────────────────────────────────────────────────────────

const ELOCUTIO_SECTIONS: SectionDef[] = [
  {
    slug: 'vocabulario_clareza',
    title: '1. Vocabulário e Clareza',
    shortTitle: 'Vocabulário',
    module: 'elocutio',
    group: 'vocabulario',
    groupLabel: 'Vocabulário e Clareza',
    order: 20,
    objective:
      'Selecionar palavras precisas, acessíveis e concretas que comuniquem a verdade do texto sem jargão desnecessário nem imprecisão teológica. A palavra certa no lugar certo é o primeiro elemento do estilo.',
    keyQuestions: [
      'O vocabulário é adequado ao nível de escolaridade da congregação?',
      'Quais termos técnicos são indispensáveis? Como explicá-los?',
      'As frases são diretas e sem ambiguidade?',
      'Há palavras que obscurecem em vez de iluminar?',
      'O vocabulário é concreto (imagens, ações) ou excessivamente abstrato?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Stuart Murray', 'Bryan Chapell', 'John Stott', 'Martyn Lloyd-Jones'],
    cards: [
      {
        id: 'nivel_linguagem',
        title: 'Nível de linguagem',
        placeholder: 'Qual o nível de linguagem adequado para esta congregação? Descreva o perfil do auditório e ajuste o vocabulário conforme.\n\nPerfil do auditório:\n\nNível de linguagem escolhido:\n\nJustificativa:',
        aiTrigger: 'Analise o nível de linguagem mais adequado para pregar este sermão. Considere o perfil típico de uma congregação reformada. Que vocabulário deve ser preferido? Que expressões devem ser evitadas?',
      },
      {
        id: 'jargao_teologico',
        title: 'Termos técnicos e jargão',
        placeholder: 'Liste os termos teológicos essenciais do sermão. Para cada um, escreva como explicá-lo de modo acessível sem perder precisão.\n\nTermo → Explicação acessível:',
        aiTrigger: 'Quais termos teológicos ou técnicos são indispensáveis neste sermão? Para cada um, proponha uma forma de explicá-lo que seja ao mesmo tempo precisa e acessível a uma congregação leiga.',
      },
      {
        id: 'clareza_frases',
        title: 'Clareza e concisão',
        placeholder: 'Revise três a cinco frases-chave do sermão em busca de clareza. Reescreva as que estiverem longas, ambíguas ou passivas.\n\nFrases revisadas:',
        aiTrigger: 'Sugira como tornar mais claras e concisas as sentenças centrais deste sermão. Prefira voz ativa, sujeito no início, verbos concretos e frases curtas. Evite subordinadas encadeadas e jargão desnecessário.',
      },
    ],
  },
  {
    slug: 'figuras_linguagem',
    title: '2. Imagens e Retórica',
    shortTitle: 'Imagens',
    module: 'elocutio',
    group: 'imagens',
    groupLabel: 'Imagens e Retórica',
    order: 21,
    objective:
      'Empregar metáforas, analogias, comparações e imagens que tornem o abstrato concreto e o invisível visível. A retórica não é ornamento — é o meio pelo qual a mente do ouvinte é movida à verdade.',
    keyQuestions: [
      'Qual metáfora central organiza o sermão?',
      'As analogias iluminam ou desviam a atenção do texto?',
      'Há imagens concretas do cotidiano que ancoram os conceitos?',
      'O ouvinte consegue "ver" o que o texto diz?',
      'As figuras de linguagem estão em harmonia com o tom pastoral?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'Eugene Lowry', 'Fred Craddock', 'Charles Spurgeon'],
    cards: [
      {
        id: 'metaforas_analogias',
        title: 'Metáforas e analogias',
        placeholder: 'Quais metáforas ou analogias tornam a verdade central do texto concreta e memorável? Liste e avalie cada uma.\n\nMetáfora/Analogia → O que ilumina:',
        aiTrigger: 'Proponha metáforas e analogias que tornem a verdade central desta perícope concreta e memorável para o ouvinte. As imagens devem ser do cotidiano contemporâneo, iluminando a verdade do texto sem distorcê-la.',
      },
      {
        id: 'imagens_concretas',
        title: 'Imagens do cotidiano',
        placeholder: 'Que situações, objetos ou experiências da vida comum podem servir como janelas para a verdade do texto?\n\nImagens:',
        aiTrigger: 'Sugira imagens concretas do cotidiano — situações, objetos, experiências comuns — que sirvam como "janelas" para a verdade desta perícope. O ouvinte deve conseguir ver a verdade, não apenas ouvi-la.',
      },
      {
        id: 'recursos_retoricos',
        title: 'Recursos retóricos',
        placeholder: 'Identifique recursos retóricos úteis: anáfora, antítese, climax, pergunta retórica, repetição. Como cada um reforça a mensagem?\n\nRecursos:',
        aiTrigger: 'Que recursos retóricos — anáfora, antítese, clímax, pergunta retórica, repetição enfática — potencializam a força persuasiva deste sermão? Ofereça exemplos concretos de frases que usem esses recursos.',
      },
    ],
  },
  {
    slug: 'tom_pastoral',
    title: '3. Tom e Voz Pastoral',
    shortTitle: 'Tom',
    module: 'elocutio',
    group: 'tom',
    groupLabel: 'Tom e Voz Pastoral',
    order: 22,
    objective:
      'Calibrar o tom do sermão — profético, pastoral, exortativo, consolatório — conforme a natureza do texto e as necessidades da congregação. O tom comunica tanto quanto o conteúdo.',
    keyQuestions: [
      'Qual é o tom predominante do próprio texto bíblico?',
      'O sermão deve consolar, exortar, corrigir ou celebrar?',
      'Onde o tom deve mudar ao longo do sermão?',
      'O tom é consistente com o caráter pastoral e a missão da igreja?',
      'O pregador fala como alguém de dentro da situação, não de fora?',
    ],
    relevantAuthors: ['Martyn Lloyd-Jones', 'John Stott', 'Tim Keller', 'Bryan Chapell', 'Charles Spurgeon'],
    cards: [
      {
        id: 'tom_geral',
        title: 'Tom geral do sermão',
        placeholder: 'Qual é o tom dominante deste sermão? Por que este tom é adequado a este texto e a esta congregação?\n\nTom:\n\nJustificativa:',
        aiTrigger: 'Que tom — profético, pastoral, celebrativo, consolatório, exortativo — é mais adequado ao pregar esta perícope? Por que o próprio texto demanda este tom? Como sustentá-lo ao longo do sermão?',
      },
      {
        id: 'variacao_tonal',
        title: 'Variações de tom',
        placeholder: 'Em que momentos do sermão o tom muda? Da confrontação ao consolo, da exortação à celebração. Mapeie as transições.\n\nVariações:',
        aiTrigger: 'Mapeie as variações de tom ao longo do sermão. Onde deve haver confrontação? Onde consolação? Onde celebração? Como fazer transições tonais naturais que reflitam o próprio movimento do texto?',
      },
      {
        id: 'voz_pregador',
        title: 'Voz e autoridade pastoral',
        placeholder: 'O pregador fala como pastor que conhece sua congregação. Como equilibrar autoridade bíblica com ternura pastoral? Como falar "de dentro" e não "de cima"?\n\nVoz pastoral:',
        aiTrigger: 'Como o pregador deve equilibrar autoridade bíblica com ternura pastoral neste sermão? Que postura vocal e relacional deve perpassar a pregação — falar como pastor que ama sua congregação, não como juiz que a condena.',
      },
    ],
  },
]

WORKSPACE_SECTIONS.push(...ELOCUTIO_SECTIONS)

// ── MEMORIA ──────────────────────────────────────────────────────────────────

const MEMORIA_SECTIONS: SectionDef[] = [
  {
    slug: 'internalizacao_estrutura',
    title: '1. Internalização da Estrutura',
    shortTitle: 'Estrutura Mental',
    module: 'memoria',
    group: 'memorizacao',
    groupLabel: 'Internalização',
    order: 23,
    objective:
      'Criar um mapa mental do sermão que permita pregá-lo com fluência e naturalidade. A memória não é decoreba — é o domínio da lógica e do fluxo do sermão a ponto de poder reformulá-lo com palavras próprias.',
    keyQuestions: [
      'Qual é a lógica que conecta cada parte do sermão?',
      'Qual palavra-âncora representa cada ponto principal?',
      'O esboço de pregação é simples o suficiente para ser lembrado?',
      'Você consegue pregar o sermão de trás para frente?',
      'O sermão foi orado e não apenas estudado?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Martyn Lloyd-Jones', 'Charles Spurgeon', 'John Broadus'],
    cards: [
      {
        id: 'esboço_pulpito',
        title: 'Esboço de púlpito',
        placeholder: 'Redija o esboço simplificado para uso no púlpito — apenas os pontos principais e palavras-âncora. Uma meia-página no máximo.\n\nGrande Ideia:\n\nPonto 1:\nPonto 2:\nPonto 3:\nConclusão:',
        aiTrigger: 'Crie um esboço de púlpito simplificado para este sermão: apenas os pontos principais, palavras-âncora de cada subdivisão e a Grande Ideia central. Deve caber em meia página e ser memorizável.',
      },
      {
        id: 'palavras_ancora',
        title: 'Palavras-âncora',
        placeholder: 'Para cada ponto e transição, escolha uma palavra ou imagem mental que funcione como âncora de memória. Esta palavra deve evocar todo o desenvolvimento do ponto.\n\nPonto 1 — âncora:\nPonto 2 — âncora:\nPonto 3 — âncora:',
        aiTrigger: 'Proponha palavras-âncora para cada ponto deste sermão — uma palavra ou imagem mental que, ao ser lembrada, evoque todo o desenvolvimento do ponto. As âncoras devem ser concretas, distintas e ligadas ao texto.',
      },
      {
        id: 'logica_fluxo',
        title: 'Lógica e fluxo',
        placeholder: 'Escreva a lógica do sermão em linguagem coloquial: "Começo falando de... porque o texto diz... então mostro... e concluo com...". Esta narrativa deve fluir naturalmente.\n\nFluxo:',
        aiTrigger: 'Descreva em linguagem coloquial a lógica e o fluxo completo deste sermão — como se estivesse contando para um colega o que vai pregar. O objetivo é verificar se o argumento flui de forma natural e memorável.',
      },
    ],
  },
  {
    slug: 'pratica_revisao',
    title: '2. Prática e Pré-pregação',
    shortTitle: 'Pré-pregação',
    module: 'memoria',
    group: 'memorizacao',
    groupLabel: 'Internalização',
    order: 24,
    objective:
      'Planejar a estratégia de revisão, prática em voz alta e preparação espiritual antes da pregação. A prática não é ensaio teatral — é o último ato de domínio do sermão a serviço da congregação.',
    keyQuestions: [
      'Quando e como praticar o sermão em voz alta?',
      'Quais seções são mais vulneráveis a "travar"?',
      'O sermão foi orado com fervura antes de ser pregado?',
      'Há checklist pré-pregação com os pontos críticos?',
      'O pregador está descansado, preparado espiritualmente e focado?',
    ],
    relevantAuthors: ['Martyn Lloyd-Jones', 'John Stott', 'Charles Spurgeon', 'Tim Keller'],
    cards: [
      {
        id: 'plano_pratica',
        title: 'Plano de prática',
        placeholder: 'Quando e como praticar o sermão antes de pregá-lo? Em voz alta, cronometrado, gravado?\n\nPlano:\n\nDias antes:\nForma de prática:\nDuração alvo do sermão:',
        aiTrigger: 'Proponha um plano de prática para este sermão na semana anterior à pregação. Inclua: quando praticar em voz alta, como cronometrar, se gravar ou não, como revisar os pontos vulneráveis.',
      },
      {
        id: 'pontos_vulneraveis',
        title: 'Pontos vulneráveis',
        placeholder: 'Onde posso me perder no sermão? Que transições ou argumentos são mais difíceis de lembrar? Como salvaguardá-los?\n\nPontos críticos:\n\nSalvaguardas:',
        aiTrigger: 'Identifique os pontos mais vulneráveis deste sermão — onde o pregador tem mais chance de perder o fio. Proponha salvaguardas: frases-gatilho, âncoras visuais, notas mínimas no esboço.',
      },
      {
        id: 'preparacao_espiritual',
        title: 'Preparação espiritual',
        placeholder: 'A pregação começa com oração, não com estudo. Como se preparar espiritualmente para pregar esta mensagem específica?\n\nPontos de intercessão:\n\nTextos para oração:',
        aiTrigger: 'Que aspectos desta perícope e deste sermão devem ser especialmente levados à oração antes de pregá-lo? Que demandas espirituais este texto faz ao pregador antes que ele possa pregá-lo com integridade?',
      },
    ],
  },
]

WORKSPACE_SECTIONS.push(...MEMORIA_SECTIONS)

// ── PRONUNTIATIO ──────────────────────────────────────────────────────────────

const PRONUNTIATIO_SECTIONS: SectionDef[] = [
  {
    slug: 'voz_dicao',
    title: '1. Voz e Dicção',
    shortTitle: 'Voz',
    module: 'pronuntiatio',
    group: 'entrega',
    groupLabel: 'Entrega e Comunicação',
    order: 25,
    objective:
      'Cuidar da projeção vocal, articulação, variação de tom e ritmo para que a mensagem seja ouvida com clareza e autoridade. A voz é o instrumento principal do pregador — deve ser cultivada e usada a serviço do texto.',
    keyQuestions: [
      'O volume é adequado para o espaço sem amplificação eletrônica excessiva?',
      'A articulação é clara, especialmente em termos teológicos?',
      'Há variação de tom que evita a monotonia?',
      'O ritmo permite que o ouvinte processe cada ideia?',
      'As pausas são usadas estrategicamente para ênfase?',
    ],
    relevantAuthors: ['Martyn Lloyd-Jones', 'Charles Spurgeon', 'John Broadus', 'Haddon Robinson'],
    cards: [
      {
        id: 'projecao_articulacao',
        title: 'Projeção e articulação',
        placeholder: 'Avalie sua projeção e articulação: volume adequado ao espaço, dicção clara, termos pronunciados corretamente. Quais palavras exigem atenção especial?\n\nAvaliação:\n\nPalavras a cuidar:',
        aiTrigger: 'Que aspectos de projeção vocal e articulação são mais críticos ao pregar este sermão? Quais termos teológicos ou nomes próprios exigem atenção especial na pronúncia? Como projetar autoridade sem gritar?',
      },
      {
        id: 'variacao_ritmo',
        title: 'Variação e ritmo',
        placeholder: 'Onde acelerar o ritmo para criar tensão? Onde desacelerar para deixar uma verdade assentar? Onde fazer pausa dramática?\n\nVariações de ritmo planejadas:',
        aiTrigger: 'Proponha variações de ritmo para este sermão: onde acelerar para criar tensão ou urgência, onde desacelerar para deixar uma verdade assentar, onde fazer pausa dramática. O ritmo deve espelhar o movimento do próprio texto.',
      },
      {
        id: 'enfase_pausas',
        title: 'Ênfase e pausas',
        placeholder: 'Quais afirmações merecem pausa após serem ditas? Quais frases devem ser repetidas para ênfase? Marque no esboço os momentos de pausa intencional.\n\nMomentos de ênfase e pausa:',
        aiTrigger: 'Que afirmações deste sermão merecem pausa após serem ditas — para que o ouvinte as processe e sinta seu peso? Quais frases podem ser repetidas para ênfase? Como usar o silêncio como instrumento retórico?',
      },
    ],
  },
  {
    slug: 'linguagem_corporal',
    title: '2. Linguagem Corporal e Presença',
    shortTitle: 'Linguagem Corporal',
    module: 'pronuntiatio',
    group: 'entrega',
    groupLabel: 'Entrega e Comunicação',
    order: 26,
    objective:
      'Usar o corpo — postura, gestos e contato visual — como amplificador da mensagem, não como distração. Presença física no púlpito comunica convicção, autoridade e cuidado pastoral.',
    keyQuestions: [
      'A postura comunica convicção e autoridade?',
      'Os gestos reforçam ou distraem da mensagem?',
      'O contato visual distribui-se por toda a congregação?',
      'Há tiques ou maneirismos que devem ser eliminados?',
      'O corpo está a serviço do texto ou chamando atenção para si?',
    ],
    relevantAuthors: ['Haddon Robinson', 'John Stott', 'Bryan Chapell', 'Richard Lischer'],
    cards: [
      {
        id: 'postura_presenca',
        title: 'Postura e presença',
        placeholder: 'Como estar no púlpito: pés fixos ou em movimento? Mãos onde? Postura que comunica convicção sem rigidez?\n\nPostura intencional:',
        aiTrigger: 'Como o pregador deve se posicionar no púlpito ao pregar este sermão? Que postura comunica convicção e autoridade sem rigidez? Quando e como movimentar-se no espaço de modo que reforce a mensagem?',
      },
      {
        id: 'gestos',
        title: 'Gestos intencionais',
        placeholder: 'Que gestos reforçam os momentos-chave do sermão? Liste gestos intencionais e identifique tiques a eliminar.\n\nGestos intencionais:\n\nTiques a eliminar:',
        aiTrigger: 'Que gestos podem reforçar os momentos-chave deste sermão — enumeração, abertura, apontar para o texto? Quais gestos devem ser evitados por distraírem? O gesto deve nascer da convicção, não ser ensaiado artificialmente.',
      },
      {
        id: 'contato_visual',
        title: 'Contato visual',
        placeholder: 'Como distribuir o olhar por toda a congregação? Como manter contato visual enquanto consulta o esboço?\n\nEstratégia de contato visual:',
        aiTrigger: 'Como o pregador deve gerenciar o contato visual ao pregar este sermão? Como distribuir o olhar por diferentes setores da congregação? Como alternar entre o esboço e o olhar direto sem perder conexão com o auditório?',
      },
    ],
  },
  {
    slug: 'avaliacao_pregacao',
    title: '3. Avaliação Pós-pregação',
    shortTitle: 'Avaliação',
    module: 'pronuntiatio',
    group: 'avaliacao_pregacao',
    groupLabel: 'Avaliação',
    order: 27,
    objective:
      'Refletir sobre a pregação após entregá-la, identificando pontos fortes, fracos e áreas de crescimento. O pregador que avalia sua pregação sistematicamente cresce mais rápido do que aquele que apenas prega.',
    keyQuestions: [
      'O sermão comunicou a Grande Ideia com clareza?',
      'O texto foi exposto ou apenas ilustrado?',
      'O ouvinte saiu sabendo o que crer e o que fazer?',
      'Onde o sermão perdeu o auditório?',
      'O que fazer diferente na próxima pregação?',
    ],
    relevantAuthors: ['Haddon Robinson', 'Bryan Chapell', 'Tim Keller', 'Martyn Lloyd-Jones'],
    cards: [
      {
        id: 'auto_avaliacao',
        title: 'Autoavaliação',
        placeholder: 'O que funcionou bem? O que não funcionou? Onde o sermão perdeu força? Seja honesto e específico.\n\nO que funcionou:\n\nO que não funcionou:\n\nOnde perdi o auditório:',
        aiTrigger: 'Crie um roteiro de autoavaliação para após pregar este sermão. Que perguntas o pregador deve se fazer sobre conteúdo, estrutura, linguagem e entrega? Como avaliar se a Grande Ideia foi comunicada com clareza?',
      },
      {
        id: 'feedback_recebido',
        title: 'Feedback recebido',
        placeholder: 'O que membros da congregação ou colegas de ministério disseram sobre o sermão? O que o feedback revela sobre a comunicação?\n\nFeedback:\n\nO que aprender com ele:',
        aiTrigger: 'Que tipo de feedback o pregador deve buscar após pregar este sermão? Que perguntas fazer a membros da congregação ou mentores? Como distinguir feedback útil de mero elogio ou crítica infundada?',
      },
      {
        id: 'crescimento_continuo',
        title: 'Crescimento contínuo',
        placeholder: 'Com base nesta pregação, qual é a área de maior crescimento a trabalhar? Qual habilidade homilética praticar nas próximas semanas?\n\nÁrea de crescimento:\n\nPlano de desenvolvimento:',
        aiTrigger: 'Com base nas características desta perícope e no tipo de sermão que ela exige, que habilidade homilética o pregador deveria desenvolver? Que exercício prático de pregação pode ser feito nas próximas semanas para crescer nessa área?',
      },
    ],
  },
]

WORKSPACE_SECTIONS.push(...PRONUNTIATIO_SECTIONS)

export const INVENTIO_GROUPS = [
  { id: 'contextual', label: 'Estudo Contextual' },
  { id: 'textual', label: 'Estudo Textual' },
  { id: 'teologico', label: 'Estudo Teológico' },
] as const

export const DISPOSITIO_GROUPS = [
  { id: 'proposicao', label: 'Ideia e Proposição' },
  { id: 'estrutura', label: 'Estrutura do Sermão' },
  { id: 'encerramento', label: 'Aplicação e Conclusão' },
] as const

export const ELOCUTIO_GROUPS = [
  { id: 'vocabulario', label: 'Vocabulário e Clareza' },
  { id: 'imagens', label: 'Imagens e Retórica' },
  { id: 'tom', label: 'Tom e Voz Pastoral' },
] as const

export const MEMORIA_GROUPS = [
  { id: 'memorizacao', label: 'Internalização' },
] as const

export const PRONUNTIATIO_GROUPS = [
  { id: 'entrega', label: 'Entrega e Comunicação' },
  { id: 'avaliacao_pregacao', label: 'Avaliação' },
] as const

// ── HELPERS ────────────────────────────────────────────────────────────────

export function getSectionsByGroup(groupId: string): SectionDef[] {
  return WORKSPACE_SECTIONS.filter(s => s.group === groupId).sort((a, b) => a.order - b.order)
}

export function getSectionBySlug(slug: string): SectionDef | undefined {
  return WORKSPACE_SECTIONS.find(s => s.slug === slug)
}

// ── SÍNTESES ───────────────────────────────────────────────────────────────

export interface SynthesisDef {
  slug: string
  title: string
  shortTitle: string
  groupId: string
  groupLabel: string
  nextGroup: { id: string; label: string; phaseId: 'interpretar' | 'comunicar' }
  ctaDescription: string
}

export const SYNTHESIS_DEFS: Record<string, SynthesisDef> = {
  contextual: {
    slug: '_sintese_contextual',
    title: 'Síntese do Estudo Contextual',
    shortTitle: 'Síntese',
    groupId: 'contextual',
    groupLabel: 'Estudo Contextual',
    nextGroup: { id: 'textual', label: 'Estudo Textual', phaseId: 'interpretar' },
    ctaDescription: 'O horizonte histórico-cultural está mapeado. Avance para a análise gramatical, léxica e estrutural do texto original.',
  },
  textual: {
    slug: '_sintese_textual',
    title: 'Síntese do Estudo Textual',
    shortTitle: 'Síntese',
    groupId: 'textual',
    groupLabel: 'Estudo Textual',
    nextGroup: { id: 'teologico', label: 'Estudo Teológico', phaseId: 'interpretar' },
    ctaDescription: 'A análise textual está completa. Avance para a investigação canônica, revelacional e teológica da passagem.',
  },
  teologico: {
    slug: '_sintese_teologica',
    title: 'Síntese do Estudo Teológico',
    shortTitle: 'Síntese',
    groupId: 'teologico',
    groupLabel: 'Estudo Teológico',
    nextGroup: { id: 'proposicao', label: 'Construção do Sermão', phaseId: 'comunicar' },
    ctaDescription: 'O estudo exegético está consolidado. É hora de construir o sermão — transformar exegese em proclamação fiel.',
  },
}

export function isSynthesisSlug(slug: string): boolean {
  return slug.startsWith('_sintese_')
}

export function getSynthesisBySlug(slug: string): SynthesisDef | undefined {
  return Object.values(SYNTHESIS_DEFS).find(s => s.slug === slug)
}
