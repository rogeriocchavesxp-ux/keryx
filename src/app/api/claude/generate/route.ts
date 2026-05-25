import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { EXEGESE_SYSTEM_PROMPT } from '@/lib/prompts/exegese-system'
import { getSectionBySlug } from '@/lib/workspace-sections'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface ProjectContext {
  book: string
  passage_ref: string
  testament: string
  original_language: string
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const { sectionSlug, cardId, project } = await req.json() as {
    sectionSlug: string
    cardId?: string
    project: ProjectContext
  }

  const sectionDef = getSectionBySlug(sectionSlug)
  if (!sectionDef) return Response.json({ error: 'Seção não encontrada' }, { status: 400 })

  const cardsToGenerate = cardId
    ? sectionDef.cards.filter(c => c.id === cardId)
    : sectionDef.cards

  if (cardsToGenerate.length === 0) {
    return Response.json({ error: 'Nenhum campo para gerar' }, { status: 400 })
  }

  const jsonKeys = cardsToGenerate.map(c => `  "${c.id}": "..."`).join(',\n')
  const fieldDescriptions = cardsToGenerate
    .map(c => `- "${c.id}" (${c.title}): ${c.aiTrigger}`)
    .join('\n')

  const userPrompt = `Gere conteúdo exegético para a seção "${sectionDef.title}".

Texto: ${project.book} ${project.passage_ref}
Idioma original: ${project.original_language}
Testamento: ${project.testament === 'NT' ? 'Novo Testamento' : 'Antigo Testamento'}

Campos a gerar:
${fieldDescriptions}

INSTRUÇÕES CRÍTICAS:
- Retorne APENAS JSON válido, sem markdown, sem explicações, sem código
- Cada valor deve ser um parágrafo acadêmico completo em português do Brasil
- Mínimo de 3-5 frases por campo
- Use rigor exegético reformado
- Estrutura exata esperada:

{
${jsonKeys}
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: EXEGESE_SYSTEM_PROMPT + '\n\nIMPORTANTE: Quando solicitado a gerar JSON estruturado, retorne SOMENTE o JSON válido, sem blocos de código, sem markdown, sem texto fora do JSON.',
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    const cleaned = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let parsed: Record<string, string>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return Response.json({ error: 'Resposta inválida da IA', raw: cleaned }, { status: 500 })
    }

    return Response.json(parsed)
  } catch (err) {
    console.error('Claude generate error:', err)
    return Response.json({ error: 'Erro ao chamar a IA' }, { status: 500 })
  }
}
