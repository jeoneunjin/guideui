import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { findDemoGuideSetId } from '@/lib/rag/demo-guide-set'
import { extractRuleIds } from '@/lib/rag/rule-ids'

export async function GET() {
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: '가이드 저장소가 설정돼 있지 않아요.' }, { status: 500 })
  }

  try {
    const guideSetId = await findDemoGuideSetId(supabase)
    if (!guideSetId) return NextResponse.json([])

    const { data: documents, error: documentsError } = await supabase
      .from('guide_documents')
      .select('id, title, status, created_at')
      .eq('guide_set_id', guideSetId)
      .order('created_at', { ascending: false })
    if (documentsError) throw documentsError
    if (documents.length === 0) return NextResponse.json([])

    const documentIds = documents.map((doc) => doc.id as string)
    const { data: chunks, error: chunksError } = await supabase
      .from('guide_chunks')
      .select('document_id, content')
      .in('document_id', documentIds)
    if (chunksError) throw chunksError

    const contentByDocument = new Map<string, string[]>()
    for (const chunk of chunks ?? []) {
      const documentId = chunk.document_id as string
      const list = contentByDocument.get(documentId) ?? []
      list.push(chunk.content as string)
      contentByDocument.set(documentId, list)
    }

    const result = documents.map((doc) => {
      const contents = contentByDocument.get(doc.id as string)
      return {
        id: doc.id,
        name: doc.title,
        status: doc.status,
        chunks: contents ? contents.length : null,
        rules: contents ? extractRuleIds(contents.join('\n\n')).length : null,
        modified: doc.created_at,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '가이드 문서 목록을 불러오지 못했어요.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
