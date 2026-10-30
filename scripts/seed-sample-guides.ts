/**
 * sample-guide/*.md(README.md 제외)를 데모 guide_set에 업로드·청킹·임베딩까지 돌려서 채운다.
 * 이미 같은 제목의 문서가 있으면 건너뛴다(멱등 — 여러 번 돌려도 안전).
 *
 * npm run guides:seed
 */
try {
  process.loadEnvFile('.env.local')
} catch {
  // .env.local이 없으면(CI 등) 이미 설정된 process.env를 그대로 쓴다.
}

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SAMPLE_GUIDE_DIR = path.join(ROOT, 'sample-guide')

async function main() {
  const { env } = await import('../lib/env')
  const { createSupabaseAdminClient } = await import('../lib/supabase/admin')
  const { getOrCreateDemoGuideSetId } = await import('../lib/rag/demo-guide-set')
  const { processGuideDocument } = await import('../lib/rag/process-document')
  const { guideFileSchema } = await import('../lib/schemas/guide-upload')

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    console.error('가이드 저장소가 설정돼 있지 않아요. .env.local의 SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY를 확인해 주세요.')
    process.exit(1)
  }

  if (env.LLM_PROVIDER === 'mock') {
    console.warn('LLM_PROVIDER=mock이라 가짜 임베딩이 저장돼요. 실제 검색 품질을 보려면 LLM_PROVIDER=gemini로 돌리세요.')
  }

  const guideSetId = await getOrCreateDemoGuideSetId(supabase)
  if (!guideSetId) {
    console.error('데모 guide_set을 만들지 못했어요.')
    process.exit(1)
  }

  const { data: existingDocs, error: existingError } = await supabase
    .from('guide_documents')
    .select('title')
    .eq('guide_set_id', guideSetId)
  if (existingError) throw existingError
  const existingTitles = new Set((existingDocs ?? []).map((doc) => doc.title as string))

  const filenames = (await readdir(SAMPLE_GUIDE_DIR))
    .filter((name) => name.toLowerCase().endsWith('.md') && name !== 'README.md')
    .sort()

  let created = 0
  let skipped = 0
  let failed = 0

  for (const filename of filenames) {
    if (existingTitles.has(filename)) {
      console.log(`건너뜀: ${filename} (이미 있음)`)
      skipped++
      continue
    }

    try {
      const content = await readFile(path.join(SAMPLE_GUIDE_DIR, filename), 'utf8')
      const file = new File([content], filename, { type: 'text/markdown' })
      const parsed = guideFileSchema.parse(file)

      const documentId = crypto.randomUUID()
      const storagePath = `${guideSetId}/${documentId}.md`

      const { error: uploadError } = await supabase.storage
        .from('guide-documents')
        .upload(storagePath, parsed, { contentType: 'text/markdown' })
      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('guide_documents').insert({
        id: documentId,
        guide_set_id: guideSetId,
        title: parsed.name,
        storage_path: storagePath,
        status: 'processing',
      })
      if (insertError) throw insertError

      await processGuideDocument(documentId)

      const { data: finalDoc, error: statusError } = await supabase
        .from('guide_documents')
        .select('status')
        .eq('id', documentId)
        .single()
      if (statusError) throw statusError

      if (finalDoc.status === 'ready') {
        console.log(`생성: ${filename} → ready`)
        created++
      } else {
        console.error(`실패: ${filename} → ${finalDoc.status}`)
        failed++
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`실패: ${filename} → ${message}`)
      failed++
    }
  }

  console.log(`\n완료 — 생성 ${created}개 · 건너뜀 ${skipped}개 · 실패 ${failed}개`)
  if (failed > 0) process.exit(1)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
