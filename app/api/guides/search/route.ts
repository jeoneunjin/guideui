import { NextResponse } from 'next/server'
import { streamText } from 'ai'
import { z } from 'zod'
import { getGenerationModel } from '@/lib/llm'
import { buildSearchAnswerPrompt } from '@/lib/search-prompt'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { findDemoGuideSetId } from '@/lib/rag/demo-guide-set'
import { searchGuideChunks } from '@/lib/rag/search'
import { toGuidelineSources, GUIDELINE_SOURCES_HEADER } from '@/lib/rag/guideline-sources'

const SearchRequestSchema = z.object({ question: z.string().min(1) })

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '요청 본문이 올바른 JSON이 아니에요.' }, { status: 400 })
  }

  const parsed = SearchRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { question } = parsed.data
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: '검색 서버가 응답하지 않는 것이 원인이에요.' }, { status: 500 })
  }

  try {
    const guideSetId = await findDemoGuideSetId(supabase)
    if (!guideSetId) {
      return NextResponse.json({ error: '검색 서버가 응답하지 않는 것이 원인이에요.' }, { status: 500 })
    }

    const guidelines = await searchGuideChunks(supabase, guideSetId, question)
    if (guidelines.length === 0) {
      return NextResponse.json({ noResult: true })
    }

    const guidelineSources = toGuidelineSources(guidelines)
    const result = streamText({
      model: getGenerationModel(),
      system: buildSearchAnswerPrompt(guidelines),
      prompt: question,
      abortSignal: req.signal,
    })

    return new Response(result.textStream.pipeThrough(new TextEncoderStream()), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        [GUIDELINE_SOURCES_HEADER]: Buffer.from(JSON.stringify(guidelineSources), 'utf-8').toString('base64'),
      },
    })
  } catch (error) {
    if (req.signal.aborted) {
      return new Response(null, { status: 204 })
    }
    const message = error instanceof Error ? error.message : '검색 서버가 응답하지 않는 것이 원인이에요.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
