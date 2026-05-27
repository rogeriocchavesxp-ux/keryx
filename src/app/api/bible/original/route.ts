import { fetchOriginalText } from '@/lib/original-text'

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      book?: string
      passageRef?: string
      testament?: string
      originalLanguage?: string
    }

    if (!body.book || !body.passageRef || !body.testament || !body.originalLanguage) {
      return Response.json({ error: 'Dados da referência incompletos' }, { status: 400 })
    }

    const verses = await fetchOriginalText({
      book: body.book,
      passageRef: body.passageRef,
      testament: body.testament,
      originalLanguage: body.originalLanguage,
    })

    if (verses.length === 0) {
      return Response.json({ error: 'Nenhum versículo encontrado para a referência informada' }, { status: 404 })
    }

    return Response.json({ verses })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar texto original'
    return Response.json({ error: message }, { status: 500 })
  }
}
