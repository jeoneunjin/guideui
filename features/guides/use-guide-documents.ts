'use client'

import { useQuery } from '@tanstack/react-query'
import { getGuideDocuments } from './list-documents'

export function guideDocumentsQueryKey() {
  return ['guide-documents'] as const
}

export function useGuideDocuments(enabled: boolean) {
  return useQuery({
    queryKey: guideDocumentsQueryKey(),
    queryFn: getGuideDocuments,
    enabled,
    refetchInterval: (query) => (query.state.data?.some((doc) => doc.status === 'processing') ? 2000 : false),
  })
}
