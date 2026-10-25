export type GuideChunkListItem = {
  id: number
  path: string
  content: string
  tokenCount: number
  rules: string[]
}

export async function getGuideChunks(documentId: string): Promise<GuideChunkListItem[]> {
  const res = await fetch(`/api/guides/${documentId}/chunks`)
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? '청크를 불러오지 못했어요.')
  return body as GuideChunkListItem[]
}
