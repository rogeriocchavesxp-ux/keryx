import { COMMUNICATION_SECTIONS } from './communication-sections'

export interface HelpEntry {
  id: string
  titulo: string
  descricao: string
  objetivo: string
  comoFazer: string[]
  perguntas: string[]
  erros: string[]
  exemplo: string
  ajudaIA: string
  dicasAvancadas?: string[]
}

type HelpCategory = 'contextual' | 'textual' | 'teologico' | 'homiletica' | 'estilo' | 'memoria' | 'entrega'

interface HelpSeed {
  id: string
  titulo: string
  categoria: HelpCategory
  foco: string
  exemplo: string
}

const HELP_SEEDS: HelpSeed[] = [
  { id: 'periodo_data', titulo: 'Período e data de composição do livro', categoria: 'contextual', foco: 'a data provável, o período histórico e as evidências internas e externas que sustentam essa localização', exemplo: 'Em Gálatas 1.6-9, a urgência contra outro evangelho ajuda a discutir se a carta se relaciona ao período anterior ou posterior ao concílio de Jerusalém.' },
  { id: 'contexto_politico', titulo: 'Contexto político do texto', categoria: 'contextual', foco: 'os poderes, conflitos, governos e pressões públicas que formam o pano de fundo do texto', exemplo: 'Em Lucas 2.1-7, o decreto de César Augusto mostra que o nascimento de Cristo ocorre sob a ordem imperial romana, mas a narrativa afirma a soberania de Deus sobre esse cenário.' },
  { id: 'contexto_religioso', titulo: 'Ambiente religioso pressuposto pelo texto', categoria: 'contextual', foco: 'o ambiente religioso, suas crenças concorrentes e as práticas que o autor pressupõe ou confronta', exemplo: 'Em 1 Coríntios 8.1-13, o conhecimento sobre ídolos e refeições em templos precisa ser lido contra o paganismo urbano de Corinto.' },
  { id: 'cultura_costumes', titulo: 'Cultura e costumes do mundo bíblico', categoria: 'contextual', foco: 'costumes, instituições e hábitos cotidianos que eram conhecidos pelos primeiros ouvintes', exemplo: 'Em João 13.1-17, o lava-pés ganha força quando entendido como serviço humilde normalmente reservado a servos.' },
  { id: 'geografia', titulo: 'Elementos geográficos relevantes', categoria: 'contextual', foco: 'lugares, distâncias, rotas, fronteiras e características físicas que influenciam a leitura do texto', exemplo: 'Em João 4.3-10, a passagem por Samaria não é mero detalhe geográfico; ela carrega tensão étnica e missão redentora.' },
  { id: 'estrutura_social', titulo: 'Estruturas sociais, patronato, honra e vergonha', categoria: 'contextual', foco: 'hierarquias, relações de patronato, honra-vergonha, escravidão, família e cidadania presentes no texto', exemplo: 'Em Filemom 8-20, a relação entre Paulo, Filemom e Onésimo deve ser lida à luz da escravidão antiga e das relações de honra.' },
  { id: 'autor', titulo: 'Identidade e perfil do autor', categoria: 'contextual', foco: 'quem escreve, sua autoridade, formação, vocação e relação pastoral com os destinatários', exemplo: 'Em Romanos 1.1-7, Paulo se apresenta como servo, apóstolo e separado para o evangelho, moldando a autoridade da carta.' },
  { id: 'questoes_autoria', titulo: 'Debates acadêmicos sobre autoria', categoria: 'contextual', foco: 'as principais discussões sobre autoria, pseudonímia, secretários, tradição e evidências textuais', exemplo: 'Em 2 Pedro 1.1 e 3.1-2, as declarações internas devem ser consideradas ao avaliar debates modernos sobre autoria petrina.' },
  { id: 'destinatarios', titulo: 'Quem são os destinatários', categoria: 'contextual', foco: 'a comunidade receptora, sua localização, composição religiosa, condição social e relação com o autor', exemplo: 'Em 1 Pedro 1.1, os destinatários são peregrinos dispersos em regiões específicas, o que informa o tema de identidade no exílio.' },
  { id: 'situacao_destinatarios', titulo: 'Situação concreta dos destinatários', categoria: 'contextual', foco: 'crises, sofrimentos, confusões doutrinárias, tentações e necessidades pastorais dos primeiros leitores', exemplo: 'Em Hebreus 10.32-39, a fadiga diante da perseguição ajuda a explicar os avisos e encorajamentos do livro.' },
  { id: 'ocasiao', titulo: 'Ocasião que motivou a escrita', categoria: 'contextual', foco: 'o evento, problema ou necessidade pastoral que parece ter motivado a composição do texto', exemplo: 'Em Judas 3-4, a presença de falsos mestres explica por que a carta exorta a batalhar pela fé entregue aos santos.' },
  { id: 'proposito_declarado', titulo: 'Propósito explicitamente declarado', categoria: 'contextual', foco: 'declarações explícitas do autor sobre por que escreveu e que resposta desejava produzir', exemplo: 'Em João 20.30-31, o autor declara que escreveu para que os leitores creiam que Jesus é o Cristo e tenham vida em seu nome.' },
  { id: 'proposito_implicito', titulo: 'Objetivos implícitos do texto', categoria: 'contextual', foco: 'intenções pastorais, apologéticas, polêmicas ou doxológicas que aparecem pela organização do argumento', exemplo: 'Em Filipenses 2.1-11, mesmo sem uma frase de propósito formal, Paulo busca formar humildade comunitária a partir do padrão de Cristo.' },
  { id: 'genero_livro', titulo: 'Gênero literário do livro', categoria: 'contextual', foco: 'o gênero predominante do livro e as convenções que orientam sua leitura', exemplo: 'Em Salmos 23.1-6, reconhecer poesia impede transformar imagens pastorais em descrições literais e empobrecedoras.' },
  { id: 'genero_pericope', titulo: 'Gênero específico da perícope', categoria: 'contextual', foco: 'a forma literária específica da unidade estudada dentro do livro maior', exemplo: 'Em Lucas 15.11-32, identificar a parábola orienta a buscar a força narrativa principal, não correspondências alegóricas em cada detalhe.' },
  { id: 'implicacoes_hermeneuticas', titulo: 'Regras hermenêuticas do gênero', categoria: 'contextual', foco: 'como o gênero permite, limita e direciona as decisões interpretativas', exemplo: 'Em Apocalipse 12.1-6, o gênero apocalíptico exige atenção a símbolos canônicos antes de leituras jornalísticas do texto.' },
  { id: 'divisoes_principais', titulo: 'Estrutura macro do livro', categoria: 'contextual', foco: 'as divisões principais do livro, seus marcadores e sua progressão literária', exemplo: 'Em Efésios, a transição de 1-3 para 4-6 mostra a passagem da indicativa graça de Deus para a vida digna do chamado.' },
  { id: 'localizacao_pericope', titulo: 'Onde a perícope se situa no livro', categoria: 'contextual', foco: 'a localização da passagem na estrutura maior e sua relação com o que vem antes e depois', exemplo: 'Em Romanos 12.1-2, a perícope se apoia nas misericórdias expostas em Romanos 1-11 e inaugura a seção ética da carta.' },
  { id: 'argumento_livro', titulo: 'Tese central do livro', categoria: 'contextual', foco: 'a tese ou movimento central do livro e a contribuição da perícope para esse todo', exemplo: 'Em Marcos 10.45, o serviço e o resgate oferecidos pelo Filho do Homem condensam a cristologia e o caminho do discipulado em Marcos.' },
  { id: 'limites_pericope', titulo: 'Versículo inicial e final', categoria: 'textual', foco: 'o começo e o fim da unidade literária que será interpretada', exemplo: 'Em Romanos 3.21-26, a expressão "mas agora" marca uma nova unidade argumentativa depois da universalidade do pecado.' },
  { id: 'marcadores_delimitacao', titulo: 'Partículas e conectivos que delimitam', categoria: 'textual', foco: 'marcadores textuais que sinalizam transição, continuidade, contraste ou fechamento', exemplo: 'Em Efésios 2.11, o "portanto" liga a nova seção à salvação pela graça em 2.1-10 e introduz a reconciliação dos gentios.' },
  { id: 'conexao_contexto', titulo: 'Ligação com o contexto imediato', categoria: 'textual', foco: 'a relação da perícope com a unidade anterior e posterior', exemplo: 'Em Mateus 6.19-24, tesouros, olhos e senhores se conectam ao ensino maior sobre piedade diante do Pai.' },
  { id: 'minha_traducao', titulo: 'Tradução própria do original', categoria: 'textual', foco: 'sua tradução de trabalho a partir do hebraico ou grego, com decisões justificadas', exemplo: 'Em Efésios 5.18, traduzir o imperativo "enchei-vos do Espírito" exige preservar a ideia de ação contínua e comunitária.' },
  { id: 'variantes_textuais', titulo: 'Variantes manuscritas relevantes', categoria: 'textual', foco: 'leituras variantes que podem afetar tradução, interpretação ou ênfase', exemplo: 'Em Marcos 16.9-20, a questão do final longo ilustra como crítica textual afeta a delimitação e a pregação responsável.' },
  { id: 'comparacao_versoes', titulo: 'Diferenças entre versões modernas', categoria: 'textual', foco: 'como traduções modernas resolvem dificuldades lexicais, sintáticas ou textuais', exemplo: 'Em Romanos 3.25, comparar "propiciação" e "sacrifício de expiação" mostra decisões teológicas e lexicais importantes.' },
  { id: 'verbos_principais', titulo: 'Verbos principais com análise morfológica', categoria: 'textual', foco: 'os verbos que carregam a ação, ordem, promessa ou argumento do texto', exemplo: 'Em Mateus 28.19-20, o imperativo central "fazei discípulos" governa os particípios de ir, batizar e ensinar.' },
  { id: 'substantivos_casos', titulo: 'Substantivos e seus casos gramaticais', categoria: 'textual', foco: 'substantivos decisivos, seus casos, artigos e relações sintáticas', exemplo: 'Em Efésios 2.8, "graça" e "fé" precisam ser examinadas em sua construção para evitar leituras simplistas do dom de Deus.' },
  { id: 'estrutura_sintatica', titulo: 'Diagrama da estrutura da frase', categoria: 'textual', foco: 'a organização sintática de sujeito, predicado, modificadores e orações subordinadas', exemplo: 'Em Colossenses 1.15-20, mapear a sintaxe do hino ajuda a enxergar a supremacia de Cristo na criação e na redenção.' },
  { id: 'particulas_conectivos', titulo: 'Partículas e conectivos no original', categoria: 'textual', foco: 'partículas como γάρ, δέ, οὖν, כִּי e conectores que organizam a lógica do texto', exemplo: 'Em Romanos 5.1, o "portanto" apresenta a consequência da justificação pela fé desenvolvida nos capítulos anteriores.' },
  { id: 'termo_1', titulo: 'Análise do 1º termo-chave', categoria: 'textual', foco: 'o primeiro termo lexicalmente decisivo da perícope, analisado por definição, uso, contexto e testemunho', exemplo: 'Em Romanos 3.24, "justificados" exige análise lexical e teológica cuidadosa para distinguir declaração forense de transformação moral.' },
  { id: 'termo_2', titulo: 'Análise do 2º termo-chave', categoria: 'textual', foco: 'o segundo termo-chave, especialmente sua contribuição para o argumento local', exemplo: 'Em João 3.16, "mundo" deve ser interpretado no uso joanino e no contexto da missão salvadora de Deus.' },
  { id: 'termo_3', titulo: 'Análise do 3º termo-chave', categoria: 'textual', foco: 'o terceiro termo-chave, com atenção ao campo semântico e ao limite imposto pelo contexto', exemplo: 'Em Gálatas 5.16, "carne" precisa ser lido como esfera de oposição a Deus, não apenas corpo físico.' },
  { id: 'esboço_estrutural', titulo: 'Esboço interno da perícope', categoria: 'textual', foco: 'as subdivisões internas e a progressão da unidade estudada', exemplo: 'Em Salmo 1.1-6, o contraste entre justo e ímpio organiza o esboço e culmina nos dois caminhos diante do Senhor.' },
  { id: 'dispositivos_literarios', titulo: 'Quiasmo, inclusio, paralelismo e outros dispositivos', categoria: 'textual', foco: 'recursos literários que dão ênfase, beleza e estrutura ao texto', exemplo: 'Em Filipenses 2.6-11, o movimento de humilhação e exaltação estrutura a cristologia do hino.' },
  { id: 'analise_narrativa', titulo: 'Narrador, enredo e personagens', categoria: 'textual', foco: 'elementos narrativos como cenário, tensão, personagens, clímax e resolução', exemplo: 'Em Marcos 4.35-41, a tempestade, o medo dos discípulos e a autoridade de Jesus conduzem à pergunta: "Quem é este?".' },
  { id: 'argumento_epistola', titulo: 'Lógica argumentativa da epístola', categoria: 'textual', foco: 'premissas, inferências, exortações e conclusões no argumento epistolar', exemplo: 'Em Romanos 6.1-14, Paulo responde a uma objeção e argumenta que a união com Cristo torna incoerente viver no pecado.' },
  { id: 'contexto_intralivro', titulo: 'Relação com outras passagens do livro', categoria: 'teologico', foco: 'como temas, termos e argumentos reaparecem no mesmo livro', exemplo: 'Em João 15.1-8, a videira deve ser lida junto às imagens de vida, permanência e fruto ao longo do evangelho.' },
  { id: 'citacoes_alusoes_at', titulo: 'Uso do Antigo Testamento pelo autor', categoria: 'teologico', foco: 'citações, alusões e ecos do Antigo Testamento presentes na perícope', exemplo: 'Em Mateus 2.15, Oseias 11.1 é usado para apresentar Jesus como o Filho que recapitula e cumpre a história de Israel.' },
  { id: 'ecos_nt', titulo: 'Paralelos e ecos no Novo Testamento', categoria: 'teologico', foco: 'relações da passagem com outros textos neotestamentários', exemplo: 'Em 1 Pedro 2.9-10, ecos de Êxodo 19 e Oséias se unem a temas que reaparecem em Apocalipse 1.6.' },
  { id: 'posicao_historia_redencao', titulo: 'Lugar na história da redenção', categoria: 'teologico', foco: 'o estágio da revelação redentora em que a passagem se encontra', exemplo: 'Em Êxodo 12.1-14, a Páscoa pertence ao êxodo histórico e também prepara a compreensão cristológica de Cristo como Cordeiro.' },
  { id: 'tipologia', titulo: 'Tipos e antítipos', categoria: 'teologico', foco: 'pessoas, eventos e instituições que apontam organicamente para cumprimento redentor', exemplo: 'Em Números 21.4-9, a serpente levantada é interpretada por Jesus em João 3.14-15 como tipo de sua própria elevação.' },
  { id: 'promessa_cumprimento', titulo: 'Padrão promessa-cumprimento', categoria: 'teologico', foco: 'promessas, antecipações e cumprimentos na progressão canônica', exemplo: 'Em 2 Samuel 7.12-16, a promessa davídica prepara a esperança messiânica cumprida em Cristo, o Filho de Davi.' },
  { id: 'grande_ideia', titulo: 'Grande Ideia exegética', categoria: 'teologico', foco: 'a sentença que une sujeito e complemento para resumir a afirmação central do texto', exemplo: 'Em Romanos 3.21-26, a Grande Ideia pode afirmar que Deus revela sua justiça salvando pecadores pela redenção em Cristo.' },
  { id: 'mensagem_texto', titulo: 'Mensagem central do texto', categoria: 'teologico', foco: 'o que Deus comunica por meio do texto aos destinatários originais e à igreja', exemplo: 'Em Efésios 2.8-10, a mensagem central une graça soberana, fé e boas obras preparadas por Deus.' },
  { id: 'conceito_ensina', titulo: 'Verdade que o texto afirma positivamente', categoria: 'teologico', foco: 'a doutrina, virtude ou realidade que o texto estabelece ou aprofunda', exemplo: 'Em João 10.27-30, o texto ensina a segurança das ovelhas nas mãos do Filho e do Pai.' },
  { id: 'conceitos_confronta', titulo: 'Erros que o texto corrige', categoria: 'teologico', foco: 'falsas crenças, pecados ou distorções que a passagem confronta', exemplo: 'Em Tiago 2.14-26, o texto confronta uma profissão de fé sem fruto obediente.' },
  { id: 'sujeito_homilet', titulo: 'Sujeito do sermão', categoria: 'homiletica', foco: 'a pergunta temática que o sermão inteiro responderá', exemplo: 'Em Salmo 23, o sujeito pode ser: "Como o Senhor pastoreia o seu povo em cada estação da vida?".' },
  { id: 'complemento_homilet', titulo: 'Complemento do sermão', categoria: 'homiletica', foco: 'a resposta completa que o sermão dá ao sujeito', exemplo: 'Para Salmo 23, o complemento pode mostrar que o Senhor guia, sustenta, corrige e recebe seu povo em comunhão segura.' },
  { id: 'grande_ideia_homilet', titulo: 'Grande Ideia Homilética completa', categoria: 'homiletica', foco: 'a formulação pregável, clara e memorável da verdade central', exemplo: 'Em Efésios 2.1-10, uma Grande Ideia Homilética pode ser: "A graça de Deus ressuscita mortos para uma vida de boas obras".' },
  { id: 'proposicao', titulo: 'Proposição proclamatória do sermão', categoria: 'homiletica', foco: 'a afirmação que anuncia o caminho do sermão ao ouvinte', exemplo: 'Em Romanos 8.1-4, a proposição pode declarar: "Este texto nos chama a descansar na condenação removida por Cristo".' },
  { id: 'gancho', titulo: 'Abertura que captura atenção', categoria: 'homiletica', foco: 'a primeira ponte entre a vida do ouvinte e a tensão do texto', exemplo: 'Em Mateus 11.28-30, o gancho pode partir do cansaço moderno para conduzir ao convite de Cristo ao descanso.' },
  { id: 'necessidade', titulo: 'Necessidade concreta do ouvinte', categoria: 'homiletica', foco: 'a dor, dúvida, pecado ou anseio que o texto trata pastoralmente', exemplo: 'Em 1 Pedro 5.6-11, a necessidade pode ser ansiedade sob sofrimento e resistência fiel ao adversário.' },
  { id: 'assunto_intro', titulo: 'Apresentação do assunto antes do texto', categoria: 'homiletica', foco: 'a ponte que nomeia o tema e prepara a leitura bíblica', exemplo: 'Em Lucas 19.1-10, a introdução pode apresentar o tema da graça que busca quem todos desprezam.' },
  { id: 'leitura_texto', titulo: 'Como introduzir a leitura bíblica', categoria: 'homiletica', foco: 'a contextualização mínima e reverente antes da leitura pública', exemplo: 'Antes de ler Neemias 8.1-12, vale situar o povo retornado do exílio e a centralidade da Palavra na renovação da aliança.' },
  { id: 'ponto1', titulo: 'Primeiro ponto principal do sermão', categoria: 'homiletica', foco: 'a primeira divisão textual que inicia o desenvolvimento da Grande Ideia', exemplo: 'Em João 15.1-8, o primeiro ponto pode ancorar-se em Cristo como a videira verdadeira.' },
  { id: 'ponto2', titulo: 'Segundo ponto principal do sermão', categoria: 'homiletica', foco: 'a segunda divisão textual que avança, contrasta ou aprofunda o argumento', exemplo: 'Em João 15.1-8, o segundo ponto pode desenvolver a necessidade de permanecer em Cristo para frutificar.' },
  { id: 'ponto3', titulo: 'Terceiro ponto do sermão', categoria: 'homiletica', foco: 'uma terceira divisão usada somente se o texto realmente a sustenta', exemplo: 'Em João 15.1-8, um terceiro ponto pode tratar da glória do Pai no fruto dos discípulos.' },
  { id: 'avaliacao_estrutura', titulo: 'Avaliação crítica da estrutura', categoria: 'homiletica', foco: 'a revisão da coerência, paralelismo e fidelidade textual dos pontos', exemplo: 'Em Romanos 12.1-2, a estrutura deve mostrar a lógica de consagração, não transformar o texto em três conselhos desconectados.' },
  { id: 'transicao_intro_p1', titulo: 'Transição da introdução para o ponto 1', categoria: 'homiletica', foco: 'a frase ou parágrafo que leva o ouvinte da necessidade inicial ao primeiro movimento do texto', exemplo: 'Em Marcos 2.1-12, a transição pode sair da necessidade de perdão para a autoridade de Jesus revelada no milagre.' },
  { id: 'transicao_1_2', titulo: 'Transição do ponto 1 para o ponto 2', categoria: 'homiletica', foco: 'a conexão lógica que resume o primeiro ponto e abre o segundo', exemplo: 'Em Filipenses 2.5-11, a transição pode mover da humilhação voluntária de Cristo para sua exaltação pelo Pai.' },
  { id: 'transicao_2_3', titulo: 'Transição do ponto 2 para o ponto 3', categoria: 'homiletica', foco: 'a passagem fluida para o terceiro movimento quando ele é necessário', exemplo: 'Em Habacuque 3.17-19, a transição pode mover da perda concreta para a alegria confiante no Deus da salvação.' },
  { id: 'aplicacao_crenca', titulo: 'O que o ouvinte deve crer', categoria: 'homiletica', foco: 'a mudança de convicção exigida pelo texto', exemplo: 'Em Romanos 8.31-39, o ouvinte deve crer que nenhuma acusação ou sofrimento separa os eleitos do amor de Deus em Cristo.' },
  { id: 'aplicacao_pratica', titulo: 'O que o ouvinte deve fazer', categoria: 'homiletica', foco: 'a resposta obediente, concreta e específica à verdade pregada', exemplo: 'Em Tiago 1.19-27, a aplicação prática inclui ouvir com mansidão e praticar a Palavra em ações verificáveis.' },
  { id: 'aplicacao_cristologica', titulo: 'Cristo como centro e motivação', categoria: 'homiletica', foco: 'como a pessoa e obra de Cristo fundamentam a obediência', exemplo: 'Em Efésios 4.32, perdoar é motivado pelo perdão recebido em Cristo, não por mera cordialidade moral.' },
  { id: 'ilustracoes', titulo: 'Histórias e analogias ilustrativas', categoria: 'homiletica', foco: 'imagens, histórias e comparações que tornam a verdade visível sem tomar o lugar do texto', exemplo: 'Em Lucas 15.20, uma ilustração sobre reconciliação familiar pode ajudar, desde que sirva à compaixão do pai na parábola.' },
  { id: 'sintese_final', titulo: 'Síntese do argumento completo', categoria: 'homiletica', foco: 'a retomada breve da Grande Ideia e dos movimentos principais', exemplo: 'Em 1 Coríntios 15.50-58, a síntese deve ligar ressurreição futura, vitória de Cristo e firmeza presente no trabalho do Senhor.' },
  { id: 'apelo', titulo: 'Apelo final à resposta', categoria: 'homiletica', foco: 'o chamado pastoral, bíblico e específico para responder ao texto', exemplo: 'Em Isaías 55.1-7, o apelo deve chamar a vir, ouvir e buscar o Senhor enquanto se pode achar.' },
  { id: 'encerramento', titulo: 'Frase memorável de encerramento', categoria: 'homiletica', foco: 'a última sentença que fixa a verdade central na memória da congregação', exemplo: 'Em Judas 24-25, o encerramento pode deixar o ouvinte com a certeza de que Deus é poderoso para guardar seu povo de tropeçar.' },
  { id: 'nivel_linguagem', titulo: 'Nível de linguagem para o auditório', categoria: 'estilo', foco: 'o registro de linguagem adequado à congregação real que ouvirá o sermão', exemplo: 'Em Romanos 5.1, "justificação" pode ser explicado como o veredito gracioso de Deus que declara o pecador aceito em Cristo.' },
  { id: 'jargao_teologico', titulo: 'Como tratar termos técnicos', categoria: 'estilo', foco: 'termos teológicos indispensáveis e sua explicação clara', exemplo: 'Em 1 João 2.2, "propiciação" pode ser explicado sem diluir a ideia de ira santa satisfeita pela obra de Cristo.' },
  { id: 'clareza_frases', titulo: 'Revisão de clareza e concisão', categoria: 'estilo', foco: 'frases longas, ambíguas ou abstratas que precisam ser reescritas', exemplo: 'Em vez de dizer "a realidade soteriológica paulina se manifesta", em Efésios 2.8 diga: "Deus nos salva pela graça, não pelo mérito".' },
  { id: 'metaforas_analogias', titulo: 'Metáforas que iluminam a verdade', categoria: 'estilo', foco: 'analogias fiéis que ajudam o ouvinte a enxergar o ensino bíblico', exemplo: 'Em Hebreus 6.19, a própria imagem da âncora pode organizar uma metáfora pastoral sobre esperança firme em Cristo.' },
  { id: 'imagens_concretas', titulo: 'Imagens do cotidiano', categoria: 'estilo', foco: 'cenas e objetos familiares que tornam ideias abstratas mais tangíveis', exemplo: 'Em João 10.27-30, a imagem de mãos que guardam comunica segurança sem precisar abandonar a linguagem do texto.' },
  { id: 'recursos_retoricos', titulo: 'Anáfora, antítese, clímax e outros recursos', categoria: 'estilo', foco: 'recursos de linguagem que reforçam a progressão e a persuasão do sermão', exemplo: 'Em Romanos 8.38-39, a repetição de pares opostos inspira uma cadência retórica sobre a inseparabilidade do amor de Deus.' },
  { id: 'tom_geral', titulo: 'Tom predominante do sermão', categoria: 'estilo', foco: 'a atmosfera pastoral dominante exigida pelo texto', exemplo: 'Em Lamentações 3.21-24, o tom deve carregar dor real e esperança perseverante nas misericórdias do Senhor.' },
  { id: 'variacao_tonal', titulo: 'Onde o tom muda', categoria: 'estilo', foco: 'mudanças planejadas entre confronto, consolo, celebração, advertência e convite', exemplo: 'Em 2 Samuel 12.1-13, o tom passa da narrativa indireta ao confronto profético e depois à gravidade do arrependimento.' },
  { id: 'voz_pregador', titulo: 'Equilíbrio entre autoridade e ternura pastoral', categoria: 'estilo', foco: 'a postura verbal do pregador diante do texto e da congregação', exemplo: 'Em Gálatas 6.1-2, a voz precisa corrigir o pecado com mansidão e convocar a comunidade a carregar fardos.' },
  { id: 'esboço_pulpito', titulo: 'Esboço simplificado para o púlpito', categoria: 'memoria', foco: 'uma versão enxuta do sermão para orientar a pregação sem prender o pregador ao manuscrito', exemplo: 'Em Mateus 6.25-34, o esboço de púlpito pode caber em três âncoras: Pai, reino e hoje.' },
  { id: 'palavras_ancora', titulo: 'Palavra-âncora por ponto', categoria: 'memoria', foco: 'palavras ou imagens que acionam a memória de cada movimento do sermão', exemplo: 'Em Salmo 46, âncoras como refúgio, rio e quietude podem lembrar a lógica do salmo.' },
  { id: 'logica_fluxo', titulo: 'Fluxo narrativo do sermão', categoria: 'memoria', foco: 'a história interna do argumento em linguagem simples e memorizável', exemplo: 'Em Lucas 24.13-35, o fluxo pode seguir de esperança frustrada para Escrituras abertas e coração aquecido.' },
  { id: 'plano_pratica', titulo: 'Quando e como praticar', categoria: 'memoria', foco: 'um plano de prática em voz alta, revisão e ajuste antes da pregação', exemplo: 'Para pregar Romanos 8.28-30, pratique especialmente a cadência da cadeia dourada para comunicar segurança sem pressa.' },
  { id: 'pontos_vulneraveis', titulo: 'Onde pode travar', categoria: 'memoria', foco: 'trechos, transições ou argumentos que podem falhar durante a entrega', exemplo: 'Em Hebreus 7.1-10, a explicação de Melquisedeque pode travar se não houver uma frase-ponte clara para a superioridade de Cristo.' },
  { id: 'preparacao_espiritual', titulo: 'Oração e preparo espiritual', categoria: 'memoria', foco: 'o preparo do coração do pregador diante de Deus e da congregação', exemplo: 'Antes de pregar 2 Coríntios 4.7-18, ore para crer na suficiência do poder de Deus em vasos frágeis.' },
  { id: 'projecao_articulacao', titulo: 'Projeção vocal e dicção', categoria: 'entrega', foco: 'volume, clareza, pronúncia e articulação das palavras-chave', exemplo: 'Em Efésios 1.3-14, a longa bênção exige articulação cuidadosa para que a congregação acompanhe a riqueza do período.' },
  { id: 'variacao_ritmo', titulo: 'Aceleração e desaceleração', categoria: 'entrega', foco: 'ritmo vocal que acompanha a tensão, o descanso e o peso do texto', exemplo: 'Em Marcos 5.21-43, o ritmo pode acelerar na urgência de Jairo e desacelerar no encontro com a mulher enferma.' },
  { id: 'enfase_pausas', titulo: 'Pausas dramáticas intencionais', categoria: 'entrega', foco: 'silêncios, repetições e ênfases que ajudam a verdade a assentar', exemplo: 'Em Romanos 8.1, uma pausa após "nenhuma condenação" permite que o peso pastoral da afirmação seja sentido.' },
  { id: 'postura_presenca', titulo: 'Postura no púlpito', categoria: 'entrega', foco: 'presença física, estabilidade e movimento a serviço da mensagem', exemplo: 'Em Neemias 8.1-8, a postura pública diante da Palavra pode comunicar reverência sem teatralidade.' },
  { id: 'gestos', titulo: 'Gestos intencionais e tiques', categoria: 'entrega', foco: 'gestos que reforçam ideias e maneirismos que distraem', exemplo: 'Em 1 Coríntios 13.1-7, gestos abertos podem acompanhar a descrição paciente do amor, evitando movimentos repetitivos que roubem atenção.' },
  { id: 'contato_visual', titulo: 'Distribuição do olhar', categoria: 'entrega', foco: 'contato visual que inclui a congregação e mantém conexão pastoral', exemplo: 'Em Isaías 40.1-11, alternar olhar direto nos imperativos de consolo ajuda a congregação a receber a palavra pastoral.' },
  { id: 'auto_avaliacao', titulo: 'Reflexão pós-pregação', categoria: 'entrega', foco: 'avaliação honesta da fidelidade textual, clareza, aplicação e entrega', exemplo: 'Depois de pregar Atos 2.37-41, avalie se o chamado ao arrependimento foi claro e fundamentado no texto.' },
  { id: 'feedback_recebido', titulo: 'Feedback da congregação', categoria: 'entrega', foco: 'comentários de ouvintes e mentores que revelam como o sermão foi recebido', exemplo: 'Após pregar Filipenses 4.4-9, pergunte se a congregação entendeu a relação entre oração, paz e disciplina da mente.' },
  { id: 'crescimento_continuo', titulo: 'Área de desenvolvimento', categoria: 'entrega', foco: 'uma habilidade específica a ser cultivada nas próximas pregações', exemplo: 'Depois de pregar Provérbios 3.5-6, talvez a área de crescimento seja tornar aplicações sapienciais mais concretas e menos genéricas.' },
]

