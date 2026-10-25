import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { extractRuleIds } from '@/lib/rag/rule-ids'

export async function GET(_req: Request, ctx: RouteContext<'/api/guides/[id]/chunks'>) {
  const { id } = await ctx.params

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: '가이드 저장소가 설정돼 있지 않아요.' }, { status: 500 })
  }

  try {
    const { data: chunks, error } = await supabase
      .from('guide_chunks')
      .select('id, heading_path, content, token_count')
      .eq('document_id', id)
      .order('id', { ascending: true })
    if (error) throw error

    const result = chunks.map((chunk) => ({
      id: chunk.id,
      path: chunk.heading_path || '본문',
      content: chunk.content,
      tokenCount: chunk.token_count,
      rules: extractRuleIds(chunk.content as string),
    }))

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '청크를 불러오지 못했어요.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
