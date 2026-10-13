'use client'

import { useRef } from 'react'
import { useWorkspaceStore } from './workspace-store'
import { createSessionIdResolver } from './session-id-resolver'
import { useCreateSession } from './use-session-mutations'

export function useEnsureSession() {
  const setSessionId = useWorkspaceStore((s) => s.setSessionId)
  const createSession = useCreateSession()
  const resolverRef = useRef<ReturnType<typeof createSessionIdResolver> | null>(null)
  resolverRef.current ??= createSessionIdResolver({
    getSessionId: () => useWorkspaceStore.getState().sessionId,
    setSessionId,
    createSession: () => createSession.mutateAsync(),
  })
  return resolverRef.current
}
