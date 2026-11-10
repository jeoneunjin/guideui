import { embed } from 'ai'
import type { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { GUIDE_QUERY_EMBEDDING_PROVIDER_OPTIONS, getEmbeddingModel } from '@/lib/llm'

export type GuideSearchResult = {
  id: number
  documentId: string
  documentTitle: string
  headingPath: string
  content: string
  similarity: number
}

// match_guide_chunks(supabase/migrations/20261110084132_match_guide_chunks.sql)를 호출해
// 질의와 가장 유사한 청크를 찾는다. service-role 클라이언트로만 호출(guide_chunks는 RLS로
// anon/authenticated 접근이 막혀있음, #39 참고) — 호출부가 guideSetId를 넘겨야 하고
// (데모 세트는 lib/rag/demo-guide-set.ts의 findDemoGuideSetId로 구한다), match_threshold
// 튜닝은 이 모듈이 아니라 #51에서 다룬다.
export async function searchGuideChunks(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  guideSetId: string,
  query: string,
  matchCount = 5,
): Promise<GuideSearchResult[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: query,
    providerOptions: GUIDE_QUERY_EMBEDDING_PROVIDER_OPTIONS,
  })

  const { data, error } = await supabase.rpc('match_guide_chunks', {
    query_embedding: embedding,
    filter_guide_set_id: guideSetId,
    match_count: matchCount,
  })
  if (error) throw error

  type MatchGuideChunksRow = {
    id: number
    document_id: string
    document_title: string
    heading_path: string
    content: string
    similarity: number
  }

  return ((data ?? []) as MatchGuideChunksRow[]).map((row) => ({
    id: row.id,
    documentId: row.document_id,
    documentTitle: row.document_title,
    headingPath: row.heading_path,
    content: row.content,
    similarity: row.similarity,
  }))
}