function stepsFor(seed: HelpSeed): string[] {
  const sharedLast = 'Registre a conclusão em linguagem precisa, indicando como ela servirá à interpretação ou à pregação.'

  if (seed.categoria === 'contextual') {
    return [
      `Defina exatamente que informação contextual você precisa levantar sobre ${seed.foco}.`,
      'Procure evidências internas no próprio livro antes de recorrer a reconstruções históricas externas.',
      'Compare a leitura com comentários, introduções bíblicas e fontes históricas confiáveis.',
      'Explique como esse dado muda, confirma ou limita a interpretação da perícope.',
      sharedLast,
    ]
  }

  if (seed.categoria === 'textual') {
    return [
      `Observe o texto bíblico de perto e marque tudo que contribui para ${seed.foco}.`,
      'Trabalhe a partir do original sempre que possível, distinguindo observação, inferência e conclusão.',
      'Compare sua análise com traduções, gramáticas, léxicos ou comentários técnicos.',
      'Mostre como o detalhe textual sustenta a ideia central da perícope.',
      sharedLast,
    ]
  }

  if (seed.categoria === 'teologico') {
    return [
      `Identifique a contribuição de ${seed.titulo.toLowerCase()} para a mensagem teológica da passagem.`,
      'Conecte a perícope ao livro, ao cânone e à história da redenção sem saltos artificiais.',
      'Distinga doutrina explicitamente ensinada, implicação legítima e aplicação posterior.',
      'Formule a conclusão em termos cristocêntricos e reformados, preservando a intenção do autor bíblico.',
      sharedLast,
    ]
  }

  if (seed.categoria === 'homiletica') {
    return [
      `Comece pela Grande Ideia do texto e pergunte como ${seed.foco} deve servir a essa ideia.`,
      'Escreva uma primeira versão em linguagem falada, clara e direta.',
      'Cheque se a formulação nasce do texto e não de uma preferência temática do pregador.',
      'Inclua explicação, aplicação e orientação pastoral quando o campo exigir desenvolvimento.',
      'Revise para que a congregação saiba o que crer, sentir ou fazer diante de Deus.',
    ]
  }

  if (seed.categoria === 'estilo') {
    return [
      `Leia o trecho do sermão em voz alta e avalie como ${seed.foco} afeta a compreensão.`,
      'Substitua abstrações desnecessárias por palavras concretas e teologicamente fiéis.',
      'Preserve termos doutrinários essenciais, mas explique-os com frases simples.',
      'Ajuste ritmo, imagens e tom à natureza do texto e à condição da congregação.',
      'Corte qualquer frase bonita que não sirva à clareza da verdade bíblica.',
    ]
  }

  if (seed.categoria === 'memoria') {
    return [
      `Reduza o sermão ao seu fluxo essencial, destacando ${seed.foco}.`,
      'Pratique em voz alta sem depender integralmente do manuscrito.',
      'Use âncoras verbais ou visuais para recuperar a sequência dos movimentos.',
      'Teste as transições, pois é nelas que a memória costuma falhar.',
      'Ore o sermão até que ele seja verdade recebida antes de ser mensagem entregue.',
    ]
  }

  return [
    `Observe como ${seed.foco} pode tornar a entrega mais clara, reverente e pastoral.`,
    'Pratique o trecho em voz alta, preferencialmente gravando uma tentativa curta.',
    'Avalie se corpo, voz e ritmo servem ao texto ou chamam atenção para o pregador.',
    'Ajuste um elemento de cada vez para evitar artificialidade.',
    'Após a pregação, registre uma observação concreta para crescimento futuro.',
  ]
}

