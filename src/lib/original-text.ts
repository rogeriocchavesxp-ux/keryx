export interface OriginalTextRequest {
  book: string
  passageRef: string
  testament: string
  originalLanguage: string
}

export interface OriginalVerse {
  verse: number
  original: string
  transliteration: string
  userTranslation: string
  notes: string
}

interface ParsedReference {
  bookCode: string
  chapterStart: number
  verseStart: number
  chapterEnd: number
  verseEnd: number
}

interface OriginsVerse {
  reference: string
  chapter: number
  verse: number
  text: string
}

interface OriginsChapter {
  chapter: number
  verses: Array<Omit<OriginsVerse, 'chapter'>>
}

const BOOK_CODES: Record<string, string> = {
  genesis: 'GEN',
  genese: 'GEN',
  'gênesis': 'GEN',
  gn: 'GEN',
  exodo: 'EXO',
  'êxodo': 'EXO',
  ex: 'EXO',
  levitico: 'LEV',
  'levítico': 'LEV',
  lv: 'LEV',
  numeros: 'NUM',
  'números': 'NUM',
  nm: 'NUM',
  deuteronomio: 'DEU',
  'deuteronômio': 'DEU',
  dt: 'DEU',
  josue: 'JOS',
  'josué': 'JOS',
  js: 'JOS',
  juizes: 'JDG',
  'juízes': 'JDG',
  jz: 'JDG',
  rute: 'RUT',
  rt: 'RUT',
  '1samuel': '1SA',
  '1 samuel': '1SA',
  '2samuel': '2SA',
  '2 samuel': '2SA',
  '1reis': '1KI',
  '1 reis': '1KI',
  '2reis': '2KI',
  '2 reis': '2KI',
  '1cronicas': '1CH',
  '1 crônicas': '1CH',
  '2cronicas': '2CH',
  '2 crônicas': '2CH',
  esdras: 'EZR',
  neemias: 'NEH',
  ester: 'EST',
  jo: 'JOB',
  'jó': 'JOB',
  salmos: 'PSA',
  salmo: 'PSA',
  sl: 'PSA',
  proverbios: 'PRO',
  'provérbios': 'PRO',
  pv: 'PRO',
  eclesiastes: 'ECC',
  ec: 'ECC',
  cantares: 'SNG',
  canticos: 'SNG',
  'cânticos': 'SNG',
  isaias: 'ISA',
  'isaías': 'ISA',
  is: 'ISA',
  jeremias: 'JER',
  jr: 'JER',
  lamentacoes: 'LAM',
  'lamentações': 'LAM',
  lm: 'LAM',
  ezequiel: 'EZK',
  ez: 'EZK',
  daniel: 'DAN',
  dn: 'DAN',
  oseias: 'HOS',
  'oséias': 'HOS',
  os: 'HOS',
  joel: 'JOL',
  jl: 'JOL',
  amos: 'AMO',
  'amós': 'AMO',
  am: 'AMO',
  obadias: 'OBA',
  ob: 'OBA',
  jonas: 'JON',
  jn: 'JON',
  miqueias: 'MIC',
  mq: 'MIC',
  naum: 'NAM',
  habacuque: 'HAB',
  hc: 'HAB',
  sofonias: 'ZEP',
  sf: 'ZEP',
  ageu: 'HAG',
  ag: 'HAG',
  zacarias: 'ZEC',
  zc: 'ZEC',
  malaquias: 'MAL',
  ml: 'MAL',
  mateus: 'MAT',
  mt: 'MAT',
  marcos: 'MRK',
  mc: 'MRK',
  lucas: 'LUK',
  lc: 'LUK',
  joao: 'JHN',
  'joão': 'JHN',
  atos: 'ACT',
  at: 'ACT',
  romanos: 'ROM',
  rm: 'ROM',
  '1corintios': '1CO',
  '1 coríntios': '1CO',
  '1 corintios': '1CO',
  '2corintios': '2CO',
  '2 coríntios': '2CO',
  '2 corintios': '2CO',
  galatas: 'GAL',
  'gálatas': 'GAL',
  gl: 'GAL',
  efesios: 'EPH',
  'efésios': 'EPH',
  ef: 'EPH',
  filipenses: 'PHP',
  fp: 'PHP',
  colossenses: 'COL',
  cl: 'COL',
  '1tessalonicenses': '1TH',
  '1 tessalonicenses': '1TH',
  '2tessalonicenses': '2TH',
  '2 tessalonicenses': '2TH',
  '1timoteo': '1TI',
  '1 timóteo': '1TI',
  '1 timoteo': '1TI',
  '2timoteo': '2TI',
  '2 timóteo': '2TI',
  '2 timoteo': '2TI',
  tito: 'TIT',
  tt: 'TIT',
  filemom: 'PHM',
  fm: 'PHM',
  hebreus: 'HEB',
  hb: 'HEB',
  tiago: 'JAS',
  tg: 'JAS',
  '1pedro': '1PE',
  '1 pedro': '1PE',
  '2pedro': '2PE',
  '2 pedro': '2PE',
  '1joao': '1JN',
  '1 joão': '1JN',
  '1 joao': '1JN',
  '2joao': '2JN',
  '2 joão': '2JN',
  '2 joao': '2JN',
  '3joao': '3JN',
  '3 joão': '3JN',
  '3 joao': '3JN',
  judas: 'JUD',
  apocalipse: 'REV',
  ap: 'REV',
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

function getBookCode(book: string): string {
  const compact = normalize(book).replace(/\s+/g, '')
  const spaced = normalize(book)
  const code = BOOK_CODES[spaced] ?? BOOK_CODES[compact]
  if (!code) throw new Error(`Livro não reconhecido: ${book}`)
  return code
}

export function parsePassageReference(book: string, passageRef: string): ParsedReference {
  const bookCode = getBookCode(book)
  const normalized = passageRef
    .trim()
    .replace(/[–—]/g, '-')
    .replace(/:/g, '.')
    .replace(/\s+/g, '')

  const match = normalized.match(/^(\d+)(?:\.(\d+))?(?:-(?:(\d+)\.)?(\d+))?$/)
  if (!match) throw new Error(`Referência inválida: ${passageRef}`)

  const chapterStart = Number(match[1])
  const verseStart = Number(match[2] ?? '1')
  const chapterEnd = Number(match[3] ?? match[1])
  const verseEnd = Number(match[4] ?? match[2] ?? verseStart)

  if (!chapterStart || !verseStart || !chapterEnd || !verseEnd) {
    throw new Error(`Referência incompleta: ${passageRef}`)
  }

  return { bookCode, chapterStart, verseStart, chapterEnd, verseEnd }
}

function translationFor(testament: string, originalLanguage: string): 'wlc' | 'tr' {
  const language = originalLanguage.toLowerCase()
  if (testament === 'AT' || language.includes('hebr')) return 'wlc'
  return 'tr'
}

function verseInRange(verse: OriginsVerse, reference: ParsedReference): boolean {
  if (verse.chapter < reference.chapterStart || verse.chapter > reference.chapterEnd) return false
  if (verse.chapter === reference.chapterStart && verse.verse < reference.verseStart) return false
  if (verse.chapter === reference.chapterEnd && verse.verse > reference.verseEnd) return false
  return true
}

export async function fetchOriginalText(request: OriginalTextRequest): Promise<OriginalVerse[]> {
  const parsed = parsePassageReference(request.book, request.passageRef)
  const translation = translationFor(request.testament, request.originalLanguage)
  const chapters = Array.from(
    { length: parsed.chapterEnd - parsed.chapterStart + 1 },
    (_, index) => parsed.chapterStart + index,
  )

  const chapterResults = await Promise.all(chapters.map(async chapter => {
    const url = `https://bible-${translation}.originsapi.com/${parsed.bookCode}.${chapter}.json`
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      throw new Error(`Não foi possível buscar ${parsed.bookCode}.${chapter} (${translation})`)
    }

    const data = await response.json() as OriginsChapter
    return data.verses.map(verse => ({ ...verse, chapter: data.chapter }))
  }))

  return chapterResults
    .flat()
    .filter(verse => verseInRange(verse, parsed))
    .map(verse => ({
      verse: verse.verse,
      original: verse.text,
      transliteration: '',
      userTranslation: '',
      notes: '',
    }))
}
