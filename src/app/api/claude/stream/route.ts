import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { EXEGESE_SYSTEM_PROMPT } from '@/lib/prompts/exegese-system'
import { getSectionBySlug } from '@/lib/workspace-sections'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface OriginalVerseContent {
  ref?: string
  texto?: string
}

async function loadOriginalTextContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string | undefined,
): Promise<string> {
  if (!projectId) return ''

  const { data } = await supabase
    .from('sections')
    .select('content')
    .eq('project_id', projectId)
    .eq('slug', 'texto_original')
    .maybeSingle()

  const content = data?.content as { versos?: OriginalVerseContent[]; passagem?: string } | null
  if (!content) return ''

  if (Array.isArray(content.versos) && content.versos.length > 0) {
    return content.versos
      .filter(verse => verse.texto?.trim())
      .map(verse => `${verse.ref ?? ''} ${verse.texto}`.trim())
      .join('\n')
  }

  return content.passagem?.trim() ?? ''
}

export async function POST(req: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const { messages, project, activeSlug, activeTitle } = body as {
    messages: ChatMessage[]
    project: { id?: string; book: string; passage_ref: string; testament: string; original_language: string }
    activeSlug: string
    activeTitle: string
  }

  if (!messages?.length) {
    return Response.json({ error: 'Mensagens inválidas' }, { status: 400 })
  }

  const sectionDef = getSectionBySlug(activeSlug)
  const modeInstruction = (() => {
    if (sectionDef?.communicationMode === 'sermao') {
      return 'Modo ministerial ativo: Sermão. Responda como mentor homilético: argumentativo, persuasivo, cristocêntrico e voltado à proclamação pública.'
    }
    if (sectionDef?.communicationMode === 'estudo_biblico') {
      return 'Modo ministerial ativo: Estudo Bíblico. Responda como mentor didático: pedagógico, explicativo, interativo e voltado à condução de grupo.'
    }
    if (sectionDef?.communicationMode === 'devocional') {
      return 'Modo ministerial ativo: Devocional. Responda como mentor pastoral: contemplativo, sensível, simples e voltado à formação espiritual.'
    }
    return 'Modo ativo: Interpretação. Responda com rigor exegético, atenção ao texto bíblico e teologia reformada.'
  })()
  const originalTextContext = sectionDef?.group === 'textual' || ['texto_original', '_sintese_textual'].includes(activeSlug)
    ? await loadOriginalTextContext(supabase, project.id)
    : ''

  // Build context prefix for the current section
  const contextNote = `[Projeto atual: ${project.book} ${project.passage_ref} (${project.original_language}) | Seção ativa: ${activeTitle}]\n${modeInstruction}${originalTextContext ? `\n\nTexto original carregado no workspace:\n${originalTextContext}` : ''}`

  const systemWithContext = `${EXEGESE_SYSTEM_PROMPT}\n\n---\n${contextNote}`

  // Convert messages to Anthropic format — inject context into first user message
  const anthropicMessages: Anthropic.MessageParam[] = messages.map((m, i) => ({
    role: m.role,
    content: i === 0 ? `${m.content}` : m.content,
  }))

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: systemWithContext,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: anthropicMessages,
  })

  // Log token usage (non-blocking)
  stream.finalMessage().then(async (msg) => {
    const usage = msg.usage as {
      input_tokens: number
      output_tokens: number
      cache_read_input_tokens?: number
      cache_creation_input_tokens?: number
    }
    await supabase.from('ai_interactions').insert({
      user_id: user.id,
      section_slug: activeSlug,
      mode: 'exegese',
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cached_tokens: usage.cache_read_input_tokens ?? 0,
      model: 'claude-sonnet-4-6',
    }).then(() => {})
  }).catch(() => {})

  // Stream SSE back to client
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            const data = JSON.stringify({ delta: { text: event.delta.text } })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
