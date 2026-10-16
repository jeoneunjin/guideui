import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export type VersionListItem = {
  id: string
  version: number
  kind: 'generate' | 'fix' | 'manual'
  code: string
  a11yScore: number | null
  createdAt: string
}

export async function getVersionList(sessionId: string): Promise<VersionListItem[]> {
  const supabase = createSupabaseBrowserClient()
  if (!supabase) return []

  // component_versions.version엔 unique 제약이 없어서 created_at을 2차 정렬로 둬서 동률을 깬다.
  const { data, error } = await supabase
    .from('component_versions')
    .select('id, version, kind, code, a11y_score, created_at')
    .eq('session_id', sessionId)
    .order('version', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id as string,
    version: row.version as number,
    kind: row.kind as VersionListItem['kind'],
    code: row.code as string,
    a11yScore: row.a11y_score as number | null,
    createdAt: row.created_at as string,
  }))
}

export function getDefaultDiffVersions(versions: VersionListItem[]): { base: number | null; target: number | null } {
  if (versions.length === 0) return { base: null, target: null }
  const target = versions[0].version
  const base = versions[1]?.version ?? versions[0].version
  return { base, target }
}
