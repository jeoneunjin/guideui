import { embedMany } from 'ai'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { GUIDE_EMBEDDING_PROVIDER_OPTIONS, getEmbeddingModel } from '@/lib/llm'
import { chunkMarkdown } from './chunk'

export async function processGuideDocument(documentId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  if (!supabase) return

  try {
    const { data: doc, error: selectError } = await supabase
      .from('guide_documents')
      .select('storage_path')
      .eq('id', documentId)
      .single()
    if (selectError) throw selectError

    const { data: file, error: downloadError } = await supabase.storage
      .from('guide-documents')
      .download(doc.storage_path)
    if (downloadError) throw downloadError

    const chunks = chunkMarkdown(await file.text())
    if (chunks.length === 0) throw new Error('청크를 하나도 만들지 못했어요.')

    const { embeddings } = await embedMany({
      model: getEmbeddingModel(),
      values: chunks.map((c) => `${c.headingPath}\n\n${c.content}`.trim()),
      providerOptions: GUIDE_EMBEDDING_PROVIDER_OPTIONS,
    })

    const { error: insertError } = await supabase.from('guide_chunks').insert(
      chunks.map((chunk, i) => ({
        document_id: documentId,
        heading_path: chunk.headingPath,
        content: chunk.content,
        token_count: chunk.tokenCount,
        embedding: embeddings[i],
      })),
    )
    if (insertError) throw insertError

    await supabase.from('guide_documents').update({ status: 'ready' }).eq('id', documentId)
  } catch (error) {
    console.error(`가이드 문서 처리 실패 (${documentId}):`, error)
    await supabase.from('guide_documents').update({ status: 'failed' }).eq('id', documentId)
  }
}
