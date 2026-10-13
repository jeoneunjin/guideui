'use client'

import { useQuery } from '@tanstack/react-query'
import { getVersionList } from './version-list'

export function versionListQueryKey(sessionId: string) {
  return ['component-versions', sessionId] as const
}

export function useVersionList(sessionId: string | null) {
  return useQuery({
    queryKey: versionListQueryKey(sessionId ?? ''),
    queryFn: () => getVersionList(sessionId as string),
    enabled: !!sessionId,
  })
}