function questionsFor(seed: HelpSeed): string[] {
  return [
    `O que o texto exige que eu observe antes de concluir algo sobre ${seed.foco}?`,
    'Que evidência bíblica específica sustenta minha resposta?',
    'Como isso ajuda a congregação a entender melhor Cristo, o evangelho e a obediência da fé?',
    'Minha conclusão é clara o suficiente para orientar o próximo passo do estudo ou do sermão?',
  ]
}

function errorsFor(seed: HelpSeed): string[] {
  const byCategory: Record<HelpCategory, string[]> = {
    contextual: [
      'Usar pano de fundo histórico como enfeite, sem mostrar sua relevância para o sentido do texto.',
      'Preferir reconstruções especulativas a evidências internas claras.',
      'Anacronizar o texto, lendo categorias modernas diretamente no mundo bíblico.',
    ],
    textual: [
      'Fazer análise técnica sem conectar o detalhe à mensagem da perícope.',
      'Escolher uma tradução ou variante apenas porque favorece uma ideia prévia.',
      'Confundir possibilidade lexical com sentido contextual provável.',
    ],
    teologico: [
      'Pular direto para doutrina sistemática sem respeitar o argumento da passagem.',
      'Forçar conexões cristológicas sem mediação canônica responsável.',
      'Transformar síntese teológica em frase genérica que poderia servir para qualquer texto.',
    ],
    homiletica: [
      'Criar uma estrutura elegante que não nasce da lógica do texto.',
      'Aplicar por moralismo, sem mostrar Cristo como fundamento e motivação.',
      'Falar de necessidades humanas sem deixar que o texto as defina e cure.',
    ],
    estilo: [
      'Confundir profundidade com linguagem obscura ou jargão não explicado.',
      'Usar imagens fortes que desviam a atenção da verdade bíblica.',
      'Manter um tom incompatível com o próprio movimento pastoral do texto.',
    ],
    memoria: [
      'Tentar decorar palavras exatas sem dominar a lógica do sermão.',
      'Praticar apenas mentalmente, sem testar voz, tempo e transições.',
      'Separar preparação espiritual de preparação técnica.',
    ],
    entrega: [
      'Usar voz, gestos ou pausas como performance desconectada da mensagem.',
      'Ignorar sinais da congregação durante a pregação.',
      'Avaliar a entrega apenas por sensação pessoal, sem feedback específico.',
    ],
  }

  return byCategory[seed.categoria]
}

