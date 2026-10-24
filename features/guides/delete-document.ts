export async function deleteGuideDocument(id: string): Promise<void> {
  const res = await fetch(`/api/guides/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json()
    throw new Error(body.error ?? '가이드 문서를 삭제하지 못했어요.')
  }
}
