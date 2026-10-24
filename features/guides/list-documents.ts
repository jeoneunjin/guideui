export type GuideDocumentStatus = 'processing' | 'ready' | 'failed'

export type GuideDocumentListItem = {
  id: string
  name: string
  status: GuideDocumentStatus
  chunks: number | null
  rules: number | null
  modified: string
}

export async function getGuideDocuments(): Promise<GuideDocumentListItem[]> {
  const res = await fetch('/api/guides')
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? '가이드 문서 목록을 불러오지 못했어요.')
  return body as GuideDocumentListItem[]
}