function advancedTipsFor(seed: HelpSeed): string[] {
  return [
    'Compare sua conclusão com dois comentários de tradições diferentes e registre por que concorda ou discorda.',
    'Separe no seu registro o que é dado textual, inferência provável e aplicação pastoral.',
    `Revise ${seed.titulo.toLowerCase()} depois de formular a Grande Ideia para verificar se tudo converge para a tese do texto.`,
  ]
}

function createHelpEntry(seed: HelpSeed): HelpEntry {
  return {
    id: seed.id,
    titulo: seed.titulo,
    descricao: `${seed.titulo} é o campo em que você registra ${seed.foco}. Ele ajuda a impedir leituras apressadas, mantendo a exegese enraizada no texto, no contexto e na finalidade pastoral da pregação.`,
    objetivo: `O objetivo é transformar ${seed.foco} em uma conclusão útil para interpretar fielmente a passagem e pregá-la com clareza reformada.`,
    comoFazer: stepsFor(seed),
    perguntas: questionsFor(seed),
    erros: errorsFor(seed),
    exemplo: seed.exemplo,
    ajudaIA: `A IA pode sugerir caminhos de pesquisa, organizar evidências e propor uma primeira formulação para ${seed.titulo.toLowerCase()}. Use a resposta como assistente de estudo: confira as referências, refine a linguagem e submeta tudo ao texto bíblico.`,
    dicasAvancadas: advancedTipsFor(seed),
  }
}

