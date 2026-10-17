import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { guideFileSchema } from '@/lib/schemas/guide-upload'

async function getOrCreateDemoGuideSetId(supabase: ReturnType<typeof createSupabaseAdminClient>) {
  if (!supabase) return null

  const { data: existing, error: selectError } = await supabase
    .from('guide_sets')
    .select('id')
    .eq('is_demo', true)
    .limit(1)
    .maybeSingle()
  if (selectError) throw selectError
  if (existing) return existing.id as string

  const { data: created, error: insertError } = await supabase
    .from('guide_sets')
    .insert({ name: 'Sample DS', is_demo: true })
    .select('id')
    .single()
  if (insertError) throw insertError
  return created.id as string
}

export async function POST(req: Request) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: '요청 본문이 올바른 form-data가 아니에요.' }, { status: 400 })
  }

  const file = formData.get('file')
  const parsed = guideFileSchema.safeParse(file)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? '파일이 올바르지 않아요.' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: '가이드 저장소가 설정돼 있지 않아요.' }, { status: 500 })
  }

  try {
    const guideSetId = await getOrCreateDemoGuideSetId(supabase)
    if (!guideSetId) {
      return NextResponse.json({ error: '가이드 저장소가 설정돼 있지 않아요.' }, { status: 500 })
    }

    const documentId = crypto.randomUUID()
    const storagePath = `${guideSetId}/${documentId}.md`

    const { error: uploadError } = await supabase.storage
      .from('guide-documents')
      .upload(storagePath, parsed.data, { contentType: 'text/markdown' })
    if (uploadError) throw uploadError

    const { error: insertError } = await supabase.from('guide_documents').insert({
      id: documentId,
      guide_set_id: guideSetId,
      title: parsed.data.name,
      storage_path: storagePath,
      status: 'processing',
    })
    if (insertError) throw insertError

    return NextResponse.json({
      id: documentId,
      name: parsed.data.name,
      status: 'processing',
      modified: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '가이드 문서를 저장하지 못했어요.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
