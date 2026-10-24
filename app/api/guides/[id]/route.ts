import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function DELETE(_req: Request, ctx: RouteContext<'/api/guides/[id]'>) {
  const { id } = await ctx.params

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: '가이드 저장소가 설정돼 있지 않아요.' }, { status: 500 })
  }

  try {
    const { data: doc, error: selectError } = await supabase
      .from('guide_documents')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle()
    if (selectError) throw selectError
    if (!doc) {
      return NextResponse.json({ error: '삭제할 문서를 찾을 수 없어요.' }, { status: 404 })
    }

    // guide_chunks.document_id가 on delete cascade라 문서 행만 지우면 청크도 같이 지워진다.
    const { error: deleteError } = await supabase.from('guide_documents').delete().eq('id', id)
    if (deleteError) throw deleteError

    const { error: removeError } = await supabase.storage.from('guide-documents').remove([doc.storage_path])
    if (removeError) console.error(`Storage 객체 삭제 실패 (${doc.storage_path}):`, removeError)

    return NextResponse.json({ id })
  } catch (error) {
    const message = error instanceof Error ? error.message : '가이드 문서를 삭제하지 못했어요.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