function communicationCategory(module: string): HelpCategory {
  if (module === 'inventio' || module === 'dispositio') return 'homiletica'
  if (module === 'elocutio') return 'estilo'
  if (module === 'memoria') return 'memoria'
  return 'entrega'
}

function communicationModeLabel(mode: string | undefined): string {
  if (mode === 'sermao') return 'sermão'
  if (mode === 'estudo_biblico') return 'estudo bíblico'
  if (mode === 'devocional') return 'devocional'
  return 'produção ministerial'
}

function createCommunicationHelpEntry(sectionTitle: string, mode: string | undefined, module: string, cardSeed: { id: string; title: string; placeholder: string }): HelpEntry {
  const modeLabel = communicationModeLabel(mode)
  const seed: HelpSeed = {
    id: cardSeed.id,
    titulo: cardSeed.title,
    categoria: communicationCategory(module),
    foco: `${cardSeed.title.toLowerCase()} dentro do fluxo de ${modeLabel}, considerando a seção ${sectionTitle}`,
    exemplo: `Em Romanos 8.1, esse campo deve ajudar a comunicar a ausência de condenação em Cristo de modo adequado ao formato de ${modeLabel}, seja por proclamação, ensino participativo ou meditação pastoral.`,
  }

  return {
    ...createHelpEntry(seed),
    descricao: `${cardSeed.title} é o campo em que você transforma a exegese em uma decisão concreta para ${modeLabel}. Ele organiza ${cardSeed.placeholder.toLowerCase()} sem perder a conexão com o texto bíblico e com a finalidade pastoral da comunicação.`,
    ajudaIA: `A IA pode agir como mentora de ${modeLabel}, sugerindo formulações, perguntas, exemplos e ajustes de tom para ${cardSeed.title.toLowerCase()}. Revise a resposta para garantir fidelidade ao texto, linguagem natural e coerência com a exegese já construída.`,
  }
}

export const HELP_CONTENT: Record<string, HelpEntry> = HELP_SEEDS.reduce<Record<string, HelpEntry>>((content, seed) => {
  content[seed.id] = createHelpEntry(seed)
  return content
}, {})

COMMUNICATION_SECTIONS.forEach(section => {
  section.cards.forEach(cardSeed => {
    HELP_CONTENT[cardSeed.id] = createCommunicationHelpEntry(section.title, section.communicationMode, section.module, cardSeed)
  })
})
