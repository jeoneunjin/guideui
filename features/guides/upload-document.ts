export type UploadedGuideDocument = {
  id: string
  name: string
  status: 'processing'
  modified: string
}

export async function uploadGuideDocument({
  file,
  replaceDocumentId,
}: {
  file: File
  replaceDocumentId?: string
}): Promise<UploadedGuideDocument> {
  const formData = new FormData()
  formData.append('file', file)
  if (replaceDocumentId) formData.append('documentId', replaceDocumentId)

  const res = await fetch('/api/guides/upload', { method: 'POST', body: formData })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? '가이드 문서를 올리지 못했어요.')

  return body as UploadedGuideDocument
}
