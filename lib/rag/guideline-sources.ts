import type { GuideSearchResult } from './search'

export type GuidelineSource = {
  id: string // 'G1', 'G2', ...
  documentTitle: string
  headingPath: string
  excerpt: string
}

export const GUIDELINE_SOURCES_HEADER = 'X-Guideline-Sources'
const EXCERPT_MAX_LENGTH = 240

export function toGuidelineSources(results: GuideSearchResult[]): GuidelineSource[] {
  return results.map((r, i) => {
    const trimmed = r.content.trim()
    return {
      id: `G${i + 1}`,
      documentTitle: r.documentTitle,
      headingPath: r.headingPath || '본문',
      excerpt: trimmed.length > EXCERPT_MAX_LENGTH ? `${trimmed.slice(0, EXCERPT_MAX_LENGTH)}…` : trimmed,
    }
  })
}

// 브라우저(chat.tsx)에서만 호출하는 디코더. atob/TextDecoder는 Node 18+에도 있지만
// 실제로 쓰는 건 클라이언트뿐이다.
export function decodeGuidelineSources(encoded: string | null): GuidelineSource[] {
  if (!encoded) return []
  try {
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as GuidelineSource[]
  } catch {
    return []
  }
}
