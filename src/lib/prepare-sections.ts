import type { SectionDef } from './workspace-sections'

function card(id: string, title: string, placeholder: string, aiTrigger: string) {
  return { id, title, placeholder, aiTrigger }
}

export const PREPARE_SECTIONS: SectionDef[] = [
  {
    slug: 'preparacao_espiritual',
    title: '1. Preparação Espiritual',
    shortTitle: 'Preparação Espiritual',
    phase: 'preparar',
    module: 'inventio',
    group: 'preparar_espiritual',
    groupLabel: 'Piedade, planejamento e oração',
    order: -40,
    objective:
      'Iniciar o estudo de modo reverente e pastoral, permitindo que o texto forme o coração do intérprete antes que ele comece a analisá-lo tecnicamente.',
    keyQuestions: [
      'Como este texto chama você à dependência de Deus?',
      'O que precisa ser confessado, pedido ou rendido antes do estudo?',
      'Que necessidade pastoral está diante de você e da congregação?',
      'Como o estudo pode nascer de oração, e não apenas de técnica?',
    ],
    relevantAuthors: ['João Calvino', 'John Owen', 'Martyn Lloyd-Jones', 'John Stott', 'Sinclair Ferguson'],
    cards: [
      card('preparar_oracao', 'Oração', 'Escreva uma oração honesta diante de Deus antes de estudar o texto. Registre dependência, pedidos, confissão, temor santo e desejo pastoral.', 'Conduza-me em uma oração pastoral e reverente antes de estudar esta passagem, sem tecnicismo e com foco em dependência de Deus.'),
      card('preparar_pedidos', 'Pedidos e dependência', 'Liste pedidos específicos: iluminação, humildade, fidelidade ao texto, amor pela igreja, coragem pastoral e obediência pessoal.', 'Ajude-me a formular pedidos espirituais específicos para estudar e comunicar esta passagem com fidelidade.'),
      card('preparar_percepcoes', 'Percepções espirituais', 'Registre percepções iniciais sobre o que Deus parece expor, consolar, corrigir ou despertar em você por meio do texto.', 'Faça perguntas devocionais suaves que me ajudem a perceber como esta passagem trabalha meu coração.'),
      card('preparar_objetivo_estudo', 'Objetivo do estudo', 'Defina por que você está estudando esta passagem agora e que fruto pastoral espera desse processo.', 'Ajude-me a formular um objetivo espiritual e pastoral para o estudo desta passagem.'),
      card('preparar_ocasiiao_publico', 'Ocasião e público', 'Descreva a ocasião, o público, a série, o contexto ministerial e a necessidade pastoral que cercam este estudo.', 'Ajude-me a discernir a ocasião, o público e a necessidade pastoral relacionados a esta passagem.'),
    ],
  },
  {
    slug: 'preparar_leia_assimile',
    title: '2. Leia e Assimile a Ideia do Texto',
    shortTitle: 'Leia e Assimile',
    phase: 'preparar',
    module: 'inventio',
    group: 'preparar_assimilacao',
    groupLabel: 'Contato direto com a Escritura',
    order: -39,
    objective:
      'Absorver o texto antes da análise formal, por meio de leitura lenta, repetida, em voz alta e comparada, buscando ouvir a passagem como Escritura viva.',
    keyQuestions: [
      'O que mais chamou sua atenção na primeira leitura?',
      'Qual parece ser a ideia central antes de qualquer comentário técnico?',
      'Que repetições, tensões, emoções ou movimentos aparecem?',
      'O que o autor parece querer produzir no leitor ou ouvinte?',
    ],
    relevantAuthors: ['Eugene Peterson', 'John Stott', 'Gordon Fee', 'Douglas Stuart'],
    cards: [
      card('preparar_leitura_lenta', 'Leitura lenta', 'Registre como foi a leitura lenta da passagem. O que ficou mais evidente quando você desacelerou?', 'Guie-me em uma leitura lenta desta passagem, priorizando observação simples e reverente.'),
      card('preparar_multiplas_leituras', 'Múltiplas leituras', 'Anote diferenças percebidas entre a primeira, segunda e terceira leitura. O que cresceu em clareza?', 'Sugira um roteiro de múltiplas leituras para assimilar esta passagem antes da exegese técnica.'),
      card('preparar_comparacao_traducoes', 'Comparação de traduções', 'Compare traduções em português e registre diferenças que chamam atenção, sem ainda resolver tecnicamente todos os detalhes.', 'Ajude-me a comparar traduções desta passagem em nível inicial, observando diferenças relevantes sem aprofundar gramática ainda.'),
      card('preparar_leitura_voz_alta', 'Leitura em voz alta', 'Registre o ritmo, o tom, as pausas naturais e as emoções percebidas ao ler o texto em voz alta.', 'Ajude-me a perceber o tom e o movimento da passagem por meio de leitura em voz alta.'),
      card('preparar_ideia_inicial', 'Ideia central inicial', 'Escreva, em linguagem provisória, qual parece ser a ideia central da passagem neste primeiro contato.', 'Ajude-me a formular uma ideia central inicial e provisória para esta passagem, sem fechar a exegese cedo demais.'),
      card('preparar_tensoes_repeticoes', 'Tensões e repetições', 'Liste tensões, contrastes, palavras repetidas, emoções dominantes e movimentos aparentes do texto.', 'Faça perguntas de observação inicial sobre tensões, repetições, emoções e movimentos desta passagem.'),
    ],
  },
  {
    slug: 'preparar_primeiras_impressoes',
    title: '3. Primeiras Impressões',
    shortTitle: 'Primeiras Impressões',
    phase: 'preparar',
    module: 'inventio',
    group: 'preparar_impressoes',
    groupLabel: 'Notas rápidas e perguntas',
    order: -38,
    objective:
      'Criar um espaço livre para registrar observações, perguntas, dificuldades, conexões e marcações antes da pesquisa acadêmica.',
    keyQuestions: [
      'Que perguntas você ainda não consegue responder?',
      'Que conexão inicial parece importante, mas precisa ser testada?',
      'Que dificuldade textual, pastoral ou espiritual apareceu?',
      'Que marcações ou destaques merecem voltar depois?',
    ],
    relevantAuthors: ['Haddon Robinson', 'John Stott', 'Bryan Chapell'],
    cards: [
      card('preparar_observacoes_livres', 'Observações livres', 'Anote impressões, detalhes, surpresas, dúvidas e percepções iniciais sem censurar ou organizar demais.', 'Ajude-me a transformar minhas primeiras observações em perguntas úteis para a próxima etapa de estudo.'),
      card('preparar_perguntas_dificuldades', 'Perguntas e dificuldades', 'Liste perguntas abertas, dificuldades interpretativas, termos obscuros e pontos que exigirão pesquisa posterior.', 'Organize minhas dúvidas iniciais em categorias: texto, contexto, teologia, aplicação e comunicação.'),
      card('preparar_conexoes_iniciais', 'Conexões iniciais', 'Registre conexões com outros textos bíblicos, temas teológicos, experiências pastorais ou necessidades da igreja.', 'Sugira conexões iniciais e cuidadosas entre esta passagem, temas bíblicos e necessidades pastorais.'),
      card('preparar_marcacoes', 'Marcações e destaques', 'Registre palavras, frases, movimentos ou imagens que você destacaria no texto durante a imersão.', 'Ajude-me a identificar marcações iniciais no texto: repetições, contrastes, imagens, mudanças de cena e ênfases.'),
      card('preparar_modo_imersao', 'Modo Imersão', 'Use este espaço como tela limpa: copie o texto bíblico, escreva notas rápidas, destaques e marcações sem comentários acadêmicos.', 'Conduza um modo imersão nesta passagem: apenas observação, contemplação, perguntas e marcações iniciais.'),
    ],
  },
  {
    slug: 'preparar_visao_geral',
    title: '4. Visão Geral da Passagem',
    shortTitle: 'Visão Geral',
    phase: 'preparar',
    module: 'inventio',
    group: 'preparar_visao_geral',
    groupLabel: 'Assimilação macro',
    order: -37,
    objective:
      'Perceber a passagem em sua totalidade antes da microanálise, identificando tema provável, movimento, estrutura, personagens, clímax e fluxo.',
    keyQuestions: [
      'Qual é o tema provável da passagem?',
      'Que estrutura você percebe antes de consultar comentários?',
      'Qual é o movimento narrativo ou fluxo argumentativo?',
      'Onde parece estar o clímax ou centro de gravidade do texto?',
    ],
    relevantAuthors: ['Grant Osborne', 'Gordon Fee', 'Douglas Stuart', 'Sidney Greidanus'],
    cards: [
      card('preparar_tema_provavel', 'Tema provável', 'Nomeie o tema provável da passagem em uma frase simples e provisória.', 'Ajude-me a formular um tema provável para esta passagem, mantendo caráter provisório e observacional.'),
      card('preparar_grande_ideia_inicial', 'Grande ideia inicial', 'Escreva uma primeira hipótese da grande ideia do texto, antes da exegese formal.', 'Ajude-me a formular uma grande ideia inicial da passagem, deixando claro o que ainda precisa ser confirmado.'),
      card('preparar_estrutura_percebida', 'Estrutura percebida', 'Esboce as partes da passagem como você as percebe neste momento inicial.', 'Ajude-me a perceber uma estrutura inicial da passagem com base em movimentos visíveis do texto.'),
      card('preparar_personagens', 'Personagens', 'Liste personagens, vozes, grupos, agentes ou participantes relevantes no texto.', 'Ajude-me a observar personagens, vozes e agentes da passagem sem antecipar conclusões técnicas.'),
      card('preparar_movimento_narrativo', 'Movimento narrativo', 'Para narrativas, descreva cenas, tensão, virada, clímax e resolução percebidos.', 'Ajude-me a observar o movimento narrativo desta passagem em nível macro.'),
      card('preparar_fluxo_argumentativo', 'Fluxo argumentativo', 'Para discursos ou epístolas, descreva como o pensamento parece progredir.', 'Ajude-me a observar o fluxo argumentativo desta passagem sem entrar ainda em análise sintática pesada.'),
      card('preparar_climax', 'Clímax', 'Indique onde o texto parece atingir seu ponto de maior peso ou virada.', 'Ajude-me a identificar o possível clímax desta passagem a partir de observações iniciais.'),
      card('preparar_palavras_repetidas', 'Palavras repetidas', 'Liste palavras, expressões, imagens ou ideias recorrentes.', 'Ajude-me a observar palavras repetidas e temas recorrentes na passagem.'),
    ],
  },
]
