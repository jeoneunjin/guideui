import { NextResponse, after } from 'next/server'
import { streamText } from 'ai'
import { z } from 'zod'
import { getGenerationModel } from '@/lib/llm'
import { buildGenerateSystemPrompt } from '@/lib/generate-prompt'
import { extractCode } from '@/lib/code/extract-code'
import { validateImports } from '@/lib/code/validate-imports'
import { ALLOWED_IMPORT_SOURCES } from '@/lib/code/allowed-imports'
import { logUsage } from '@/lib/usage-log'

const MAX_HISTORY_MESSAGES = 10 // 최근 5턴(사용자+어시스턴트) 정도만 모델에 보냄

function toChunkedStream(text: string, signal: AbortSignal): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  const CHUNK_SIZE = 24
  const DELAY_MS = 20
  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < text.length; i += CHUNK_SIZE) {
        if (signal.aborted) break
        controller.enqueue(encoder.encode(text.slice(i, i + CHUNK_SIZE)))
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
      }
      controller.close()
    },
  })
}

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
    const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES)
    async function callModel(extra: { role: 'assistant' | 'user'; content: string }[] = []) {
      const result = streamText({
        model: getGenerationModel(),
        system: buildGenerateSystemPrompt({ currentCode }),
        messages: [...recentMessages, ...extra],
        abortSignal: req.signal,
      })
      const startedAt = Date.now()
      let ttftMs = 0
      let text = ''
      for await (const delta of result.textStream) {
        if (text === '') ttftMs = Date.now() - startedAt
        text += delta
      }
      const usage = await result.usage
      const tokens = (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
      return { text, ttftMs, tokens }
    }

    let { text, ttftMs, tokens: totalTokens } = await callModel()
    let result = validateImports(extractCode(text))

    if (!result.valid) {
      const feedback =
        result.reason === 'disallowed-import'
          ? `방금 생성한 코드가 허용되지 않은 import를 사용했어요: ${result.disallowed.join(', ')}. ${ALLOWED_IMPORT_SOURCES.join(', ')} 중에서만 import해서 다시 생성해 주세요.`
          : '방금 생성한 코드에 문법 오류가 있어요. 다시 생성해 주세요.'
      const retry = await callModel([
        { role: 'assistant', content: text },
        { role: 'user', content: feedback },
      ])
      text = retry.text
      totalTokens += retry.tokens
      result = validateImports(extractCode(text))
    }

    if (!result.valid) {
      after(() => logUsage({ req, ttftMs, tokens: totalTokens }))
      return NextResponse.json(
        { error: '허용되지 않은 코드가 반복 생성됐어요. 다시 시도해 주세요.', reason: result.reason },
        { status: 422 },
      )
    }

    after(() => logUsage({ req, ttftMs, tokens: totalTokens }))
    return new Response(toChunkedStream(text, req.signal), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    if (req.signal.aborted) {
      return new Response(null, { status: 204 })
    }
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
