import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { z } from 'zod'
import { getGenerationModel } from '@/lib/llm'
import { buildGenerateSystemPrompt } from '@/lib/generate-prompt'

const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
      }),
    )
    .min(1),
  currentCode: z.string().optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '요청 본문이 올바른 JSON이 아니에요.' }, { status: 400 })
  }

  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { messages, currentCode } = parsed.data
  try {
    const { text } = await generateText({
      model: getGenerationModel(),
      system: buildGenerateSystemPrompt({ currentCode }),
      messages,
    })
    return NextResponse.json({ text })
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
