'use client'

import { useQuery } from '@tanstack/react-query'
import { getGuideChunks } from './list-chunks'

export function useGuideChunks(documentId: string | null) {
  return useQuery({
    queryKey: ['guide-chunks', documentId],
    queryFn: () => getGuideChunks(documentId as string),
    enabled: documentId !== null,
  })
}
